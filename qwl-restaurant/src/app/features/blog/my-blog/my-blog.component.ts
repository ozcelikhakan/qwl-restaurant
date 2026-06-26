import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogDto, CreateBlogDto } from '../../../core/models/blog.models';
import { PageBannerComponent, BreadcrumbItem } from '../../../shared/components/page-banner/page-banner.component';

/**
 * Represents a blog post created by the current user.
 */
interface MyBlog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  commentCount: number;
}

/**
 * Maps an API blog DTO into the local UI model.
 */
function mapDto(blog: BlogDto): MyBlog {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    summary: blog.summary,
    coverImageUrl: blog.coverImageUrl,
    tags: blog.tags ?? [],
    publishedAt: blog.publishedAt,
    commentCount: blog.commentCount,
  };
}

/**
 * Creates an empty blog form model.
 */
const emptyForm = () => ({
  title: '',
  summary: '',
  content: '',
  img: '',
  tags: [] as string[]
});

@Component({
  selector: 'app-my-blogs',
  standalone: true,
  imports: [RouterLink, FormsModule, PageBannerComponent],
  templateUrl: './my-blog.component.html',
})
export class MyBlogsComponent implements OnInit {
  /**
   * Injects the blog service.
   * Used to fetch and create user blog posts.
   */
  private blogSvc = inject(BlogService);

  /**
   * Injects the authentication service.
   * Can be used in the template to access current user information.
   */
  auth = inject(AuthService);

  /**
   * Stores the current user's blog posts.
   */
  blogs = signal<MyBlog[]>([]);

  /**
   * Controls the loading state of the page.
   */
  loading = signal(true);

  /**
   * Stores the error message shown when blogs cannot be loaded.
   */
  error = signal('');

  /**
   * Controls whether the create blog modal is open.
   */
  modalOpen = signal(false);

  /**
   * Controls the saving state while a blog post is being created.
   */
  saving = signal(false);

  /**
   * Stores validation or submission errors for the create blog form.
   */
  saveError = signal('');

  /**
   * Stores the create blog form data.
   */
  form = signal(emptyForm());

  /**
   * Stores the current tag input value before it is added to the tag list.
   */
  tagInput = signal('');

  /**
   * Calculates how many blog posts have been published.
   */
  publishedCount = computed(() =>
    this.blogs().filter(blog => blog.publishedAt !== null).length
  );

  /**
   * Calculates how many blog posts are still pending.
   */
  pendingCount = computed(() =>
    this.blogs().filter(blog => blog.publishedAt === null).length
  );

  /**
   * Breadcrumb items displayed in the page banner.
   */
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'My Blogs' },
  ];

  /**
   * Loads the current user's blog posts when the component is initialized.
   */
  ngOnInit(): void {
    this.blogSvc.getMyBlogs().subscribe({
      next: list => {
        this.blogs.set(list.map(mapDto));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Blog posts could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Opens the create blog modal and resets the form.
   */
  openAdd(): void {
    this.form.set(emptyForm());
    this.tagInput.set('');
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  /**
   * Adds the current tag input value to the form tag list.
   */
  addTag(): void {
    const value = this.tagInput().trim();

    if (!value) {
      return;
    }

    this.form.update(form => ({
      ...form,
      tags: [...form.tags, value]
    }));

    this.tagInput.set('');
  }

  /**
   * Removes a tag from the form tag list by index.
   */
  removeTag(index: number): void {
    this.form.update(form => ({
      ...form,
      tags: form.tags.filter((_, i) => i !== index)
    }));
  }

  /**
   * Updates a single form field.
   */
  updateField(field: 'title' | 'summary' | 'content' | 'img', value: string): void {
    this.form.update(form => ({
      ...form,
      [field]: value
    }));
  }

  /**
   * Creates a new blog post.
   */
  save(): void {
    const form = this.form();

    if (!form.title.trim()) {
      this.saveError.set('Title is required.');
      return;
    }

    this.saveError.set('');
    this.saving.set(true);

    const dto: CreateBlogDto = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      coverImageUrl: form.img || null,
      tags: form.tags,
    };

    this.blogSvc.create(dto).subscribe({
      next: created => {
        this.blogs.update(list => [mapDto(created), ...list]);
        this.saving.set(false);
        this.modalOpen.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Post could not be submitted. Please try again.');
      },
    });
  }
}