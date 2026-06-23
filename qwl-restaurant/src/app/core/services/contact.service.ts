import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateContactMessageDto, ContactMessageDto } from '../models/contact.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private base = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /**
   * Sends a new contact message.
   */
  send(dto: CreateContactMessageDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.base, dto);
  }

  /**
   * Gets all contact messages.
   */
  getAll(): Observable<ContactMessageDto[]> {
    return this.http.get<ContactMessageDto[]>(this.base);
  }

  /**
   * Marks a contact message as read by its ID.
   */
  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }

  /**
   * Deletes a contact message by its ID.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}