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
import { Book, BookFormData } from '../types';

const COLLECTION_NAME = 'books';

// Check if a book with same title & author already exists for this user (case-insensitive)
export const checkDuplicateBook = async (
  userId: string, 
  title: string, 
  author: string,
  excludeBookId?: string
): Promise<boolean> => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const cleanTitle = title.trim().toLowerCase();
  const cleanAuthor = author.trim().toLowerCase();

  for (const document of snapshot.docs) {
    if (excludeBookId && document.id === excludeBookId) continue;
    const data = document.data();
    if (
      data.title?.trim().toLowerCase() === cleanTitle && 
      data.author?.trim().toLowerCase() === cleanAuthor
    ) {
      return true;
    }
  }
  return false;
};

// Add a new book
export const addBook = async (userId: string, formData: BookFormData): Promise<string> => {
  const isDuplicate = await checkDuplicateBook(userId, formData.title, formData.author);
  if (isDuplicate) {
    throw new Error('A book with this title and author already exists.');
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title: formData.title.trim(),
    author: formData.author.trim(),
    genre: formData.genre,
    status: formData.status,
    rating: formData.rating && formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null,
    favorite: false,
    notes: formData.notes ? formData.notes.trim() : '',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Update an existing book
export const updateBook = async (
  bookId: string, 
  userId: string, 
  formData: BookFormData
): Promise<void> => {
  const isDuplicate = await checkDuplicateBook(userId, formData.title, formData.author, bookId);
  if (isDuplicate) {
    throw new Error('A book with this title and author already exists.');
  }

  const docRef = doc(db, COLLECTION_NAME, bookId);
  await updateDoc(docRef, {
    title: formData.title.trim(),
    author: formData.author.trim(),
    genre: formData.genre,
    status: formData.status,
    rating: formData.rating && formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null,
    notes: formData.notes ? formData.notes.trim() : '',
  });
};

// Toggle favorite flag
export const toggleFavoriteBook = async (bookId: string, currentFavorite: boolean): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, bookId);
  await updateDoc(docRef, {
    favorite: !currentFavorite,
  });
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, bookId);
  await deleteDoc(docRef);
};

// Subscribe to books for a user
export const subscribeUserBooks = (
  userId: string, 
  onUpdate: (books: Book[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  return onSnapshot(
    q, 
    (snapshot: any) => {
      const books: Book[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Book, 'id'>),
      }));

      // Sort alphabetically by title (case-insensitive), equal titles by author
      books.sort((a, b) => {
        const titleDiff = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        if (titleDiff !== 0) return titleDiff;
        return a.author.localeCompare(b.author, undefined, { sensitivity: 'base' });
      });

      onUpdate(books);
    },
    (error: any) => {
      if (onError) onError(error);
    }
  );
};

