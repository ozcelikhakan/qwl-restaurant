import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuCategory, MenuItem, CreateMenuItemDto, DailySpecial } from '../models/menu.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private base = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  /**
   * Gets all menu categories.
   */
  getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.base}/categories`);
  }

  /**
   * Gets menu items. If a category ID is provided, it filters items by category.
   */
  getItems(categoryId?: number): Observable<MenuItem[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return this.http.get<MenuItem[]>(`${this.base}/items${params}`);
  }

  /**
   * Gets a single menu item by its ID.
   */
  getItemById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.base}/items/${id}`);
  }

  /**
   * Creates a new menu item.
   */
  createItem(dto: CreateMenuItemDto): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/items`, dto);
  }

  /**
   * Updates an existing menu item by its ID.
   */
  updateItem(id: number, dto: CreateMenuItemDto): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.base}/items/${id}`, dto);
  }

  /**
   * Deletes a menu item by its ID.
   */
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/items/${id}`);
  }

  /**
   * Gets all daily specials.
   */
  getDailySpecials(): Observable<DailySpecial[]> {
    return this.http.get<DailySpecial[]>(`${this.base}/daily-specials`);
  }

  /**
   * Creates a new daily special.
   */
  createDailySpecial(dto: DailySpecial): Observable<DailySpecial> {
    return this.http.post<DailySpecial>(`${this.base}/daily-specials`, dto);
  }

  /**
   * Deletes a daily special by its ID.
   */
  deleteDailySpecial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/daily-specials/${id}`);
  }
}