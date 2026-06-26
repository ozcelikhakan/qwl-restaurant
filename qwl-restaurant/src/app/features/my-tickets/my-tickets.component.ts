import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { EventService } from '../../core/services/event.service';
import { EventTicketDto } from '../../core/models/event.models';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [RouterLink, PageBannerComponent],
  templateUrl: './my-tickets.component.html',
})
export class MyTicketsComponent implements OnInit {
  // Inject event service to fetch the user's tickets
  private eventSvc = inject(EventService);

  // Stores the user's ticket list
  tickets  = signal<EventTicketDto[]>([]);

  // Controls the loading state while tickets are being fetched
  loading  = signal(true);

  // Stores the error message if tickets cannot be loaded
  error    = signal('');

  // Breadcrumb items displayed in the page banner
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'My Tickets' },
  ];

  // Fetch user's tickets when the component is initialized
  ngOnInit(): void {
    this.eventSvc.getMyTickets().subscribe({
      next: list => {
        this.tickets.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Tickets could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  // Format ticket date for display
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}