import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/api/movies`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/api/movies/${id}`);
  }

  createMovie(payload: FormData): Observable<Movie> {
    return this.http.post<Movie>(`${this.baseUrl}/api/movies`, payload);
  }

  updateMovie(id: number, payload: FormData): Observable<Movie> {
    return this.http.put<Movie>(`${this.baseUrl}/api/movies/${id}`, payload);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/movies/${id}`);
  }
}
