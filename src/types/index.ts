export type Genre = 'Fiction' | 'Non-Fiction' | 'Academic' | 'Other';

export type BookStatus = 'To Read' | 'Reading' | 'Finished';

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  genre: Genre;
  status: BookStatus;
  rating?: number | null;
  favorite: boolean;
  notes?: string;
  createdAt?: any;
}

export interface BookFormData {
  title: string;
  author: string;
  genre: Genre | '';
  status: BookStatus | '';
  rating?: string;
  notes?: string;
}

export interface FormErrors {
  title?: string;
  author?: string;
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
  Detail: { bookId: string };
};

