import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';

import { BookingService } from '../../../../core/services/booking.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Show } from '../../../../core/models/show.model';
import { Seat } from '../../../../core/models/theater.model';
import { ShowService } from '../../../../core/services/show.service';

@Component({
  selector: 'app-seat-selection',
  standalone: false,
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss'
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  show?: Show;
  seatRows: Array<{ row: string; seats: Seat[] }> = [];
  selectedSeatIds = new Set<number>();
  lockExpiresAt?: string;

  loadingShow = false;
  loadingSeats = false;
  processing = false;

  private showId!: number;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly showService: ShowService,
    private readonly bookingService: BookingService,
    private readonly notification: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.showId = Number(params.get('showId'));
      if (!this.showId) {
        this.notification.error('Invalid show selected.');
        this.router.navigate(['/']);
        return;
      }
      this.fetchShowDetails();
      this.fetchSeats();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalAmount(): number {
    if (!this.show) {
      return 0;
    }
    return Number(this.show.price) * this.selectedSeatIds.size;
  }

  get selectedSeatLabels(): string[] {
    return this.seatRows
      .flatMap(row => row.seats)
      .filter(seat => this.selectedSeatIds.has(seat.id))
      .map(seat => `${seat.row}${seat.number}`)
      .sort();
  }

  toggleSeat(seat: Seat): void {
    if (seat.isBooked || seat.isLocked) {
      return;
    }
    if (this.selectedSeatIds.has(seat.id)) {
      this.selectedSeatIds.delete(seat.id);
    } else {
      this.selectedSeatIds.add(seat.id);
    }
  }

  isSelected(seat: Seat): boolean {
    return this.selectedSeatIds.has(seat.id);
  }

  confirmBooking(): void {
    const seatIds = Array.from(this.selectedSeatIds);
    if (!seatIds.length) {
      this.notification.info('Select at least one seat to continue.');
      return;
    }

    this.processing = true;

    this.bookingService
      .lockSeats({ showId: this.showId, seatIds })
      .pipe(
        switchMap(lockResponse => {
          if (!lockResponse.success) {
            this.notification.error(lockResponse.message || 'Unable to lock seats. Please try again.');
            return throwError(() => new Error(lockResponse.message || 'Unable to lock seats.'));
          }

          this.lockExpiresAt = lockResponse.data?.expiresAtUtc;
          return this.bookingService.confirmSeats({ showId: this.showId, seatIds });
        }),
        finalize(() => (this.processing = false))
      )
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notification.error(response.message || 'Unable to confirm booking. Please try again.');
            return;
          }

          this.notification.success('Booking confirmed! Enjoy the show!');
          this.selectedSeatIds.clear();
          this.fetchSeats();
          this.router.navigate(['/bookings']);
        },
        error: () => {
          this.fetchSeats();
        }
      });
  }

  refreshSeats(): void {
    this.fetchSeats();
  }

  private fetchShowDetails(): void {
    this.loadingShow = true;
    this.showService
      .getShowDetails(this.showId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingShow = false)))
      .subscribe(show => {
        this.show = show;
      });
  }

  private fetchSeats(): void {
    this.loadingSeats = true;
    this.showService
      .getSeatsForShow(this.showId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingSeats = false)))
      .subscribe(seats => {
        const grouped = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
          acc[seat.row] = acc[seat.row] ? [...acc[seat.row], seat] : [seat];
          return acc;
        }, {});

        this.seatRows = Object.entries(grouped)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([row, seatList]) => ({
            row,
            seats: seatList.sort((a, b) => a.number - b.number)
          }));
      });
  }
}
