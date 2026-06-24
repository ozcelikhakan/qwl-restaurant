import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBannerComponent, BreadcrumbItem } from '../../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { AuthService } from '../../../core/services/auth.service';
import { BlogService } from '../../../core/services/blog.service';

/**
 * Represents a blog post formatted for the blog list page UI.
 */
export interface BlogPost {
  slug: string;
  img: string;
  thumb: string;
  date: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  tags: string[];
  commentsCount: number;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
  /**
   * Injects the authentication service.
   * Can be used in the template to check user login state.
   */
  auth = inject(AuthService);

  /**
   * Injects the blog service.
   * Used to fetch published blog posts from the API.
   */
  blogService = inject(BlogService);

  /**
   * Controls the loading state of the blog list page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when blog posts cannot be loaded.
   */
  error = signal('');

  /**
   * Stores all published blog posts displayed on the page.
   */
  posts = signal<BlogPost[]>([]);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Blog' }
  ];

  /**
   * Static blog categories displayed in the sidebar.
   */
  categories = [
    { name: 'Recipes', count: 12 },
    { name: 'Culinary Culture', count: 8 },
    { name: 'Drinks', count: 5 },
    { name: 'Sustainability', count: 4 },
    { name: 'News', count: 6 },
  ];

  /**
   * Static tag list displayed in the sidebar.
   */
  allTags = [
    'Pizza',
    'Recipe',
    'Italian',
    'Mediterranean',
    'Healthy',
    'Wine',
    'Seasonal',
    'Pasta',
    'Fresh',
    'Diet',
    'Tips'
  ];

  /**
   * Returns the latest three blog posts.
   */
  get recentPosts(): BlogPost[] {
    return this.posts().slice(0, 3);
  }

  constructor() {
    /**
     * Loads published blog posts from the API.
     */
    this.blogService.getPublished().subscribe({
      next: dtos => {
        /**
         * Fallback images used when a blog post does not have a cover image.
         */
        const FALLBACK_IMGS = [
          'assets/images/blog/main_blog/blog_1.jpg',
          'assets/images/blog/main_blog/blog_2.jpg',
          'assets/images/blog/main_blog/blog_3.jpg',
          'assets/images/blog/blog-4.jpg',
          'assets/images/blog/blog-5.jpg',
        ];

        /**
         * Fallback thumbnail images used for recent post cards.
         */
        const FALLBACK_THUMBS = [
          'assets/images/blog/thumb/1.jpg',
          'assets/images/blog/thumb/2.jpg',
          'assets/images/blog/thumb/3.jpg',
          'assets/images/blog/thumb/4.jpg',
          'assets/images/blog/thumb/4.jpg',
        ];

        /**
         * Maps API blog DTOs into the local UI model.
         */
        this.posts.set(dtos.map((dto, index) => ({
          slug: dto.slug,
          img: dto.coverImageUrl ?? FALLBACK_IMGS[index % FALLBACK_IMGS.length],
          thumb: dto.coverImageUrl ?? FALLBACK_THUMBS[index % FALLBACK_THUMBS.length],
          date: dto.publishedAt
            ? new Date(dto.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : '',
          author: dto.authorFullName,
          category: dto.tags?.[0] ?? '',
          title: dto.title,
          excerpt: dto.summary,
          tags: dto.tags ?? [],
          commentsCount: dto.commentCount,
        })));

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Blog posts could not be loaded.');
        this.loading.set(false);
      }
    });
  }
}