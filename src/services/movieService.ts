import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Movie, MovieFormData } from '../types';

const COLLECTION_NAME = 'movies';

// Check if a movie with same title & director already exists for this user (case-insensitive)
export const checkDuplicateMovie = async (
  userId: string, 
  title: string, 
  director: string,
  excludeMovieId?: string
): Promise<boolean> => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const cleanTitle = title.trim().toLowerCase();
  const cleanDirector = director.trim().toLowerCase();

  for (const document of snapshot.docs) {
    if (excludeMovieId && document.id === excludeMovieId) continue;
    const data = document.data();
    if (
      data.title?.trim().toLowerCase() === cleanTitle && 
      data.director?.trim().toLowerCase() === cleanDirector
    ) {
      return true;
    }
  }
  return false;
};

// Add a new movie
export const addMovie = async (userId: string, formData: MovieFormData): Promise<string> => {
  const isDuplicate = await checkDuplicateMovie(userId, formData.title, formData.director);
  if (isDuplicate) {
    throw new Error('A movie with this title and director already exists.');
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title: formData.title.trim(),
    director: formData.director.trim(),
    genre: formData.genre,
    status: formData.status,
    rating: formData.rating && formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null,
    favorite: false,
    notes: formData.notes ? formData.notes.trim() : '',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Update an existing movie
export const updateMovie = async (
  movieId: string, 
  userId: string, 
  formData: MovieFormData
): Promise<void> => {
  const isDuplicate = await checkDuplicateMovie(userId, formData.title, formData.director, movieId);
  if (isDuplicate) {
    throw new Error('A movie with this title and director already exists.');
  }

  const docRef = doc(db, COLLECTION_NAME, movieId);
  await updateDoc(docRef, {
    title: formData.title.trim(),
    director: formData.director.trim(),
    genre: formData.genre,
    status: formData.status,
    rating: formData.rating && formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null,
    notes: formData.notes ? formData.notes.trim() : '',
  });
};

// Toggle favorite flag
export const toggleFavoriteMovie = async (movieId: string, currentFavorite: boolean): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, movieId);
  await updateDoc(docRef, {
    favorite: !currentFavorite,
  });
};

// Delete a movie
export const deleteMovie = async (movieId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, movieId);
  await deleteDoc(docRef);
};

// Subscribe to movies for a user
export const subscribeUserMovies = (
  userId: string, 
  onUpdate: (movies: Movie[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  return onSnapshot(
    q, 
    (snapshot: any) => {
      const movies: Movie[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Movie, 'id'>),
      }));

      // Sort alphabetically by title (case-insensitive), equal titles by director
      movies.sort((a, b) => {
        const titleDiff = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        if (titleDiff !== 0) return titleDiff;
        return a.director.localeCompare(b.director, undefined, { sensitivity: 'base' });
      });

      onUpdate(movies);
    },
    (error: any) => {
      if (onError) onError(error);
    }
  );
};

