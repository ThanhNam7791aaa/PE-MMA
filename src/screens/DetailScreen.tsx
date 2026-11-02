import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Book, Genre, BookStatus, BookFormData } from '../types';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import {
  updateBook,
  deleteBook,
  toggleFavoriteBook,
} from '../services/bookService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const GENRES: Genre[] = ['Fiction', 'Non-Fiction', 'Academic', 'Other'];
const STATUSES: BookStatus[] = ['To Read', 'Reading', 'Finished'];

export const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId } = route.params;
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGenre, setEditGenre] = useState<Genre | ''>('');
  const [editStatus, setEditStatus] = useState<BookStatus | ''>('');
  const [editRating, setEditRating] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [hasSubmittedEdit, setHasSubmittedEdit] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dropdown states
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Subscribe to book document
  useEffect(() => {
    const docRef = doc(db, 'books', bookId);
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<Book, 'id'>;
        const currentBook: Book = {
          id: docSnap.id,
          ...data,
        };
        setBook(currentBook);
        // Sync edit inputs if not currently editing
        if (!isEditing) {
          setEditTitle(currentBook.title || '');
          setEditAuthor(currentBook.author || '');
          setEditGenre(currentBook.genre || '');
          setEditStatus(currentBook.status || '');
          setEditRating(currentBook.rating !== null && currentBook.rating !== undefined ? String(currentBook.rating) : '');
          setEditNotes(currentBook.notes || '');
        }
      } else {
        // Book was deleted
        setBook(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookId, isEditing]);

  const getEditErrors = (
    t: string,
    a: string,
    g: string,
    s: string,
    r: string,
    n: string
  ) => {
    const errs: Record<string, string> = {};

    if (!t.trim()) {
      errs.title = 'Title is required';
    } else if (t.length > 100) {
      errs.title = 'Title must be at most 100 characters';
    }

    if (!a.trim()) {
      errs.author = 'Author is required';
    } else if (a.length > 60) {
      errs.author = 'Author must be at most 60 characters';
    }

    if (!g) {
      errs.genre = 'Please choose a genre';
    }

    if (!s) {
      errs.status = 'Please choose a status';
    }

    if (r.trim() !== '') {
      const num = Number(r);
      if (!Number.isInteger(num) || num < 0 || num > 5) {
        errs.rating = 'Rating must be a whole number from 0 to 5';
      }
    }

    if (n.length > 300) {
      errs.notes = 'Notes must be at most 300 characters';
    }

    return errs;
  };

  const editErrors = hasSubmittedEdit
    ? getEditErrors(editTitle, editAuthor, editGenre, editStatus, editRating, editNotes)
    : {};

  const handleToggleFavorite = async () => {
    if (!book) return;
    try {
      await toggleFavoriteBook(book.id, book.favorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleStartEdit = () => {
    if (!book) return;
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditGenre(book.genre || '');
    setEditStatus(book.status || '');
    setEditRating(book.rating !== null && book.rating !== undefined ? String(book.rating) : '');
    setEditNotes(book.notes || '');
    setHasSubmittedEdit(false);
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMessage('');
    setHasSubmittedEdit(false);
  };

  const handleSaveEdit = async () => {
    setHasSubmittedEdit(true);
    setErrorMessage('');

    const errors = getEditErrors(editTitle, editAuthor, editGenre, editStatus, editRating, editNotes);
    if (Object.keys(errors).length > 0 || !user || !book) {
      return;
    }

    setSaveLoading(true);
    try {
      const formData: BookFormData = {
        title: editTitle,
        author: editAuthor,
        genre: editGenre,
        status: editStatus,
        rating: editRating,
        notes: editNotes,
      };

      await updateBook(book.id, user.uid, formData);
      setIsEditing(false);
      setHasSubmittedEdit(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update book');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    if (!book) return;

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(book.id);
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting book:', err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Book not found.</Text>
        <Button title="Back to List" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* EDIT MODE */}
      {isEditing ? (
        <View style={styles.card}>
          <Text style={styles.screenTitle}>Edit Book</Text>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <Input
            label="Title *"
            value={editTitle}
            onChangeText={(t) => {
              setEditTitle(t);
              setErrorMessage('');
            }}
            error={editErrors.title}
            testID="edit-title-input"
          />

          <Input
            label="Author *"
            value={editAuthor}
            onChangeText={(a) => {
              setEditAuthor(a);
              setErrorMessage('');
            }}
            error={editErrors.author}
            testID="edit-author-input"
          />

          {/* Genre Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Genre *</Text>
            <TouchableOpacity
              style={[
                styles.selectBox,
                !!editErrors.genre && styles.selectBoxError,
              ]}
              onPress={() => setGenreDropdownOpen(!genreDropdownOpen)}
              testID="edit-genre-select"
            >
              <Text style={[styles.selectBoxText, !editGenre && styles.placeholderText]}>
                {editGenre ? editGenre : 'Choose genre'}
              </Text>
            </TouchableOpacity>
            {genreDropdownOpen && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEditGenre('');
                    setGenreDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>Choose genre</Text>
                </TouchableOpacity>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEditGenre(g);
                      setGenreDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        editGenre === g && styles.activeDropdownText,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!editErrors.genre && (
              <Text style={styles.errorTextSmall}>{editErrors.genre}</Text>
            )}
          </View>

          {/* Status Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Status *</Text>
            <TouchableOpacity
              style={[
                styles.selectBox,
                !!editErrors.status && styles.selectBoxError,
              ]}
              onPress={() => setStatusDropdownOpen(!statusDropdownOpen)}
              testID="edit-status-select"
            >
              <Text style={[styles.selectBoxText, !editStatus && styles.placeholderText]}>
                {editStatus ? editStatus : 'Choose status'}
              </Text>
            </TouchableOpacity>
            {statusDropdownOpen && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEditStatus('');
                    setStatusDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>Choose status</Text>
                </TouchableOpacity>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEditStatus(s);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        editStatus === s && styles.activeDropdownText,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!editErrors.status && (
              <Text style={styles.errorTextSmall}>{editErrors.status}</Text>
            )}
          </View>

          <Input
            label="Rating (0 - 5)"
            value={editRating}
            onChangeText={(r) => {
              setEditRating(r);
              setErrorMessage('');
            }}
            keyboardType="numeric"
            error={editErrors.rating}
            testID="edit-rating-input"
          />

          <Input
            label="Notes"
            value={editNotes}
            onChangeText={(n) => {
              setEditNotes(n);
              setErrorMessage('');
            }}
            multiline
            numberOfLines={3}
            error={editErrors.notes}
            testID="edit-notes-input"
          />

          <View style={styles.buttonRow}>
            <Button
              title="Save"
              onPress={handleSaveEdit}
              loading={saveLoading}
              style={{ flex: 1, marginRight: 8 }}
              testID="save-edit-button"
            />
            <Button
              title="Cancel"
              onPress={handleCancelEdit}
              variant="outline"
              style={{ flex: 1 }}
              testID="cancel-edit-button"
            />
          </View>
        </View>
      ) : (
        /* VIEW MODE */
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.detailTitle}>{book.title}</Text>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.favoriteButton}
              testID="detail-favorite-toggle"
            >
              <Text style={styles.starIcon}>{book.favorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.detailAuthor}>by {book.author}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Genre:</Text>
            <Text style={styles.infoValue}>{book.genre}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{book.status}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rating:</Text>
            <Text style={styles.infoValue}>
              {book.rating !== null && book.rating !== undefined ? `${book.rating} / 5` : 'Not rated'}
            </Text>
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.infoLabel}>Notes:</Text>
            <Text style={styles.notesValue}>
              {book.notes ? book.notes : 'No notes added.'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Edit Book"
              onPress={handleStartEdit}
              variant="primary"
              testID="edit-book-button"
            />
            <Button
              title="Delete Book"
              onPress={handleDelete}
              variant="danger"
              testID="delete-book-button"
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginRight: 10,
  },
  favoriteButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 28,
    color: '#f59e0b',
  },
  detailAuthor: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  infoValue: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 14,
    paddingTop: 10,
  },
  notesValue: {
    marginTop: 6,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    marginTop: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectBoxError: {
    borderColor: '#e53935',
  },
  selectBoxText: {
    fontSize: 16,
    color: '#111',
  },
  placeholderText: {
    color: '#888',
  },
  dropdownOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  activeDropdownText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  errorTextSmall: {
    color: '#e53935',
    fontSize: 12,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
  },
});

