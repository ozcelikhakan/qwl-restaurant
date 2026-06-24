import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

/**
 * Represents a hero slider item.
 */
interface Slide {
  bg: string;
  sub: string;
  title: string;
  titleHighlight: string;
  ctaLabel: string;
  ctaLink: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // ── Hero Slider ──────────────────────────────────

  /**
   * Stores the currently active slide index.
   */
  currentSlide = signal(0);

  /**
   * Stores the slider interval timer.
   * It is cleared when the component is destroyed.
   */
  private slideTimer?: ReturnType<typeof setInterval>;

  /**
   * Static hero slider content.
   */
  slides: Slide[] = [
    {
      bg: 'assets/images/slider/slide_1.jpg',
      sub: 'Welcome',
      title: 'OWL',
      titleHighlight: 'Cafe & Restaurant',
      ctaLabel: 'Book a Table',
      ctaLink: '/reservation'
    },
    {
      bg: 'assets/images/slider/slide_2.jpg',
      sub: 'Our Menu',
      title: 'What Is',
      titleHighlight: 'On Today?',
      ctaLabel: 'View Menu',
      ctaLink: '/menu'
    },
    {
      bg: 'assets/images/slider/slide_3.jpg',
      sub: 'Are You Ready?',
      title: 'Join',
      titleHighlight: 'Us',
      ctaLabel: 'Reserve a Table',
      ctaLink: '/reservation'
    }
  ];

  // ── Menu Filter ───────────────────────────────────

  /**
   * Stores the currently selected menu filter key.
   */
  activeFilter = signal('all');

  /**
   * Menu category filters displayed on the home page.
   */
  filters = [
    { key: 'all', label: 'All' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'coffee', label: 'Coffee' },
    { key: 'snacks', label: 'Snacks' }
  ];

  /**
   * Static menu items displayed on the home page.
   */
  staticMenuItems = [
    { img: 'assets/images/menu/menu_1.jpg', name: 'Cupcake Recipe', price: 120, category: 'breakfast' },
    { img: 'assets/images/menu/menu_2.jpg', name: 'Grilled Chicken', price: 180, category: 'dinner' },
    { img: 'assets/images/menu/menu_3.jpg', name: 'Eggs Benedict', price: 95, category: 'breakfast' },
    { img: 'assets/images/menu/menu_4.jpg', name: 'Special Burger', price: 160, category: 'lunch' },
    { img: 'assets/images/menu/menu_5.jpg', name: 'Filter Coffee', price: 55, category: 'coffee' },
    { img: 'assets/images/menu/menu_6.jpg', name: 'Avocado Toast', price: 110, category: 'breakfast' },
    { img: 'assets/images/menu/menu_7.jpg', name: 'Pasta e Fagioli', price: 145, category: 'lunch' },
    { img: 'assets/images/menu/menu_8.jpg', name: 'Tiramisù', price: 75, category: 'dinner' }
  ];

  /**
   * Returns filtered menu items based on the active category.
   * If the selected filter is "all", all menu items are returned.
   */
  get filteredMenu() {
    const filter = this.activeFilter();

    return filter === 'all'
      ? this.staticMenuItems
      : this.staticMenuItems.filter(item => item.category === filter);
  }

  // ── Events ────────────────────────────────────────

  /**
   * Static event cards displayed on the home page.
   */
  staticEvents = [
    {
      img: 'assets/images/event/event_1.jpg',
      day: '22',
      month: 'December',
      title: 'Special Gala Night 2024',
      date: 'December 22, 2024',
      location: '196 Istanbul, TR',
      desc: 'You are invited to the biggest gala night of the year. Live music, a special menu and unforgettable moments await you.'
    },
    {
      img: 'assets/images/event/event_2.jpg',
      day: '05',
      month: 'January',
      title: 'New Year Brunch Party',
      date: 'January 5, 2025',
      location: '196 Istanbul, TR',
      desc: 'Celebrate the first brunch of the new year with us. Open buffet, champagne and live performance.'
    }
  ];

  // ── Team ──────────────────────────────────────────

  /**
   * Static team member list displayed in the team carousel.
   */
  teamMembers = [
    { img: 'assets/images/team/team-1.jpg', name: 'Mark Angelila', role: 'Head Chef' },
    { img: 'assets/images/team/team-2.jpg', name: 'Angel Meskat', role: 'Pastry Chef' },
    { img: 'assets/images/team/team-3.jpg', name: 'Jon Doe', role: 'Sous Chef' },
    { img: 'assets/images/team/team-4.jpg', name: 'Angel Di Maria', role: 'Grill Chef' },
    { img: 'assets/images/team/team-5.jpg', name: 'Park Ji Sung', role: 'Sushi Chef' }
  ];

  /**
   * Stores the starting index of the visible team members.
   */
  teamIndex = signal(0);

  /**
   * Returns four visible team members for the carousel.
   * The list loops from the beginning when it reaches the end.
   */
  get visibleTeam() {
    const all = this.teamMembers;
    const index = this.teamIndex();
    const result = [];

    for (let i = 0; i < 4; i++) {
      result.push(all[(index + i) % all.length]);
    }

    return result;
  }

  // ── Blog ─────────────────────────────────────────

  /**
   * Static blog cards displayed on the home page.
   */
  staticBlogs = [
    {
      img: 'assets/images/blog/blog-1.jpg',
      tag: 'Lifestyle',
      title: 'The Meeting Point of Restaurant Culture and Modern Culinary Art',
      date: 'February 24, 2024',
      comments: 5,
      slug: 'restaurant-culture'
    },
    {
      img: 'assets/images/blog/blog-2.jpg',
      tag: 'Events',
      title: 'The Countdown Has Begun for the Annual Gastronomic Festival',
      date: 'March 18, 2024',
      comments: 3,
      slug: 'gastronomic-festival'
    }
  ];

  // ── Promotions ───────────────────────────────────

  /**
   * Static promotion cards displayed on the home page.
   */
  promotions = [
    { img: 'assets/images/promotions/promo_1.jpg', label: 'Starting from', price: '₺150', name: 'Special Breakfast' },
    { img: 'assets/images/promotions/promo_2.jpg', label: 'Starting from', price: '₺250', name: 'Special Lunch' },
    { img: 'assets/images/promotions/promo_3.jpg', label: 'Starting from', price: '₺350', name: 'Special Dinner' }
  ];

  /**
   * Starts the hero slider when the component is initialized.
   */
  ngOnInit(): void {
    this.startSlider();
  }

  /**
   * Clears the slider interval when the component is destroyed.
   * This prevents memory leaks.
   */
  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  /**
   * Starts the automatic hero slider.
   * The slide changes every 5 seconds.
   */
  private startSlider(): void {
    this.slideTimer = setInterval(() => {
      this.currentSlide.update(value => (value + 1) % this.slides.length);
    }, 5000);
  }

  /**
   * Changes the active slide manually.
   */
  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  /**
   * Changes the active menu filter.
   */
  setFilter(key: string): void {
    this.activeFilter.set(key);
  }

  /**
   * Shows the previous team member group.
   */
  prevTeam(): void {
    this.teamIndex.update(value => (value - 1 + this.teamMembers.length) % this.teamMembers.length);
  }

  /**
   * Shows the next team member group.
   */
  nextTeam(): void {
    this.teamIndex.update(value => (value + 1) % this.teamMembers.length);
  }
}