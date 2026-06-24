import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageBannerComponent, BreadcrumbItem } from '../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { MenuService } from '../../core/services/menu.service';

/**
 * Represents a menu item used locally in the menu page UI.
 */
interface LocalMenuItem {
  img: string;
  name: string;
  price: number;
  category: string;
  ingredients: string[];
}

/**
 * Represents a daily special or fallback promotion item.
 */
interface LocalSpecial {
  img: string;
  title: string;
  desc: string;
  badge: string;
}

/**
 * Default image used when a menu item does not have an image.
 */
const FALLBACK_IMG = 'assets/images/menu/menu_1.jpg';

/**
 * Default images used for special menu cards.
 */
const SPECIAL_IMGS = [
  'assets/images/promotions/promo_slide_1.jpg',
  'assets/images/promotions/promo_slide_2.jpg',
  'assets/images/promotions/promo_slide_3.jpg',
];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  /**
   * Injects the menu service.
   * Used to get categories, menu items and daily specials from the API.
   */
  private menuService = inject(MenuService);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Menu' }
  ];

  /**
   * Controls the loading state of the page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when menu data cannot be loaded.
   */
  error = signal('');

  /**
   * Stores all menu items received from the API.
   */
  allItems = signal<LocalMenuItem[]>([]);

  /**
   * Stores daily specials or fallback special items.
   */
  specials = signal<LocalSpecial[]>([]);

  /**
   * Stores menu category filters.
   */
  filters = signal([{ key: 'all', label: 'All' }]);

  /**
   * Stores the currently active special slide index.
   */
  activeSpecial = signal(0);

  /**
   * Stores the currently selected menu filter key.
   */
  activeFilter = signal('all');

  /**
   * Stores the current pagination page.
   */
  currentPage = signal(1);

  /**
   * Defines how many menu items are displayed per page.
   */
  readonly pageSize = 6;

  /**
   * Returns menu items filtered by the active category.
   * If the active filter is "all", all items are returned.
   */
  filteredItems = computed(() => {
    const filter = this.activeFilter();

    return filter === 'all'
      ? this.allItems()
      : this.allItems().filter(item => item.category === filter);
  });

  /**
   * Returns the menu items displayed on the current pagination page.
   */
  pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredItems().slice(start, start + this.pageSize);
  });

  /**
   * Calculates the total number of pages based on filtered items.
   */
  totalPages = computed(() => Math.ceil(this.filteredItems().length / this.pageSize));

  /**
   * Creates an array of page numbers for pagination buttons.
   */
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  /**
   * Loads categories, menu items and daily specials when the component is initialized.
   */
  ngOnInit(): void {
    forkJoin({
      categories: this.menuService.getCategories(),
      items: this.menuService.getItems(),
      specials: this.menuService.getDailySpecials(),
    }).subscribe({
      next: ({ categories, items, specials }) => {
        /**
         * Builds filter buttons from API categories.
         */
        this.filters.set([
          { key: 'all', label: 'All' },
          ...categories.map(category => ({
            key: category.slug,
            label: category.name
          }))
        ]);

        /**
         * Maps API menu items into the local UI model.
         */
        this.allItems.set(items.map(item => ({
          img: item.imageUrl ?? FALLBACK_IMG,
          name: item.name,
          price: item.price,
          category: item.categorySlug,
          ingredients: item.ingredients
            ? item.ingredients.split(',').map(ingredient => ingredient.trim())
            : [],
        })));

        /**
         * Uses API daily specials if available.
         * If no specials are returned, fallback special cards are displayed.
         */
        this.specials.set(
          specials.length > 0
            ? specials.map((special, index) => ({
                img: special.imageUrl ?? SPECIAL_IMGS[index % SPECIAL_IMGS.length],
                title: special.title,
                desc: special.description,
                badge: `₺${special.price}`,
              }))
            : SPECIAL_IMGS.map((img, index) => ({
                img,
                title: [
                  'Weekend Breakfast Menu',
                  'Lunch Special Set',
                  'Evening Gala Menu'
                ][index],
                desc: [
                  'Our special breakfast plate with fresh bread, local cheeses and unlimited tea.',
                  'Our lunch menu consisting of soup, main course and dessert.',
                  'A 4-course tasting menu served with wine. Advance reservation is required.'
                ][index],
                badge: [
                  '20% Off',
                  "Today's Menu",
                  'Special Offer'
                ][index],
              }))
        );

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Menu could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Shows the previous special card.
   */
  prevSpecial(): void {
    this.activeSpecial.update(
      value => (value - 1 + this.specials().length) % this.specials().length
    );
  }

  /**
   * Shows the next special card.
   */
  nextSpecial(): void {
    this.activeSpecial.update(
      value => (value + 1) % this.specials().length
    );
  }

  /**
   * Changes the active menu filter and resets pagination to the first page.
   */
  setFilter(key: string): void {
    this.activeFilter.set(key);
    this.currentPage.set(1);
  }

  /**
   * Changes the current page and smoothly scrolls to the top.
   */
  goToPage(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}