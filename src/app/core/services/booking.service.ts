import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BookingDetail, BookingSummary } from '../models/booking.model';

interface SeatSelectionRequest {
  showId: number;
  seatIds: number[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  lockSeats(payload: SeatSelectionRequest): Observable<ApiResponse<{ message: string; expiresAtUtc: string }>> {
    return this.http.post<ApiResponse<{ message: string; expiresAtUtc: string }>>(
      `${this.baseUrl}/api/bookings/lock`,
      payload
    );
  }

  confirmSeats(payload: SeatSelectionRequest): Observable<ApiResponse<{ bookingId: number; total: number }>> {
    return this.http.post<ApiResponse<{ bookingId: number; total: number }>>(
      `${this.baseUrl}/api/bookings/confirm`,
      payload
    );
  }

  getMyBookings(): Observable<ApiResponse<BookingSummary[]>> {
    return this.http.get<ApiResponse<BookingSummary[]>>(`${this.baseUrl}/api/bookings/my`);
  }

  getBookingById(id: number): Observable<ApiResponse<BookingDetail>> {
    return this.http.get<ApiResponse<BookingDetail>>(`${this.baseUrl}/api/bookings/${id}`);
  }
}
