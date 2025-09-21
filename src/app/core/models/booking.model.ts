export interface BookingSeatSummary {
  row: string;
  number: number;
}

export interface BookingSummary {
  id: number;
  movieTitle: string;
  screenName: string;
  startsAtUtc: string;
  status: string;
  totalAmount: number;
  seats: BookingSeatSummary[];
}

export type BookingDetail = BookingSummary;
