import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Screen, Theater } from '../models/theater.model';

export interface CreateTheaterPayload {
  name: string;
  location: string;
}

export interface CreateScreenPayload {
  theaterId: number;
  name: string;
  totalSeats: number;
}

export interface GenerateSeatsPayload {
  screenId: number;
  rows: number;
  seatsPerRow: number;
  startRowAscii?: number;
}

@Injectable({ providedIn: 'root' })
export class TheaterService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getTheaters(): Observable<Theater[]> {
    return this.http.get<Theater[]>(`${this.baseUrl}/api/theaters`);
  }

  getTheater(id: number): Observable<Theater> {
    return this.http.get<Theater>(`${this.baseUrl}/api/theaters/${id}`);
  }

  createTheater(payload: CreateTheaterPayload): Observable<Theater> {
    return this.http.post<Theater>(`${this.baseUrl}/api/theaters`, payload);
  }

  updateTheater(id: number, payload: CreateTheaterPayload): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/theaters/${id}`, payload);
  }

  deleteTheater(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/theaters/${id}`);
  }

  createScreen(payload: CreateScreenPayload): Observable<Screen> {
    return this.http.post<Screen>(`${this.baseUrl}/api/theaters/screen`, payload);
  }

  getScreen(id: number): Observable<Screen> {
    return this.http.get<Screen>(`${this.baseUrl}/api/theaters/screen/${id}`);
  }

  generateSeats(payload: GenerateSeatsPayload): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(`${this.baseUrl}/api/theaters/generate-seats`, payload);
  }
}
