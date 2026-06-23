import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Represents a navigation link used in the navbar.
 */
interface NavLink {
  /**
   * Display text of the navigation link.
   */
  label: string;

  /**
   * Router path of the navigation link.
   */
  path: string;

  /**
   * Defines whether the route should match exactly.
   * Useful for the home page route.
   */
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  /**
   * Injects the authentication service.
   * Used for login modal, logout and user state.
   */
  auth = inject(AuthService);

  /**
   * Tracks whether the navbar should become sticky after scrolling.
   */
  isSticky = signal(false);

  /**
   * Tracks whether the mobile menu is open.
   */
  mobileOpen = signal(false);

  /**
   * Tracks whether the user dropdown menu is open.
   */
  dropdownOpen = signal(false);

  /**
   * Social media links displayed in the navbar.
   */
  socials = [
    { icon: 'pi-facebook', url: '#' },
    { icon: 'pi-twitter', url: '#' },
    { icon: 'pi-instagram', url: '#' },
  ];

  /**
   * Main navigation links displayed in the navbar.
   */
  navLinks: NavLink[] = [
    { label: 'Home', path: '/', exact: true },
    { label: 'About Us', path: '/about' },
    { label: 'Menu', path: '/menu' },
    { label: 'Events', path: '/events' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  /**
   * Listens to the window scroll event.
   * Makes the navbar sticky after the user scrolls more than 80px.
   */
  @HostListener('window:scroll')
  onScroll(): void {
    this.isSticky.set(window.scrollY > 80);
  }

  /**
   * Listens to document click events.
   * Closes the user dropdown when the user clicks outside of it.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-dropdown-wrap')) {
      this.dropdownOpen.set(false);
    }
  }

  /**
   * Opens or closes the mobile navigation menu.
   */
  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  /**
   * Closes the mobile navigation menu.
   */
  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  /**
   * Opens or closes the user dropdown menu.
   */
  toggleDropdown(): void {
    this.dropdownOpen.update(value => !value);
  }

  /**
   * Opens the authentication modal and closes the mobile menu.
   */
  openLogin(): void {
    this.closeMobile();
    this.auth.openAuthModal();
  }

  /**
   * Logs out the current user and closes the dropdown menu.
   */
  logout(): void {
    this.auth.logout();
    this.dropdownOpen.set(false);
  }
}