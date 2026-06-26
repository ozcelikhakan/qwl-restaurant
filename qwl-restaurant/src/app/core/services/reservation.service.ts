import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateReservationDto, ReservationDto } from '../models/reservation.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base = `${environment.apiUrl}/reservation`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new reservation.
   */
  create(dto: CreateReservationDto): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(this.base, dto);
  }

  /**
   * Gets all reservations.
   */
  getAll(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(this.base);
  }

  /**
   * Updates the status of a reservation by its ID.
   */
  updateStatus(id: number, status: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, status);
  }

  /**
   * Deletes a reservation by its ID.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Gets occupied tables for a specific date and time.
   */
  getOccupiedTables(date: string, time: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/occupied`, { params: { date, time } });
  }
}