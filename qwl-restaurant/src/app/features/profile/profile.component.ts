import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, PageBannerComponent],
  template: `
    <!-- Page banner -->
    <app-page-banner
      title="My Profile"
      bgImage="assets/images/event/event_details_page_barner_bg.jpg"
      [breadcrumbs]="breadcrumbs">
    </app-page-banner>

    <!-- Profile section -->
    <section class="section-pad bg-white">
      <div class="container mx-auto px-6 max-w-3xl">

        <!-- Profile card -->
        <div class="bg-white border border-gray-100 shadow-sm p-8">

          <!-- User information header -->
          <div class="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
            @if (info.avatarUrl) {
              <!-- User avatar image -->
              <img [src]="info.avatarUrl" alt="Avatar"
                   class="w-20 h-20 rounded-full object-cover border-2 border-owl-primary">
            } @else {
              <!-- Default avatar icon -->
              <div class="w-20 h-20 rounded-full bg-owl-primary flex items-center justify-center flex-shrink-0">
                <i class="pi pi-user text-white text-3xl"></i>
              </div>
            }
            <div>
              <h2 class="font-heading text-xl text-owl-dark">{{ info.firstName }} {{ info.lastName }}</h2>
              <p class="text-sm text-owl-text mt-1">{{ info.email }}</p>
              <span class="inline-block mt-2 px-3 py-1 text-xs bg-gray-100 text-owl-text uppercase tracking-wider">Member</span>
            </div>
          </div>

          <!-- Update form title -->
          <h3 class="font-heading text-sm text-owl-dark uppercase tracking-wider mb-5">Update My Information</h3>

          <!-- Profile update form -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- First name field -->
              <div>
                <label class="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                <input type="text" [(ngModel)]="info.firstName" name="firstName"
                       class="w-full border border-gray-200 px-4 py-2.5 text-sm text-owl-dark focus:border-owl-primary focus:outline-none transition-colors">
              </div>

              <!-- Last name field -->
              <div>
                <label class="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                <input type="text" [(ngModel)]="info.lastName" name="lastName"
                       class="w-full border border-gray-200 px-4 py-2.5 text-sm text-owl-dark focus:border-owl-primary focus:outline-none transition-colors">
              </div>
            </div>

            <!-- Phone field -->
            <div>
              <label class="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input type="tel" [(ngModel)]="info.phone" name="phone"
                     class="w-full border border-gray-200 px-4 py-2.5 text-sm text-owl-dark placeholder-gray-400 focus:border-owl-primary focus:outline-none transition-colors"
                     placeholder="Your phone number">
            </div>

            <!-- Profile image URL field -->
            <div>
              <label class="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Profile Image URL</label>
              <input type="url" [(ngModel)]="info.avatarUrl" name="avatarUrl"
                     class="w-full border border-gray-200 px-4 py-2.5 text-sm text-owl-dark placeholder-gray-400 focus:border-owl-primary focus:outline-none transition-colors"
                     placeholder="https://example.com/avatar.jpg">
            </div>

            <!-- Save button and feedback messages -->
            <div class="flex items-center gap-3 pt-2">
              <button (click)="save()"
                      class="bg-owl-primary text-white text-xs font-medium uppercase tracking-widest px-8 py-3 hover:bg-owl-dark transition-colors">
                Save
              </button>
              @if (saved()) {
                <span class="flex items-center gap-1.5 text-xs text-green-600">
                  <i class="pi pi-check-circle"></i> Information updated
                </span>
              }
              @if (error()) {
                <span class="flex items-center gap-1.5 text-xs text-red-500">
                  <i class="pi pi-times-circle"></i> {{ error() }}
                </span>
              }
            </div>
          </div>
        </div>

      </div>
    </section>
  `
})
export class ProfileComponent {
  // Authentication service instance
  auth = inject(AuthService);

  // Success message state
  saved = signal(false);

  // Error message state
  error = signal('');

  // Breadcrumb items for the page banner
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'My Profile' }
  ];

  // Profile form data
  info = {
    firstName: this.auth.user()?.firstName ?? '',
    lastName:  this.auth.user()?.lastName  ?? '',
    email:     this.auth.user()?.email     ?? '',
    phone:     '',
    avatarUrl: this.auth.user()?.avatarUrl ?? '',
  };

  // Save updated profile information
  save(): void {
    this.error.set('');
    this.auth.updateProfile({
      firstName: this.info.firstName,
      lastName:  this.info.lastName,
      phone:     this.info.phone || undefined,
      avatarUrl: this.info.avatarUrl || undefined,
    }).subscribe({
      next: () => {
        this.saved.set(true);

        // Hide success message after 3 seconds
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.error.set('Update failed.'),
    });
  }
}