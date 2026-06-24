import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'About Us' }
  ];

  /**
   * Counter statistics displayed on the about page.
   */
  counters = [
    { icon: 'pi-heart', value: '25.000+', label: 'Daily Meals' },
    { icon: 'pi-users', value: '56.000+', label: 'Happy Customers' },
    { icon: 'pi-star', value: '15+', label: 'Years of Experience' },
    { icon: 'pi-map-marker', value: '3', label: 'Branches' }
  ];

  /**
   * Team members displayed in the chefs section.
   */
  teamMembers = [
    { img: 'assets/images/team/team-1.jpg', name: 'Mark Angelila', role: 'Head Chef' },
    { img: 'assets/images/team/team-2.jpg', name: 'Angel Meskat', role: 'Pastry Chef' },
    { img: 'assets/images/team/team-3.jpg', name: 'Jon Doe', role: 'Sous Chef' },
    { img: 'assets/images/team/team-4.jpg', name: 'Angel Di Maria', role: 'Grill Chef' },
    { img: 'assets/images/team/team-5.jpg', name: 'Park Ji Sung', role: 'Sushi Chef' }
  ];

  /**
   * Customer testimonials displayed in the testimonial slider.
   */
  testimonials = [
    {
      text: 'The evening I spent at OWL Restaurant was one of the best dining experiences of my life. Both the ambiance and the flavors were excellent.',
      name: 'Ayşe Yılmaz',
      role: 'Businessperson'
    },
    {
      text: 'The special menu presented by the chefs was truly outstanding. Every plate was a work of art. I will definitely come back again.',
      name: 'Mehmet Kaya',
      role: 'Gastronomy Writer'
    },
    {
      text: 'I celebrated my birthday here and the team showed incredible care. Thank you for the atmosphere and the food!',
      name: 'Zeynep Arslan',
      role: 'Teacher'
    }
  ];

  /**
   * Stores the currently active testimonial index.
   */
  activeTestimonial = signal(0);

  /**
   * Shows the previous testimonial.
   * If the current testimonial is the first one, it loops back to the last testimonial.
   */
  prevTestimonial(): void {
    this.activeTestimonial.update(
      value => (value - 1 + this.testimonials.length) % this.testimonials.length
    );
  }

  /**
   * Shows the next testimonial.
   * If the current testimonial is the last one, it loops back to the first testimonial.
   */
  nextTestimonial(): void {
    this.activeTestimonial.update(
      value => (value + 1) % this.testimonials.length
    );
  }
}