import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Seat } from '../models/theater.model';
import { Show, ShowSummary } from '../models/show.model';

export interface CreateShowPayload {
  movieId: number;
  screenId: number;
  startsAtUtc: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getShows(): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.baseUrl}/api/shows`);
  }

  getShowsByMovie(movieId: number): Observable<ShowSummary[]> {
    return this.http.get<ShowSummary[]>(`${this.baseUrl}/api/shows/by-movie/${movieId}`);
  }

  getShowDetails(showId: number): Observable<Show> {
    return this.http.get<Show>(`${this.baseUrl}/api/shows/${showId}`);
  }

  getSeatsForShow(showId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.baseUrl}/api/shows/${showId}/seats`);
  }

  createShow(payload: CreateShowPayload): Observable<Show> {
    return this.http.post<Show>(`${this.baseUrl}/api/shows`, payload);
  }

  updateShow(showId: number, payload: CreateShowPayload): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/shows/${showId}`, payload);
  }

  deleteShow(showId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/shows/${showId}`);
  }
}
