import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';

import { Movie } from '../../../../core/models/movie.model';
import { MovieService } from '../../../../core/services/movie.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-movies',
  standalone: false,
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  readonly apiBase = environment.apiUrl;

  form: FormGroup;
  movies: Movie[] = [];
  dataSource = new MatTableDataSource<Movie>([]);
  displayedColumns = ['poster', 'title', 'duration', 'actions'];

  loading = false;
  saving = false;
  selectedPoster?: File;
  editingMovie?: Movie;

  constructor(
    private readonly fb: FormBuilder,
    private readonly movieService: MovieService,
    private readonly notification: NotificationService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      durationMinutes: [120, [Validators.required, Validators.min(30)]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.fetchMovies();
  }

  get posterName(): string {
    return this.selectedPoster ? this.selectedPoster.name : 'No file selected';
  }

  edit(movie: Movie): void {
    this.editingMovie = movie;
    this.form.patchValue({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      imageUrl: movie.imageUrl ?? ''
    });
    this.selectedPoster = undefined;
  }

  resetForm(): void {
    this.editingMovie = undefined;
    this.selectedPoster = undefined;
    this.form.reset({ durationMinutes: 120 });
  }

  onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedPoster = input.files[0];
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description);
    formData.append('durationMinutes', String(this.form.value.durationMinutes));

    const imageUrl = this.form.value.imageUrl?.trim();
    if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    }

    if (this.selectedPoster) {
      formData.append('poster', this.selectedPoster);
    }

    this.saving = true;

    const request = this.editingMovie
      ? this.movieService.updateMovie(this.editingMovie.id, formData)
      : this.movieService.createMovie(formData);

    request
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.notification.success(this.editingMovie ? 'Movie updated successfully.' : 'Movie added successfully.');
          this.resetForm();
          this.fetchMovies();
        }
      });
  }

  delete(movie: Movie): void {
    if (!confirm(`Delete ${movie.title}?`)) {
      return;
    }
    this.movieService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.notification.success('Movie removed.');
        this.fetchMovies();
      }
    });
  }

  resolvePoster(movie: Movie): string {
    if (!movie.imageUrl) {
      return 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80';
    }
    if (movie.imageUrl.startsWith('http')) {
      return movie.imageUrl;
    }
    return `${this.apiBase}${movie.imageUrl}`;
  }

  fetchMovies(): void {
    this.loading = true;
    this.movieService
      .getMovies()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(movies => {
        this.movies = movies;
        this.dataSource.data = movies;
      });
  }
}
