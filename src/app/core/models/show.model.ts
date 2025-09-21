import { Movie } from './movie.model';
import { Screen, Theater } from './theater.model';

export interface Show {
  id: number;
  movieId: number;
  screenId: number;
  startsAtUtc: string;
  price: number;
  movie?: Movie;
  screen?: Screen & { theater?: Theater };
}

export interface ShowSummary {
  id: number;
  startsAtUtc: string;
  price: number;
  screen: string;
  theater: string;
}