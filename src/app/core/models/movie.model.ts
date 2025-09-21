export interface Movie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  imageUrl?: string | null;
  genre?: string | null;
  language?: string | null;
  rating?: string | null;
  releaseDate?: string | null;
}