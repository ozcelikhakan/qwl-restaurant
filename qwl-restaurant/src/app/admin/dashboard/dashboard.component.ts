import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ReservationService } from '../../core/services/reservation.service';
import { ContactService } from '../../core/services/contact.service';
import { EventService } from '../../core/services/event.service';
import { MenuService } from '../../core/services/menu.service';
import { ReservationDto, ReservationStatus } from '../../core/models/reservation.models';
import { ContactMessageDto } from '../../core/models/contact.models';

type ResStatus = 'pending' | 'confirmed' | 'cancelled';

interface ResSummary {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: ResStatus;
}

interface MsgSummary {
  id: number;
  name: string;
  subject: string;
  date: string;
  read: boolean;
}

// Maps reservation DTO data to dashboard reservation summary format
function mapReservation(r: ReservationDto): ResSummary {
  return {
    id:     r.id,
    name:   r.fullName,
    date:   (r.reservationDate as string).substring(0, 10),
    time:   (r.reservationTime as string).substring(0, 5),
    guests: r.personCount,
    status: r.status === ReservationStatus.Confirmed ? 'confirmed'
          : r.status === ReservationStatus.Cancelled ? 'cancelled'
          : 'pending',
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  // Inject services used to load dashboard data
  private resSvc     = inject(ReservationService);
  private contactSvc = inject(ContactService);
  private eventSvc   = inject(EventService);
  private menuSvc    = inject(MenuService);

  // Current date values used in the dashboard
  today    = new Date();
  todayStr = new Date().toISOString().substring(0, 10);

  // Controls dashboard loading state
  loading  = signal(true);

  // Dashboard data signals
  reservations = signal<ResSummary[]>([]);
  messages     = signal<MsgSummary[]>([]);
  eventCount   = signal(0);
  menuCount    = signal(0);

  // Computed dashboard summaries
  recentReservations = computed(() => this.reservations().slice(0, 6));
  recentMessages     = computed(() => this.messages().slice(0, 5));
  todayCount         = computed(() => this.reservations().filter(r => r.date === this.todayStr).length);
  unreadCount        = computed(() => this.messages().filter(m => !m.read).length);

  // Statistic cards displayed on the dashboard
  stats = computed(() => [
    { label: "Today's Reservations", value: this.todayCount(),  icon: 'pi-calendar',   color: 'bg-blue-500',    link: '/admin/reservations' },
    { label: 'Pending Messages',     value: this.unreadCount(), icon: 'pi-envelope',   color: 'bg-amber-500',   link: '/admin/messages'     },
    { label: 'Active Events',        value: this.eventCount(),  icon: 'pi-star',       color: 'bg-owl-primary', link: '/admin/events'       },
    { label: 'Menu Items',           value: this.menuCount(),   icon: 'pi-list',       color: 'bg-green-500',   link: '/admin/menu'         },
  ]);

  // Quick access links displayed at the bottom of the dashboard
  quickLinks = [
    { label: 'Reservations', icon: 'pi-calendar',  path: '/admin/reservations', desc: 'Manage table reservations' },
    { label: 'Messages',     icon: 'pi-envelope',  path: '/admin/messages',     desc: 'View incoming messages'    },
    { label: 'Events',       icon: 'pi-star',      path: '/admin/events',       desc: 'Add and edit events'        },
    { label: 'Menu',         icon: 'pi-list',      path: '/admin/menu',         desc: 'Update menu items'          },
    { label: 'Blog',         icon: 'pi-file-edit', path: '/admin/blogs',        desc: 'Manage blog posts'          },
  ];

  // Load all dashboard data when the component is initialized
  ngOnInit(): void {
    forkJoin({
      reservations: this.resSvc.getAll(),
      messages:     this.contactSvc.getAll(),
      events:       this.eventSvc.getAll(),
      items:        this.menuSvc.getItems(),
    }).subscribe({
      next: ({ reservations, messages, events, items }) => {
        this.reservations.set(reservations.map(mapReservation));
        this.messages.set(messages.map((m: ContactMessageDto) => ({
          id:      m.id,
          name:    m.fullName,
          subject: m.subject,
          date:    m.createdAt.substring(0, 10),
          read:    m.isRead,
        })));
        this.eventCount.set(events.length);
        this.menuCount.set(items.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Returns the display label for reservation status
  statusLabel(s: ResStatus): string {
    return s === 'confirmed' ? 'Confirmed' : s === 'pending' ? 'Pending' : 'Cancelled';
  }

  // Returns the CSS class for reservation status
  statusClass(s: ResStatus): string {
    return s === 'confirmed'
      ? 'bg-green-100 text-green-700'
      : s === 'pending'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-600';
  }
}