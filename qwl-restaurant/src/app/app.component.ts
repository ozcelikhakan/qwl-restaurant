import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent],
  template: `
    <!-- Preloader displayed while the application is loading -->
    <div class="preloader" [class.hidden]="!loading">
      <div class="spinner"></div>
    </div>

    <!-- Navbar is hidden on admin routes -->
    @if (!isAdminRoute()) {
      <app-navbar />
    }

    <!-- Main router outlet where page components are rendered -->
    <main>
      <router-outlet />
    </main>

    <!-- Footer is hidden on admin routes -->
    @if (!isAdminRoute()) {
      <app-footer />
    }

    <!-- Authentication modal is displayed when auth modal state is active -->
    @if (auth.showAuthModal()) {
      <app-auth-modal />
    }

    <!-- Scroll-to-top button is hidden on admin routes -->
    @if (!isAdminRoute()) {
      <button class="scroll-top"
              [class.visible]="showScrollTop"
              (click)="scrollToTop()"
              aria-label="Scroll to top">
        <i class="pi pi-chevron-up"></i>
      </button>
    }
  `
})
export class AppComponent {
  /**
   * Injects the authentication service.
   * Used to control the authentication modal state.
   */
  auth = inject(AuthService);

  /**
   * Injects the Angular router.
   * Used to detect route changes.
   */
  router = inject(Router);

  /**
   * Controls the initial preloader visibility.
   */
  loading = true;

  /**
   * Controls the visibility of the scroll-to-top button.
   */
  showScrollTop = false;

  /**
   * Tracks whether the current route is an admin route.
   * Navbar, footer and scroll-to-top button are hidden on admin pages.
   */
  isAdminRoute = signal(false);

  constructor() {
    /**
     * Hides the preloader after a short delay.
     */
    setTimeout(() => this.loading = false, 600);

    /**
     * Shows the scroll-to-top button after the user scrolls down.
     */
    window.addEventListener('scroll', () => {
      this.showScrollTop = window.scrollY > 400;
    });

    /**
     * Listens to route changes and checks whether the current route starts with /admin.
     */
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      }
    });
  }

  /**
   * Smoothly scrolls the page back to the top.
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}