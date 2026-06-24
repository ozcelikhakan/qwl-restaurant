import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  /**
   * Injects the contact service.
   * Used to send contact form messages to the API.
   */
  private contactService = inject(ContactService);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Contact' }
  ];

  /**
   * Contact information cards displayed on the contact page.
   */
  infoCards = [
    {
      icon: 'pi-map-marker',
      title: 'Address',
      lines: ['Bağcılar Street No: 42', 'Bağcılar, Istanbul']
    },
    {
      icon: 'pi-phone',
      title: 'Phone',
      lines: ['+90 212 000 00 00', '+90 532 000 00 00']
    },
    {
      icon: 'pi-envelope',
      title: 'Email',
      lines: ['info@qwlrestaurant.com', 'reservation@qwlrestaurant.com']
    },
    {
      icon: 'pi-clock',
      title: 'Working Hours',
      lines: ['Mon – Fri: 12:00 – 23:00', 'Weekend: 11:00 – 24:00']
    },
  ];

  /**
   * Contact form model.
   */
  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  /**
   * Tracks whether the contact message was sent successfully.
   */
  submitted = signal(false);

  /**
   * Tracks whether the contact form is currently being submitted.
   */
  submitting = signal(false);

  /**
   * Stores contact form submission error messages.
   */
  submitError = signal('');

  /**
   * Sends the contact form message.
   */
  onSubmit(): void {
    this.submitError.set('');
    this.submitting.set(true);

    this.contactService.send({
      fullName: this.form.name,
      email: this.form.email,
      phone: null,
      subject: this.form.subject,
      message: this.form.message,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('Your message could not be sent. Please try again.');
      },
    });
  }

  /**
   * Resets the contact form and clears submission state.
   */
  resetForm(): void {
    this.form = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };

    this.submitted.set(false);
    this.submitError.set('');
  }
}