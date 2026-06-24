import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageBannerComponent, BreadcrumbItem } from '../../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { OWLEvent } from '../event-list/event-list.component';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { EventDto } from '../../../core/models/event.models';

/**
 * English month abbreviations used in the event date badge.
 */
const MONTH_ABBRS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Default event images used when an event does not have an image.
 */
const EVENT_IMGS = [
  'assets/images/event/event_1.jpg',
  'assets/images/event/event_2.jpg',
  'assets/images/event/event_3.jpg',
  'assets/images/event/event_4.jpg',
  'assets/images/event/event_5.jpg'
];

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [PageBannerComponent, ScrollAnimateDirective, DecimalPipe],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  /**
   * Injects the authentication service.
   * Used to check login state and get current user information.
   */
  private auth = inject(AuthService);

  /**
   * Injects the event service.
   * Used to fetch event details and buy tickets.
   */
  private eventService = inject(EventService);

  /**
   * Injects the active route.
   * Used to read the event ID from the route parameters.
   */
  private route = inject(ActivatedRoute);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'Details' }
  ];

  /**
   * Controls the loading state of the detail page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when the event cannot be loaded.
   */
  error = signal('');

  /**
   * Stores the currently loaded event.
   */
  event = signal<OWLEvent | null>(null);

  /**
   * Stores the selected ticket quantity.
   */
  ticketQty = signal(1);

  /**
   * Stores the selected event time.
   */
  selectedTime = signal('19:00');

  /**
   * Stores the countdown values until the event date.
   */
  countdown = signal({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  /**
   * Tracks whether the event date has already passed.
   */
  isPast = signal(false);

  /**
   * Tracks whether the current user has successfully booked a ticket.
   */
  booked = signal(false);

  /**
   * Stores ticket purchase error messages.
   */
  bookingError = signal('');

  /**
   * Stores the total capacity of the event.
   */
  capacity = signal(0);

  /**
   * Stores the number of already sold tickets.
   */
  sold = signal(0);

  /**
   * Calculates the remaining ticket count.
   */
  remaining = computed(() => this.capacity() - this.sold());

  /**
   * Stores the ticket price.
   */
  ticketPrice = signal(0);

  /**
   * Calculates the total ticket price based on selected quantity.
   */
  total = computed(() => this.ticketQty() * this.ticketPrice());

  /**
   * Stores the current event ID.
   * Used when buying tickets.
   */
  private currentEventId = 0;

  /**
   * Available time slots displayed on the event detail page.
   */
  timeSlots = ['18:00', '19:00', '20:00', '21:00'];

  /**
   * Static event detail feature list.
   */
  eventDetails = [
    'Special tasting menu and chef presentation',
    'Live music performance',
    'Local and international wine selections',
    'Unlimited refreshments throughout the event',
    'Commemorative photo shooting',
    'Post-event networking cocktail',
  ];

  /**
   * Static event tags displayed on the detail page.
   */
  tags = ['Food', 'Event', 'Entertainment', 'Taste'];

  /**
   * Static participant list displayed on the event detail page.
   */
  participants = signal([
    { img: 'assets/images/team/team-1.jpg', name: 'Ahmet Yıldız', role: 'Head Chef', isUser: false },
    { img: 'assets/images/team/team-2.jpg', name: 'Selin Kaya', role: 'Pastry Chef', isUser: false },
    { img: 'assets/images/team/team-3.jpg', name: 'Murat Demir', role: 'Sommelier', isUser: false },
    { img: 'assets/images/team/team-4.jpg', name: 'Elif Şahin', role: 'Organizer', isUser: false },
    { img: 'assets/images/team/team-5.jpg', name: 'Can Öztürk', role: 'Musician', isUser: false },
  ]);

  /**
   * Decreases selected ticket quantity.
   * The quantity cannot go below 1.
   */
  decreaseQty(): void {
    this.ticketQty.update(value => value > 1 ? value - 1 : 1);
  }

  /**
   * Increases selected ticket quantity.
   * The quantity cannot exceed the remaining ticket count.
   */
  increaseQty(): void {
    this.ticketQty.update(value => value < this.remaining() ? value + 1 : this.remaining());
  }

  /**
   * Buys tickets for the current event.
   * If the user is not logged in, the authentication modal is opened.
   */
  buyTicket(): void {
    this.bookingError.set('');

    if (!this.auth.isLoggedIn()) {
      this.auth.openAuthModal();
      return;
    }

    if (this.ticketQty() > this.remaining()) {
      this.bookingError.set(`Only ${this.remaining()} tickets are left.`);
      return;
    }

    this.eventService.buyTicket({
      eventId: this.currentEventId,
      quantity: this.ticketQty()
    }).subscribe({
      next: () => {
        const user = this.auth.user()!;
        const fullName = `${user.firstName} ${user.lastName}`.trim();

        /**
         * Adds the current user to the participant list after a successful booking.
         */
        this.participants.update(list => [
          ...list,
          {
            img: user.avatarUrl ?? '',
            name: fullName,
            role: 'Participant',
            isUser: true
          }
        ]);

        /**
         * Updates sold ticket count and booking state.
         */
        this.sold.update(value => value + this.ticketQty());
        this.booked.set(true);
      },
      error: () => {
        this.bookingError.set('Ticket purchase failed. Please try again.');
      },
    });
  }

  /**
   * Stores the countdown interval timer.
   */
  private timer?: ReturnType<typeof setInterval>;

  /**
   * Loads event detail data when the component is initialized.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.currentEventId = id;

    this.eventService.getById(id).subscribe({
      next: (dto: EventDto) => {
        const date = new Date(dto.eventDate);

        /**
         * Converts backend event status into local UI status values.
         */
        const status = dto.status === 'Upcoming'
          ? 'upcoming'
          : dto.status === 'Happening'
            ? 'happening'
            : 'expired';

        /**
         * Maps the API event DTO into the local UI event model.
         */
        const owlEvent: OWLEvent = {
          id: dto.id,
          img: dto.imageUrl ?? EVENT_IMGS[(id - 1) % EVENT_IMGS.length],
          day: String(date.getDate()).padStart(2, '0'),
          month: MONTH_ABBRS[date.getMonth()],
          year: String(date.getFullYear()),
          title: dto.title,
          venue: dto.location ?? 'QWL Restaurant',
          desc: dto.description,
          status,
          dto,
        };

        this.event.set(owlEvent);
        this.capacity.set(dto.totalSlots);
        this.sold.set(dto.bookedSlots);
        this.ticketPrice.set(dto.ticketPrice);

        /**
         * Uses the event start time if it exists.
         */
        if (dto.startTime) {
          this.selectedTime.set(dto.startTime.substring(0, 5));
        }

        this.startCountdown(date);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Event not found.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Clears the countdown timer when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Starts the countdown timer for the event date.
   */
  private startCountdown(eventDate: Date): void {
    const tick = () => {
      const diff = eventDate.getTime() - Date.now();

      if (diff <= 0) {
        this.isPast.set(true);
        this.countdown.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        if (this.timer) {
          clearInterval(this.timer);
        }

        return;
      }

      this.countdown.set({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };

    tick();
    this.timer = setInterval(tick, 1000);
  }

  /**
   * Returns the display label for an event status.
   */
  statusLabel(status: string): string {
    return status === 'upcoming'
      ? 'Upcoming'
      : status === 'happening'
        ? 'Happening'
        : 'Ended';
  }

  /**
   * Returns the CSS class for an event status badge.
   */
  statusClass(status: string): string {
    return status === 'upcoming'
      ? 'bg-green-600'
      : status === 'happening'
        ? 'bg-owl-primary'
        : 'bg-gray-400';
  }
}