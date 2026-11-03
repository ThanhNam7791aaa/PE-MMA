export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Horror';

export type MovieStatus = 'Plan to Watch' | 'Watching' | 'Watched';

export interface Movie {
  id: string;
  userId: string;
  title: string;
  director: string;
  genre: Genre;
  status: MovieStatus;
  rating?: number | null;
  favorite: boolean;
  notes?: string;
  createdAt?: any;
}

export interface MovieFormData {
  title: string;
  director: string;
  genre: Genre | '';
  status: MovieStatus | '';
  rating?: string;
  notes?: string;
}

export interface FormErrors {
  title?: string;
  director?: string;
  genre?: string;
  status?: string;
  rating?: string;
  notes?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  List: undefined;
  Detail: { movieId: string };
};
