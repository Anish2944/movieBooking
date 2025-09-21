import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs/operators';

import { Screen, Theater } from '../../../../core/models/theater.model';
import {
  CreateScreenPayload,
  CreateTheaterPayload,
  GenerateSeatsPayload,
  TheaterService
} from '../../../../core/services/theater.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-theaters',
  standalone: false,
  templateUrl: './theaters.component.html',
  styleUrl: './theaters.component.scss'
})
export class TheatersComponent implements OnInit {
  theaters: Theater[] = [];
  selectedTheater?: Theater;

  theaterForm: FormGroup;
  screenForm: FormGroup;
  seatForm: FormGroup;

  loading = false;
  savingTheater = false;
  savingScreen = false;
  generatingSeats = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly theaterService: TheaterService,
    private readonly notification: NotificationService
  ) {
    this.theaterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.screenForm = this.fb.group({
      name: ['', [Validators.required]],
      totalSeats: [60, [Validators.required, Validators.min(10)]]
    });

    this.seatForm = this.fb.group({
      rows: [5, [Validators.required, Validators.min(1)]],
      seatsPerRow: [12, [Validators.required, Validators.min(1)]],
      startRowAscii: [65, [Validators.min(65), Validators.max(90)]]
    });
  }

  ngOnInit(): void {
    this.fetchTheaters();
  }

  selectTheater(theater: Theater): void {
    this.theaterService.getTheater(theater.id).subscribe(detail => {
      this.selectedTheater = detail;
      this.theaterForm.patchValue({ name: detail.name, location: detail.location });
    });
  }

  clearSelection(): void {
    this.selectedTheater = undefined;
    this.theaterForm.reset();
    this.screenForm.reset({ totalSeats: 60 });
    this.seatForm.reset({ rows: 5, seatsPerRow: 12, startRowAscii: 65 });
  }

  submitTheater(): void {
    if (this.theaterForm.invalid) {
      this.theaterForm.markAllAsTouched();
      return;
    }

    const payload: CreateTheaterPayload = {
      name: this.theaterForm.value.name,
      location: this.theaterForm.value.location
    };

    this.savingTheater = true;

    const request$ = this.selectedTheater
      ? this.theaterService
          .updateTheater(this.selectedTheater.id, payload)
          .pipe(switchMap(() => this.theaterService.getTheater(this.selectedTheater!.id)))
      : this.theaterService.createTheater(payload);

    request$
      .pipe(finalize(() => (this.savingTheater = false)))
      .subscribe(theater => {
        this.notification.success(this.selectedTheater ? 'Theater updated.' : 'Theater created.');
        this.fetchTheaters(theater.id);
      });
  }

  deleteTheater(theater: Theater): void {
    if (!confirm(`Delete ${theater.name}? This will remove its screens.`)) {
      return;
    }
    this.theaterService.deleteTheater(theater.id).subscribe(() => {
      this.notification.success('Theater deleted.');
      if (this.selectedTheater?.id === theater.id) {
        this.clearSelection();
      }
      this.fetchTheaters();
    });
  }

  createScreen(): void {
    if (!this.selectedTheater) {
      this.notification.info('Select a theater first.');
      return;
    }
    if (this.screenForm.invalid) {
      this.screenForm.markAllAsTouched();
      return;
    }

    const payload: CreateScreenPayload = {
      theaterId: this.selectedTheater.id,
      name: this.screenForm.value.name,
      totalSeats: this.screenForm.value.totalSeats
    };

    this.savingScreen = true;
    this.theaterService
      .createScreen(payload)
      .pipe(finalize(() => (this.savingScreen = false)))
      .subscribe(() => {
        this.notification.success('Screen created.');
        this.screenForm.reset({ totalSeats: 60 });
        this.refreshSelected();
      });
  }

  generateSeats(screen: Screen): void {
    if (this.seatForm.invalid) {
      this.seatForm.markAllAsTouched();
      return;
    }

    const payload: GenerateSeatsPayload = {
      screenId: screen.id,
      rows: this.seatForm.value.rows,
      seatsPerRow: this.seatForm.value.seatsPerRow,
      startRowAscii: this.seatForm.value.startRowAscii
    };

    this.generatingSeats = true;
    this.theaterService
      .generateSeats(payload)
      .pipe(finalize(() => (this.generatingSeats = false)))
      .subscribe(response => {
        this.notification.success(`Created ${response.created} seats.`);
        this.refreshSelected();
      });
  }

  refreshSelected(): void {
    if (!this.selectedTheater) {
      return;
    }
    this.theaterService.getTheater(this.selectedTheater.id).subscribe(detail => {
      this.selectedTheater = detail;
    });
  }

  private fetchTheaters(selectId?: number): void {
    this.loading = true;
    this.theaterService
      .getTheaters()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(theaters => {
        this.theaters = theaters;
        if (selectId) {
          const match = theaters.find(t => t.id === selectId);
          if (match) {
            this.selectTheater(match);
          }
        }
      });
  }
}
