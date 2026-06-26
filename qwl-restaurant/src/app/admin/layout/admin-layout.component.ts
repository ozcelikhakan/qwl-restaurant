import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-owl-dark text-white flex flex-col fixed h-full z-40">
        <div class="p-6 border-b border-gray-700">
          <span class="font-cursive text-3xl text-owl-primary">OWL</span>
          <p class="text-xs text-gray-400 mt-1">Admin Panel</p>

          <!-- Logged-in admin user information -->
          <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
            <div class="w-8 h-8 rounded-full bg-owl-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
              @if (auth.user()?.avatarUrl) {
                <img [src]="auth.user()!.avatarUrl" alt="Avatar" class="w-full h-full object-cover">
              } @else {
                <i class="pi pi-user text-white text-xs"></i>
              }
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ auth.user()?.firstName ?? 'Admin' }} {{ auth.user()?.lastName ?? '' }}
              </p>
              <p class="text-xs text-gray-400 truncate">{{ auth.user()?.email ?? 'admin&#64;qwlrestaurant.com' }}</p>
            </div>
          </div>
        </div>

        <!-- Admin navigation menu -->
        <nav class="flex-1 py-4">
          <ul class="space-y-1 px-3">
            @for (item of navItems; track item.path) {
              <li>
                <a [routerLink]="item.path" routerLinkActive="bg-owl-primary text-white"
                   [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                   class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
                  <i [class]="'pi ' + item.icon"></i>
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- Profile settings and logout area -->
        <div class="p-4 border-t border-gray-700 space-y-1">
          <a routerLink="/admin/profile" routerLinkActive="bg-gray-700 text-white"
             class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <i class="pi pi-cog"></i>
            Profile Settings
          </a>
          <button (click)="logout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white w-full transition-colors rounded hover:bg-gray-700">
            <i class="pi pi-sign-out"></i>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 ml-64 p-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  // Inject authentication service to access user data and logout method
  auth   = inject(AuthService);

  // Inject router to redirect the user after logout
  router = inject(Router);

  // Sidebar navigation items
  navItems = [
    { label: 'Dashboard', path: '/admin', icon: 'pi-home', exact: true },
    { label: 'Reservations', path: '/admin/reservations', icon: 'pi-calendar' },
    { label: 'Events', path: '/admin/events', icon: 'pi-star' },
    { label: 'Menu', path: '/admin/menu', icon: 'pi-list' },
    { label: 'Blog', path: '/admin/blogs', icon: 'pi-file-edit' },
    { label: 'Messages', path: '/admin/messages', icon: 'pi-envelope' },
  ];

  // Logs out the current user and redirects to the home page
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}