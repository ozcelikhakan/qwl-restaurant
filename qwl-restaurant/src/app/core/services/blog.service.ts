import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogDto, BlogDetailDto, CreateBlogDto, CreateCommentDto, PendingCommentDto } from '../models/blog.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private base = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  /**
   * Gets all published blog posts.
   */
  getPublished(): Observable<BlogDto[]> {
    return this.http.get<BlogDto[]>(this.base);
  }

  /**
   * Gets all blog posts for admin users, including unpublished ones.
   */
  getAll(): Observable<BlogDto[]> {
    return this.http.get<BlogDto[]>(`${this.base}/admin/all`);
  }

  /**
   * Gets blog posts created by the currently logged-in user.
   */
  getMyBlogs(): Observable<BlogDto[]> {
    return this.http.get<BlogDto[]>(`${this.base}/mine`);
  }

  /**
   * Gets the details of a single blog post by its slug.
   */
  getBySlug(slug: string): Observable<BlogDetailDto> {
    return this.http.get<BlogDetailDto>(`${this.base}/${slug}`);
  }

  /**
   * Creates a new blog post.
   */
  create(dto: CreateBlogDto): Observable<BlogDto> {
    return this.http.post<BlogDto>(this.base, dto);
  }

  /**
   * Updates an existing blog post by its ID.
   */
  update(id: number, dto: CreateBlogDto): Observable<BlogDto> {
    return this.http.put<BlogDto>(`${this.base}/${id}`, dto);
  }

  /**
   * Publishes a blog post by its ID.
   */
  publish(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/publish`, {});
  }

  /**
   * Deletes a blog post by its ID.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Adds a new comment to a blog post.
   */
  addComment(dto: CreateCommentDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/comments`, dto);
  }

  /**
   * Gets all pending (unapproved) comments for admin moderation.
   */
  getPendingComments(): Observable<PendingCommentDto[]> {
    return this.http.get<PendingCommentDto[]>(`${this.base}/comments/pending`);
  }

  /**
   * Approves a blog comment by its ID.
   */
  approveComment(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/comments/${id}/approve`, {});
  }

  /**
   * Deletes a blog comment by its ID.
   */
  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/comments/${id}`);
  }
}