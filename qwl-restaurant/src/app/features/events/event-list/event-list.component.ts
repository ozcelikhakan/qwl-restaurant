import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBannerComponent, BreadcrumbItem } from '../../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { EventService } from '../../../core/services/event.service';
import { EventDto } from '../../../core/models/event.models';

/**
 * Represents an event item used by the event list page UI.
 */
export interface OWLEvent {
  id: number;
  img: string;
  day: string;
  month: string;
  year: string;
  title: string;
  venue: string;
  desc: string;
  status: 'upcoming' | 'happening' | 'expired';
  dto?: EventDto;
}

/**
 * English month abbreviations used in event date badges.
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
  'assets/images/event/event_5.jpg',
];

/**
 * Maps the API event DTO into the local UI event model.
 */
function mapDto(dto: EventDto, index: number): OWLEvent {
  const date = new Date(dto.eventDate);

  /**
   * Converts backend event status into local UI status values.
   */
  const status = dto.status === 'Upcoming'
    ? 'upcoming'
    : dto.status === 'Happening'
      ? 'happening'
      : 'expired';

  return {
    id: dto.id,
    img: dto.imageUrl ?? EVENT_IMGS[index % EVENT_IMGS.length],
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTH_ABBRS[date.getMonth()],
    year: String(date.getFullYear()),
    title: dto.title,
    venue: dto.location ?? 'QWL Restaurant',
    desc: dto.description,
    status,
    dto,
  };
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent implements OnInit {
  /**
   * Injects the event service.
   * Used to fetch events from the API.
   */
  private eventService = inject(EventService);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Events' }
  ];

  /**
   * Controls the loading state of the event list page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when events cannot be loaded.
   */
  error = signal('');

  /**
   * Stores all events mapped for the UI.
   */
  events = signal<OWLEvent[]>([]);

  /**
   * Event filter tabs displayed on the page.
   */
  tabs = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'happening', label: 'Happening' },
    { key: 'expired', label: 'Past' }
  ];

  /**
   * Stores the currently selected event filter tab.
   */
  activeTab = signal('all');

  /**
   * Returns events filtered by the active tab.
   * If the active tab is "all", all events are returned.
   */
  filteredEvents = computed(() => {
    const tab = this.activeTab();

    return tab === 'all'
      ? this.events()
      : this.events().filter(event => event.status === tab);
  });

  /**
   * Loads events from the API when the component is initialized.
   */
  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: events => {
        this.events.set(events.map((event, index) => mapDto(event, index)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Events could not be loaded.');
        this.loading.set(false);
      }
    });
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