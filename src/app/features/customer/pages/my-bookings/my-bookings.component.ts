import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { BookingSummary } from '../../../../core/models/booking.model';
import { BookingService } from '../../../../core/services/booking.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: BookingSummary[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDateTime(iso: string): string {
    return dayjs.utc(iso).local().format('ddd, MMM D • h:mm A');
  }

  seatList(booking: BookingSummary): string {
    return (booking.seats || [])
      .map(seat => `${seat.row}${seat.number}`)
      .sort()
      .join(', ');
  }

  private fetchBookings(): void {
    this.loading = true;
    this.bookingService
      .getMyBookings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe(response => {
        this.bookings = response.success && response.data ? response.data : [];
      });
  }
}
