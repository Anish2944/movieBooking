import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import { Movie } from '../../../../core/models/movie.model';
import { MovieService } from '../../../../core/services/movie.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly searchControl = new FormControl('');
  readonly apiBase = environment.apiUrl;

  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly movieService: MovieService, private readonly router: Router) {}

  ngOnInit(): void {
    this.fetchMovies();
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => this.applyFilter(term ?? ''));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByMovieId(_: number, movie: Movie): number {
    return movie.id;
  }

  viewDetails(movie: Movie): void {
    this.router.navigate(['/movies', movie.id]);
  }

  resolvePoster(movie: Movie): string {
    if (movie.imageUrl?.startsWith('http')) {
      return movie.imageUrl;
    }
    if (movie.imageUrl) {
      return `${this.apiBase}${movie.imageUrl}`;
    }
    return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80';
  }

  private fetchMovies(): void {
    this.loading = true;
    this.movieService
      .getMovies()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(movies => {
        this.movies = movies;
        this.filteredMovies = movies;
      });
  }

  private applyFilter(term: string): void {
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      this.filteredMovies = this.movies;
      return;
    }
    this.filteredMovies = this.movies.filter(movie =>
      [movie.title, movie.description, movie.genre, movie.language]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(normalized))
    );
  }
}
