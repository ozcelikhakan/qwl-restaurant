import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDto, ReservationStatus } from '../../core/models/reservation.models';
import { FloorPlanComponent } from '../../shared/components/floor-plan/floor-plan.component';

type Status = 'pending' | 'confirmed' | 'cancelled';

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: Status;
  message: string;
}

// Maps reservation DTO data to the local reservation model
function mapDto(r: ReservationDto): Reservation {
  return {
    id:      r.id,
    name:    r.fullName,
    email:   r.email,
    phone:   r.phone,
    date:    r.reservationDate.substring(0, 10),
    time:    r.reservationTime.substring(0, 5),
    guests:  r.personCount,
    table:   r.tableNumber ?? '',
    status:  r.status === ReservationStatus.Confirmed ? 'confirmed'
           : r.status === ReservationStatus.Cancelled ? 'cancelled'
           : 'pending',
    message: r.message ?? '',
  };
}

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe, FloorPlanComponent],
  templateUrl: './admin-reservations.component.html',
})
export class AdminReservationsComponent implements OnInit {
  // Inject reservation service to load and manage reservations
  private svc = inject(ReservationService);

  // Reservation page state
  reservations = signal<Reservation[]>([]);
  loading      = signal(true);
  error        = signal('');
  search       = signal('');
  statusFilter = signal<Status | 'all'>('all');
  dateFilter   = signal('');
  selected     = signal<Reservation | null>(null);

  // ── Floor plan ───────────────────────────────────────────────
  activeView       = signal<'list' | 'plan'>('list');
  planDate         = signal('');
  planTime         = signal('');
  planOccupied     = signal<string[]>([]);
  planLoading      = signal(false);

  // Loads occupied tables for the selected date and time
  loadPlan(): void {
    if (!this.planDate() || !this.planTime()) return;
    this.planLoading.set(true);
    this.svc.getOccupiedTables(this.planDate(), this.planTime() + ':00').subscribe({
      next:  labels => { this.planOccupied.set(labels);  this.planLoading.set(false); },
      error: ()     => { this.planOccupied.set([]);       this.planLoading.set(false); },
    });
  }

  // Reservation status filter tabs
  statusTabs: { key: Status | 'all'; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'pending',   label: 'Pending'   },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  // Filters reservations by status, date, name, or email
  filtered = computed(() => {
    const q  = this.search().toLowerCase();
    const sf = this.statusFilter();
    const df = this.dateFilter();
    return this.reservations().filter(r =>
      (sf === 'all' || r.status === sf) &&
      (!df || r.date === df) &&
      (!q  || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  });

  // Calculates reservation counts by status
  counts = computed(() => {
    const all = this.reservations();
    return {
      all:       all.length,
      pending:   all.filter(r => r.status === 'pending').length,
      confirmed: all.filter(r => r.status === 'confirmed').length,
      cancelled: all.filter(r => r.status === 'cancelled').length,
    };
  });

  // Loads all reservations when the component is initialized
  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.reservations.set(list.map(mapDto));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Reservations could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  // Updates reservation status
  setStatus(id: number, status: Status): void {
    const apiStatus = status === 'confirmed' ? ReservationStatus.Confirmed
                    : status === 'cancelled' ? ReservationStatus.Cancelled
                    : ReservationStatus.Pending;
    this.svc.updateStatus(id, apiStatus).subscribe({
      next: () => {
        this.reservations.update(list => list.map(r => r.id === id ? { ...r, status } : r));
        if (this.selected()?.id === id) this.selected.update(r => r ? { ...r, status } : r);
      }
    });
  }

  // Deletes a reservation
  delete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => {
        this.reservations.update(list => list.filter(r => r.id !== id));
        if (this.selected()?.id === id) this.selected.set(null);
      }
    });
  }

  // Returns the display label for reservation status
  statusLabel(s: Status): string {
    return s === 'confirmed' ? 'Confirmed' : s === 'pending' ? 'Pending' : 'Cancelled';
  }

  // Returns the CSS class for reservation status
  statusClass(s: Status): string {
    return s === 'confirmed' ? 'bg-green-100 text-green-700'
         : s === 'pending'   ? 'bg-amber-100 text-amber-700'
                             : 'bg-red-100 text-red-600';
  }
}