import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, of, Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Movie } from '../../../../core/models/movie.model';
import { Screen, Theater } from '../../../../core/models/theater.model';
import { Show } from '../../../../core/models/show.model';
import { MovieService } from '../../../../core/services/movie.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ShowService, CreateShowPayload } from '../../../../core/services/show.service';
import { TheaterService } from '../../../../core/services/theater.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-shows',
  standalone: false,
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss'
})
export class ShowsComponent implements OnInit {
  showForm: FormGroup;
  movies: Movie[] = [];
  theaters: Theater[] = [];
  shows: Show[] = [];
  dataSource = new MatTableDataSource<Show>([]);
  displayedColumns = ['movie', 'theater', 'time', 'price', 'actions'];

  loading = false;
  saving = false;
  editingShow?: Show;

  constructor(
    private readonly fb: FormBuilder,
    private readonly movieService: MovieService,
    private readonly theaterService: TheaterService,
    private readonly showService: ShowService,
    private readonly notification: NotificationService
  ) {
    this.showForm = this.fb.group({
      movieId: [null, Validators.required],
      theaterId: [null, Validators.required],
      screenId: [null, Validators.required],
      startsAt: ['', Validators.required],
      price: [250, [Validators.required, Validators.min(50)]]
    });

    this.showForm.get('theaterId')?.valueChanges.subscribe(() => {
      this.showForm.get('screenId')?.setValue(null);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get filteredScreens(): Screen[] {
    const theaterId = this.showForm.value.theaterId;
    if (!theaterId) {
      return [];
    }
    return this.theaters.find(t => t.id === theaterId)?.screens ?? [];
  }

  edit(show: Show): void {
    this.editingShow = show;
    const theaterId = show.screen?.theater?.id ?? show.screen?.theaterId ?? null;
    this.showForm.patchValue({
      movieId: show.movieId,
      theaterId,
      screenId: show.screenId,
      startsAt: dayjs.utc(show.startsAtUtc).local().format('YYYY-MM-DDTHH:mm'),
      price: show.price
    });
  }

  resetForm(): void {
    this.editingShow = undefined;
    this.showForm.reset({ price: 250 });
  }

  submit(): void {
    if (this.showForm.invalid) {
      this.showForm.markAllAsTouched();
      return;
    }

    const startsAtUtc = dayjs(this.showForm.value.startsAt).utc().toISOString();
    const payload: CreateShowPayload = {
      movieId: this.showForm.value.movieId,
      screenId: this.showForm.value.screenId,
      startsAtUtc,
      price: this.showForm.value.price
    };

    this.saving = true;
    const request$ = (this.editingShow
      ? this.showService.updateShow(this.editingShow.id, payload)
      : this.showService.createShow(payload).pipe(map(() => undefined))) as Observable<void>;

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.notification.success(this.editingShow ? 'Show updated.' : 'Show created.');
        this.resetForm();
        this.loadData();
      });
  }

  delete(show: Show): void {
    if (!confirm('Delete this show?')) {
      return;
    }
    this.showService.deleteShow(show.id).subscribe(() => {
      this.notification.success('Show deleted.');
      this.loadData();
    });
  }

  displayMovieTitle(show: Show): string {
    return show.movie?.title || this.movies.find(m => m.id === show.movieId)?.title || 'N/A';
  }

  displayTheater(show: Show): string {
    const theaterName = show.screen?.theater?.name || this.theaters.find(t => t.id === show.screen?.theaterId)?.name;
    const screenName = show.screen?.name || this.filteredScreens.find(s => s.id === show.screenId)?.name;
    return theaterName && screenName ? `${theaterName} - ${screenName}` : 'N/A';
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      movies: this.movieService.getMovies(),
      shows: this.showService.getShows(),
      theatersBase: this.theaterService.getTheaters()
    })
      .pipe(
        switchMap(({ movies, shows, theatersBase }) => {
          const details$ = theatersBase.length
            ? forkJoin(theatersBase.map(theater => this.theaterService.getTheater(theater.id)))
            : of([] as Theater[]);

          return details$.pipe(map(theaters => ({ movies, shows, theaters })));
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ movies, shows, theaters }) => {
        this.movies = movies;
        this.shows = shows;
        this.theaters = theaters;
        this.dataSource.data = shows;
      });
  }
}
