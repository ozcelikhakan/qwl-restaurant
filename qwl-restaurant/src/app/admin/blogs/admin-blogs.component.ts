import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BlogService } from '../../core/services/blog.service';
import { BlogDto, CreateBlogDto, PendingCommentDto } from '../../core/models/blog.models';

interface AdminBlog {
  id: number;
  slug: string;
  img: string;
  thumb: string;
  date: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  commentsCount: number;
  isPublished: boolean;
}

// Blog categories displayed in the admin panel
const CATEGORIES = ['Recipes', 'Culinary Culture', 'Drinks', 'Sustainability', "Chef's Notes"];

// Maps blog DTO data to the local admin blog model
function mapDto(b: BlogDto): AdminBlog {
  return {
    id:            b.id,
    slug:          b.slug,
    img:           b.coverImageUrl ?? '',
    thumb:         b.coverImageUrl ?? '',
    date:          b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    author:        b.authorFullName,
    category:      CATEGORIES[0],
    title:         b.title,
    excerpt:       b.summary,
    content:       '',
    tags:          b.tags ?? [],
    commentsCount: b.commentCount,
    isPublished:   b.publishedAt !== null,
  };
}

// Returns the default empty blog form data
const emptyForm = (): Omit<AdminBlog, 'id' | 'commentsCount'> => ({
  slug: '', img: '', thumb: '', date: '', author: '', category: 'Recipes', title: '', excerpt: '', content: '', tags: [], isPublished: false
});

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-blogs.component.html',
})
export class AdminBlogsComponent implements OnInit {
  // Inject blog service to load and manage blog posts
  private svc = inject(BlogService);

  // Blog page state
  posts     = signal<AdminBlog[]>([]);
  loading   = signal(true);
  error     = signal('');
  catFilter = signal('all');
  modalOpen = signal(false);
  editingId = signal<number | null>(null);
  form      = signal(emptyForm());
  tagInput  = signal('');

  // Category list used for filtering and form selection
  categories = CATEGORIES;

  // Error shown in the post form when saving fails
  saveError = signal('');

  // ── Comment moderation ───────────────────────────────────
  mainTab         = signal<'posts' | 'comments'>('posts');
  pendingComments = signal<PendingCommentDto[]>([]);
  commentsLoading = signal(true);

  // Filters blog posts by selected category
  filtered = computed(() => {
    const f = this.catFilter();
    return f === 'all' ? this.posts() : this.posts().filter(p => p.category === f);
  });

  // Loads all blog posts when the component is initialized
  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.posts.set(list.map(mapDto));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Blog posts could not be loaded.');
        this.loading.set(false);
      }
    });

    this.loadPendingComments();
  }

  // Loads comments awaiting moderation
  loadPendingComments(): void {
    this.commentsLoading.set(true);
    this.svc.getPendingComments().subscribe({
      next: list => {
        this.pendingComments.set(list);
        this.commentsLoading.set(false);
      },
      error: () => this.commentsLoading.set(false),
    });
  }

  // Approves a pending comment and removes it from the moderation list
  approveComment(id: number): void {
    this.svc.approveComment(id).subscribe({
      next: () => this.pendingComments.update(list => list.filter(c => c.id !== id)),
    });
  }

  // Rejects (deletes) a pending comment
  rejectComment(id: number): void {
    this.svc.deleteComment(id).subscribe({
      next: () => this.pendingComments.update(list => list.filter(c => c.id !== id)),
    });
  }

  // Opens the modal for creating a new blog post
  openAdd(): void {
    this.editingId.set(null);
    this.form.set(emptyForm());
    this.tagInput.set('');
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  // Opens the modal for editing an existing blog post
  openEdit(post: AdminBlog): void {
    this.editingId.set(post.id);
    this.form.set({ slug: post.slug, img: post.img, thumb: post.thumb, date: post.date, author: post.author, category: post.category, title: post.title, excerpt: post.excerpt, content: post.content, tags: [...post.tags], isPublished: post.isPublished });
    this.tagInput.set('');
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  // Adds a new tag to the blog form
  addTag(): void {
    const val = this.tagInput().trim();
    if (!val) return;
    this.form.update(f => ({ ...f, tags: [...f.tags, val] }));
    this.tagInput.set('');
  }

  // Removes a tag from the blog form
  removeTag(idx: number): void {
    this.form.update(f => ({ ...f, tags: f.tags.filter((_, i) => i !== idx) }));
  }

  // Saves a new blog post or updates the selected blog post
  save(): void {
    const f = this.form();
    if (!f.title.trim()) { this.saveError.set('Title is required.'); return; }
    this.saveError.set('');
    const dto: CreateBlogDto = {
      title:         f.title,
      summary:       f.excerpt,
      content:       f.content,
      coverImageUrl: f.img || null,
      tags:          f.tags,
    };
    const onError = () => this.saveError.set('Save failed. Please check your connection or sign in again.');
    const id = this.editingId();
    if (id) {
      this.svc.update(id, dto).subscribe({
        next: updated => {
          this.posts.update(list => list.map(p => p.id === id ? { ...mapDto(updated), commentsCount: p.commentsCount } : p));
          this.modalOpen.set(false);
        },
        error: onError,
      });
    } else {
      this.svc.create(dto).subscribe({
        next: created => {
          this.posts.update(list => [...list, mapDto(created)]);
          this.modalOpen.set(false);
        },
        error: onError,
      });
    }
  }

  // Publishes the selected blog post
  publish(id: number): void {
    this.svc.publish(id).subscribe({
      next: () => this.posts.update(list =>
        list.map(p => p.id === id ? { ...p, isPublished: true } : p)
      ),
    });
  }

  // Deletes a blog post
  delete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => this.posts.update(list => list.filter(p => p.id !== id))
    });
  }

  // Updates a single field in the blog form
  updateField(field: keyof ReturnType<typeof emptyForm>, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }
}