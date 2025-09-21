export interface Theater {
  id: number;
  name: string;
  location?: string;
  screens?: Screen[];
}

export interface Screen {
  id: number;
  theaterId: number;
  name: string;
  totalSeats: number;
  theater?: Theater;
  seats?: Seat[];
}

export interface Seat {
  id: number;
  row: string;
  number: number;
  isDisabled?: boolean;
  isBooked?: boolean;
  isLocked?: boolean;
}