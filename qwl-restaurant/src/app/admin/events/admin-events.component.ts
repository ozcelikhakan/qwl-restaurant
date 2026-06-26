import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { EventDto, CreateEventDto } from '../../core/models/event.models';

type EventStatus = 'upcoming' | 'happening' | 'expired';

interface AdminEvent {
  id: number;
  img: string;
  day: string;
  month: string;
  year: string;
  title: string;
  venue: string;
  desc: string;
  status: EventStatus;
  ticketPrice: number;
  totalSlots: number;
  bookedSlots: number;
  startTime: string;
  endTime: string;
}

// Month abbreviations used for event date display and form selection
const MONTH_ABBRS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTH_TO_IDX: Record<string, number> = Object.fromEntries(MONTH_ABBRS.map((m, i) => [m, i]));

// Maps event DTO data to the local admin event model
function mapDto(e: EventDto): AdminEvent {
  const d = new Date(e.eventDate);
  return {
    id:          e.id,
    img:         e.imageUrl ?? '',
    day:         String(d.getDate()).padStart(2, '0'),
    month:       MONTH_ABBRS[d.getMonth()],
    year:        String(d.getFullYear()),
    title:       e.title,
    venue:       e.location ?? '',
    desc:        e.description,
    status:      e.status.toLowerCase() as EventStatus,
    ticketPrice: e.ticketPrice,
    totalSlots:  e.totalSlots,
    bookedSlots: e.bookedSlots,
    startTime:   e.startTime?.substring(0, 5) ?? '19:00',
    endTime:     e.endTime?.substring(0, 5)   ?? '22:00',
  };
}

// Returns the default empty event form data
const emptyForm = (): Omit<AdminEvent, 'id'> => ({
  img: '', day: '', month: '', year: '', title: '', venue: '', desc: '',
  status: 'upcoming', ticketPrice: 0, totalSlots: 0, bookedSlots: 0, startTime: '19:00', endTime: '22:00',
});

// Event status labels displayed in the UI
const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming:  'Upcoming',
  happening: 'Happening',
  expired:   'Expired',
};

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-events.component.html',
})
export class AdminEventsComponent implements OnInit {
  // Inject event service to load and manage events
  private svc = inject(EventService);

  // Event page state
  events       = signal<AdminEvent[]>([]);
  loading      = signal(true);
  error        = signal('');
  statusFilter = signal<EventStatus | 'all'>('all');
  modalOpen    = signal(false);
  editingId    = signal<number | null>(null);
  form         = signal(emptyForm());

  // Event status filter options
  statusOptions: { key: EventStatus | 'all'; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'upcoming',  label: 'Upcoming'  },
    { key: 'happening', label: 'Happening' },
    { key: 'expired',   label: 'Expired'   },
  ];

  // Month options used in the event form
  monthOptions = MONTH_ABBRS;

  // Filters events by selected status
  filtered = computed(() => {
    const f = this.statusFilter();
    return f === 'all' ? this.events() : this.events().filter(e => e.status === f);
  });

  // Calculates event counts by status
  counts = computed(() => ({
    all:       this.events().length,
    upcoming:  this.events().filter(e => e.status === 'upcoming').length,
    happening: this.events().filter(e => e.status === 'happening').length,
    expired:   this.events().filter(e => e.status === 'expired').length,
  }));

  // Loads all events when the component is initialized
  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.events.set(list.map(mapDto));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Events could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  // Returns the display label for event status
  statusLabel(s: EventStatus): string { return STATUS_LABELS[s]; }

  // Returns the CSS class for event status
  statusClass(s: EventStatus): string {
    return s === 'upcoming'  ? 'bg-blue-100 text-blue-700'
         : s === 'happening' ? 'bg-green-100 text-green-700'
                             : 'bg-gray-100 text-gray-500';
  }

  // Opens the modal for creating a new event
  openAdd(): void {
    this.editingId.set(null);
    this.form.set(emptyForm());
    this.modalOpen.set(true);
  }

  // Opens the modal for editing an existing event
  openEdit(ev: AdminEvent): void {
    this.editingId.set(ev.id);
    this.form.set({ ...ev });
    this.modalOpen.set(true);
  }

  // Saves a new event or updates the selected event
  save(): void {
    const f = this.form();
    if (!f.title.trim()) return;
    const monthIdx = MONTH_TO_IDX[f.month] ?? 0;
    const dto: CreateEventDto = {
      title:       f.title,
      description: f.desc,
      imageUrl:    f.img || null,
      eventDate:   new Date(Number(f.year), monthIdx, Number(f.day)).toISOString(),
      startTime:   f.startTime.length === 5 ? f.startTime + ':00' : f.startTime,
      endTime:     f.endTime.length   === 5 ? f.endTime   + ':00' : f.endTime,
      location:    f.venue || null,
      ticketPrice: f.ticketPrice,
      totalSlots:  f.totalSlots,
    };
    const id = this.editingId();
    if (id) {
      this.svc.update(id, dto).subscribe({
        next: updated => {
          this.events.update(list => list.map(e => e.id === id ? mapDto(updated) : e));
          this.modalOpen.set(false);
        }
      });
    } else {
      this.svc.create(dto).subscribe({
        next: created => {
          this.events.update(list => [...list, mapDto(created)]);
          this.modalOpen.set(false);
        }
      });
    }
  }

  // Deletes an event
  delete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => this.events.update(list => list.filter(e => e.id !== id))
    });
  }

  // Updates a single field in the event form
  updateField(field: keyof ReturnType<typeof emptyForm>, value: string | number): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }
}