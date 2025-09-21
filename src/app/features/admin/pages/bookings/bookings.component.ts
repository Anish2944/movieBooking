import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { BookingDetail } from '../../../../core/models/booking.model';
import { BookingService } from '../../../../core/services/booking.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-bookings',
  standalone: false,
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent {
  form: FormGroup;
  booking?: BookingDetail;
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly bookingService: BookingService,
    private readonly notification: NotificationService
  ) {
    this.form = this.fb.group({
      bookingId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  lookup(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.form.value.bookingId;
    this.loading = true;
    this.bookingService
      .getBookingById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.booking = undefined;
            this.notification.error(response.message || 'Booking not found.');
            return;
          }

          this.booking = response.data;
        },
        error: () => {
          this.booking = undefined;
          this.notification.error('Unable to load booking.');
        }
      });
  }

  clear(): void {
    this.booking = undefined;
    this.form.reset();
  }

  seatList(): string {
    return this.booking?.seats?.map(seat => `${seat.row}${seat.number}`).join(', ') || '-';
  }
}
