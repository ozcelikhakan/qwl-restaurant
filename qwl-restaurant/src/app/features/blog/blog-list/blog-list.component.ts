import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
   * The currently selected category/tag filter, or null when showing all posts.
   */
  activeTag = signal<string | null>(null);

  /**
   * Blog categories derived from the first tag of each post, with post counts.
   */
  categories = computed<{ name: string; count: number }[]>(() => {
    const counts = new Map<string, number>();
    for (const post of this.posts()) {
      if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  });

  /**
   * Unique list of tags collected from all published posts.
   */
  allTags = computed<string[]>(() => {
    const tags = new Set<string>();
    for (const post of this.posts()) {
      for (const tag of post.tags) tags.add(tag);
    }
    return [...tags];
  });

  /**
   * Posts filtered by the active category/tag. Returns all posts when no filter is active.
   */
  filteredPosts = computed<BlogPost[]>(() => {
    const tag = this.activeTag();
    return tag ? this.posts().filter(p => p.tags.includes(tag)) : this.posts();
  });

  /**
   * Returns the latest three blog posts (always unfiltered).
   */
  get recentPosts(): BlogPost[] {
    return this.posts().slice(0, 3);
  }

  /**
   * Toggles the category/tag filter. Selecting the active one clears the filter.
   */
  selectTag(tag: string): void {
    this.activeTag.update(current => current === tag ? null : tag);
  }

  constructor() {
    /**
     * Apply an initial category/tag filter from the ?tag= query parameter, if present.
     */
    const initialTag = inject(ActivatedRoute).snapshot.queryParamMap.get('tag');
    if (initialTag) this.activeTag.set(initialTag);

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