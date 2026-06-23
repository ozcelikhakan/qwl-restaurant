import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventDto, CreateEventDto, BuyTicketDto, EventTicketDto } from '../models/event.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private base = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  /**
   * Gets all available events.
   */
  getAll(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(this.base);
  }

  /**
   * Gets a single event by its ID.
   */
  getById(id: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.base}/${id}`);
  }

  /**
   * Creates a new event.
   */
  create(dto: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>(this.base, dto);
  }

  /**
   * Updates an existing event by its ID.
   */
  update(id: number, dto: CreateEventDto): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.base}/${id}`, dto);
  }

  /**
   * Deletes an event by its ID.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Buys a ticket for an event.
   */
  buyTicket(dto: BuyTicketDto): Observable<EventTicketDto> {
    return this.http.post<EventTicketDto>(`${this.base}/tickets/buy`, dto);
  }

  /**
   * Gets the tickets purchased by the currently logged-in user.
   */
  getMyTickets(): Observable<EventTicketDto[]> {
    return this.http.get<EventTicketDto[]>(`${this.base}/tickets/my`);
  }
}