import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Movie } from '../../../../core/models/movie.model';
import { Show } from '../../../../core/models/show.model';
import { Theater } from '../../../../core/models/theater.model';
import { MovieService } from '../../../../core/services/movie.service';
import { ShowService } from '../../../../core/services/show.service';
import { TheaterService } from '../../../../core/services/theater.service';

dayjs.extend(utc);
dayjs.extend(timezone);

interface DashboardStats {
  movies: number;
  shows: number;
  theaters: number;
  screens: number;
  totalSeats: number;
  upcomingShows: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = false;
  stats: DashboardStats = {
    movies: 0,
    shows: 0,
    theaters: 0,
    screens: 0,
    totalSeats: 0,
    upcomingShows: 0
  };

  latestMovies: Movie[] = [];
  upcomingShowList: Show[] = [];

  constructor(
    private readonly movieService: MovieService,
    private readonly showService: ShowService,
    private readonly theaterService: TheaterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    forkJoin({
      movies: this.movieService.getMovies(),
      shows: this.showService.getShows(),
      theaters: this.theaterService.getTheaters()
    })
      .pipe(
        switchMap(({ movies, shows, theaters }) => {
          const theaterDetail$ = theaters.length
            ? forkJoin(theaters.map(theater => this.theaterService.getTheater(theater.id)))
            : of<Theater[]>([]);

          return theaterDetail$.pipe(
            map(details => ({ movies, shows, theaters, details }))
          );
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ movies, shows, theaters, details }) => {
        const upcomingShows = shows.filter(show => dayjs.utc(show.startsAtUtc).isAfter(dayjs().utc()) && dayjs.utc(show.startsAtUtc).diff(dayjs().utc(), 'hour') <= 72);
        const totalScreens = details.reduce((acc, theater) => acc + (theater.screens?.length ?? 0), 0);
        const totalSeats = details.reduce((acc, theater) => acc + (theater.screens?.reduce((sum, screen) => sum + (screen.totalSeats ?? 0), 0) ?? 0), 0);

        this.stats = {
          movies: movies.length,
          shows: shows.length,
          theaters: theaters.length,
          screens: totalScreens,
          totalSeats,
          upcomingShows: upcomingShows.length
        };

        this.latestMovies = movies.slice(0, 4);
        this.upcomingShowList = upcomingShows.slice(0, 6);
      });
  }
}
