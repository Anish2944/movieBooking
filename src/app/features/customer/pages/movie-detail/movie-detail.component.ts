import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { environment } from '../../../../../environments/environment';
import { Movie } from '../../../../core/models/movie.model';
import { ShowSummary } from '../../../../core/models/show.model';
import { MovieService } from '../../../../core/services/movie.service';
import { ShowService } from '../../../../core/services/show.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-movie-detail',
  standalone: false,
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  readonly apiBase = environment.apiUrl;

  movie?: Movie;
  shows: ShowSummary[] = [];
  movieLoading = false;
  showLoading = false;
  notFound = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly movieService: MovieService,
    private readonly showService: ShowService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.notFound = true;
        return;
      }
      this.fetchMovie(id);
      this.fetchShows(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resolvePoster(movie: Movie | undefined): string {
    if (!movie?.imageUrl) {
      return 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80';
    }
    if (movie.imageUrl.startsWith('http')) {
      return movie.imageUrl;
    }
    return `${this.apiBase}${movie.imageUrl}`;
  }

  formatShowTime(isoUtc: string): string {
    return dayjs.utc(isoUtc).local().format('ddd, MMM D • h:mm A');
  }

  goToBooking(show: ShowSummary): void {
    this.router.navigate(['/shows', show.id, 'book']);
  }

  private fetchMovie(id: number): void {
    this.movieLoading = true;
    this.notFound = false;
    this.movieService
      .getMovieById(id)
      .pipe(finalize(() => (this.movieLoading = false)))
      .subscribe({
        next: movie => {
          this.movie = movie;
        },
        error: () => {
          this.notFound = true;
        }
      });
  }

  private fetchShows(movieId: number): void {
    this.showLoading = true;
    this.showService
      .getShowsByMovie(movieId)
      .pipe(finalize(() => (this.showLoading = false)))
      .subscribe(shows => {
        this.shows = shows;
      });
  }
}
