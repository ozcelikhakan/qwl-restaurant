import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageBannerComponent, BreadcrumbItem } from '../../../shared/components/page-banner/page-banner.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { BlogService } from '../../../core/services/blog.service';
import { BlogDetailDto, BlogCommentDto } from '../../../core/models/blog.models';

/**
 * Represents a blog post formatted for the blog detail page UI.
 */
interface DisplayPost {
  id: number;
  slug: string;
  img: string;
  date: string;
  author: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  commentsCount: number;
  comments: BlogCommentDto[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [DatePipe, FormsModule,  PageBannerComponent, ScrollAnimateDirective],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
  /**
   * Injects the active route.
   * Used to read the blog slug from the URL.
   */
  private route = inject(ActivatedRoute);

  /**
   * Injects the blog service.
   * Used to fetch blog details and submit comments.
   */
  private blogService = inject(BlogService);

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Blog', path: '/blog' },
    { label: 'Post' }
  ];

  /**
   * Controls the loading state of the blog detail page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when the blog post cannot be loaded.
   */
  error = signal('');

  /**
   * Stores the current blog post displayed on the page.
   */
  post = signal<DisplayPost | null>(null);

  /**
   * Stores comment form values.
   */
  commentForm = {
    name: '',
    email: '',
    text: ''
  };

  /**
   * Tracks whether the comment was submitted successfully.
   */
  commentSent = signal(false);

  /**
   * Stores comment form validation or submission errors.
   */
  commentErr = signal('');

  /**
   * Static sidebar categories displayed on the blog detail page.
   */
  categories = [
    { name: 'Recipes', count: 12 },
    { name: 'Culinary Culture', count: 8 },
    { name: 'Drinks', count: 5 },
    { name: 'Sustainability', count: 4 },
    { name: 'News', count: 6 },
  ];

  /**
   * Static tag list displayed on the blog detail page.
   */
  allTags = [
    'Pizza',
    'Recipe',
    'Italian',
    'Mediterranean',
    'Healthy',
    'Wine',
    'Seasonal',
    'Pasta'
  ];

  /**
   * Loads the blog post by slug when the component is initialized.
   */
  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.blogService.getBySlug(slug).subscribe({
      next: (dto: BlogDetailDto) => {
        this.post.set({
          id: dto.id,
          slug: dto.slug,
          img: dto.coverImageUrl ?? 'assets/images/blog/main_blog/blog_1.jpg',
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
          content: dto.content,
          tags: dto.tags ?? [],
          commentsCount: dto.comments.length,
          comments: dto.comments,
        });

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Blog post not found.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Submits a new comment for the current blog post.
   */
  submitComment(): void {
    const currentPost = this.post();

    if (!currentPost || !this.commentForm.name.trim() || !this.commentForm.text.trim()) {
      this.commentErr.set('Name and comment fields are required.');
      return;
    }

    this.commentErr.set('');

    this.blogService.addComment({
      blogId: currentPost.id,
      authorName: this.commentForm.name,
      authorEmail: this.commentForm.email,
      content: this.commentForm.text,
    }).subscribe({
      next: () => {
        this.commentSent.set(true);
        this.commentForm = {
          name: '',
          email: '',
          text: ''
        };
      },
      error: () => {
        this.commentErr.set('Comment could not be submitted.');
      },
    });
  }
}