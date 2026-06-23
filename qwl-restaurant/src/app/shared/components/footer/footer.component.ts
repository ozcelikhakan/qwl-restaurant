import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  /**
   * Gets the current year dynamically.
   * Used in the footer copyright text.
   */
  currentYear = new Date().getFullYear();

  /**
   * Social media links displayed in the footer.
   * Each item contains a PrimeIcons icon class and a target URL.
   */
  socials = [
    { icon: 'pi-facebook', url: '#' },
    { icon: 'pi-twitter', url: '#' },
    { icon: 'pi-instagram', url: '#' },
  ];

  /**
   * Footer navigation links.
   * These links use Angular Router paths.
   */
  exploreLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Menu', path: '/menu' },
    { label: 'Events', path: '/events' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  /**
   * Restaurant working hours displayed in the footer.
   */
  workingHours = [
    { days: 'Monday – Friday', time: '09:00 – 22:00' },
    { days: 'Saturday', time: '10:00 – 23:00' },
    { days: 'Sunday', time: '11:00 – 21:00' },
  ];
}