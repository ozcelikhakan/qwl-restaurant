import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { MenuService } from '../../core/services/menu.service';
import { EventService } from '../../core/services/event.service';
import { BlogService } from '../../core/services/blog.service';
import { MenuItem as MenuItemDto, DailySpecial } from '../../core/models/menu.models';
import { EventDto } from '../../core/models/event.models';
import { BlogDto } from '../../core/models/blog.models';

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

/**
 * Menu filter tab shown on the home page.
 */
interface MenuFilter { key: string; label: string; }

/**
 * Menu item shown in the home page menu grid.
 */
interface HomeMenuItem { id: number; img: string; name: string; price: number; category: string; }

/**
 * Event card shown in the home page events section.
 */
interface HomeEvent { id: number; img: string; day: string; month: string; title: string; date: string; location: string; desc: string; }

/**
 * Blog card shown in the home page blog section.
 */
interface HomeBlog { id: number; img: string; tag: string; title: string; date: string; comments: number; slug: string; }

/**
 * Promotion card shown in the home page promotions section.
 */
interface HomePromo { id: number; img: string; label: string; price: string; name: string; }

/**
 * Full English month names used in event date labels.
 */
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Fallback images used when admin content has no image.
 */
const MENU_IMGS = Array.from({ length: 8 }, (_, i) => `assets/images/menu/menu_${i + 1}.jpg`);
const EVENT_IMGS = Array.from({ length: 5 }, (_, i) => `assets/images/event/event_${i + 1}.jpg`);
const BLOG_IMGS = Array.from({ length: 5 }, (_, i) => `assets/images/blog/blog-${i + 1}.jpg`);
const PROMO_IMGS = Array.from({ length: 3 }, (_, i) => `assets/images/promotions/promo_${i + 1}.jpg`);

/**
 * Maps a backend menu item into the home page menu card model.
 */
function mapMenuItem(item: MenuItemDto, index: number): HomeMenuItem {
  return {
    id:       item.id,
    img:      item.imageUrl || MENU_IMGS[index % MENU_IMGS.length],
    name:     item.name,
    price:    item.price,
    category: item.categorySlug,
  };
}

/**
 * Maps a backend event into the home page event card model.
 */
function mapEvent(dto: EventDto, index: number): HomeEvent {
  const date = new Date(dto.eventDate);
  return {
    id:       dto.id,
    img:      dto.imageUrl || EVENT_IMGS[index % EVENT_IMGS.length],
    day:      String(date.getDate()).padStart(2, '0'),
    month:    MONTH_NAMES[date.getMonth()],
    title:    dto.title,
    date:     date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    location: dto.location ?? 'QWL Restaurant',
    desc:     dto.description,
  };
}

/**
 * Maps a backend daily special into the home page promotion card model.
 */
function mapPromotion(dto: DailySpecial, index: number): HomePromo {
  return {
    id:    dto.id,
    img:   dto.imageUrl || PROMO_IMGS[index % PROMO_IMGS.length],
    label: 'Starting from',
    price: `₺${dto.price}`,
    name:  dto.title,
  };
}

/**
 * Maps a backend blog post into the home page blog card model.
 */
function mapBlog(dto: BlogDto, index: number): HomeBlog {
  return {
    id:       dto.id,
    img:      dto.coverImageUrl || BLOG_IMGS[index % BLOG_IMGS.length],
    tag:      dto.tags?.[0] ?? 'Blog',
    title:    dto.title,
    date:     dto.publishedAt ? new Date(dto.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
    comments: dto.commentCount,
    slug:     dto.slug,
  };
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

  // ── Services ──────────────────────────────────────
  private menuSvc = inject(MenuService);
  private eventSvc = inject(EventService);
  private blogSvc = inject(BlogService);

  // ── Menu Filter (admin-managed) ───────────────────

  /**
   * Stores the currently selected menu filter key.
   */
  activeFilter = signal('all');

  /**
   * Menu category filters, built from admin-managed categories.
   */
  filters = signal<MenuFilter[]>([{ key: 'all', label: 'All' }]);

  /**
   * All menu items loaded from the backend.
   */
  menuItems = signal<HomeMenuItem[]>([]);

  /**
   * Returns up to 8 menu items filtered by the active category.
   */
  filteredMenu = computed<HomeMenuItem[]>(() => {
    const filter = this.activeFilter();
    const items = filter === 'all'
      ? this.menuItems()
      : this.menuItems().filter(item => item.category === filter);
    return items.slice(0, 8);
  });

  // ── Events (admin-managed) ────────────────────────

  /**
   * Up to 3 event cards loaded from the backend.
   */
  events = signal<HomeEvent[]>([]);

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

  // ── Blog (admin-managed) ──────────────────────────

  /**
   * Up to 2 published blog cards loaded from the backend.
   */
  blogs = signal<HomeBlog[]>([]);

  // ── Promotions ───────────────────────────────────

  /**
   * Promotion cards built from admin-managed daily specials.
   */
  promotions = signal<HomePromo[]>([]);

  /**
   * Starts the hero slider and loads admin-managed content when initialized.
   */
  ngOnInit(): void {
    this.startSlider();
    this.loadContent();
  }

  /**
   * Loads menu items, categories, events and blog posts from the backend.
   */
  private loadContent(): void {
    forkJoin({
      cats:     this.menuSvc.getCategories(),
      items:    this.menuSvc.getItems(),
      specials: this.menuSvc.getDailySpecials(),
      events:   this.eventSvc.getAll(),
      blogs:    this.blogSvc.getPublished(),
    }).subscribe({
      next: ({ cats, items, specials, events, blogs }) => {
        this.filters.set([
          { key: 'all', label: 'All' },
          ...cats.map(c => ({ key: c.slug, label: c.name })),
        ]);
        this.menuItems.set(items.map(mapMenuItem));
        this.promotions.set(specials.slice(0, 3).map(mapPromotion));
        this.events.set(events.slice(0, 3).map(mapEvent));
        this.blogs.set(blogs.slice(0, 2).map(mapBlog));
      },
      error: () => { /* Home page keeps its sections empty if content cannot load. */ },
    });
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