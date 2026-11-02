import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Book, Genre, BookStatus, BookFormData } from '../types';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Summary } from '../components/Summary';
import { useAuth } from '../context/AuthContext';
import {
  subscribeUserBooks,
  addBook,
  toggleFavoriteBook,
} from '../services/bookService';

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

const GENRES: Genre[] = ['Fiction', 'Non-Fiction', 'Academic', 'Other'];
const STATUSES: BookStatus[] = ['To Read', 'Reading', 'Finished'];

export const ListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [status, setStatus] = useState<BookStatus | ''>('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState('');
  const [bookError, setBookError] = useState('');

  // Filter & Search state
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown expansion state for Genre and Status in Form
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Subscribe to Firestore books
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeUserBooks(
      user.uid,
      (fetchedBooks) => {
        setBooks(fetchedBooks);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching books:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Form Validation logic
  const getFormErrors = (
    t: string,
    a: string,
    g: string,
    s: string,
    r: string,
    n: string
  ) => {
    const errs: Record<string, string> = {};

    // Title
    if (!t.trim()) {
      errs.title = 'Title is required';
    } else if (t.length > 100) {
      errs.title = 'Title must be at most 100 characters';
    }

    // Author
    if (!a.trim()) {
      errs.author = 'Author is required';
    } else if (a.length > 60) {
      errs.author = 'Author must be at most 60 characters';
    }

    // Genre
    if (!g) {
      errs.genre = 'Please choose a genre';
    }

    // Status
    if (!s) {
      errs.status = 'Please choose a status';
    }

    // Rating
    if (r.trim() !== '') {
      const num = Number(r);
      if (!Number.isInteger(num) || num < 0 || num > 5) {
        errs.rating = 'Rating must be a whole number from 0 to 5';
      }
    }

    // Notes
    if (n.length > 300) {
      errs.notes = 'Notes must be at most 300 characters';
    }

    return errs;
  };

  const formErrors = hasSubmittedForm
    ? getFormErrors(title, author, genre, status, rating, notes)
    : {};

  // Handle Add Book
  const handleAddBook = async () => {
    setHasSubmittedForm(true);
    setBookSuccess('');
    setBookError('');

    const errors = getFormErrors(title, author, genre, status, rating, notes);
    if (Object.keys(errors).length > 0 || !user) {
      return;
    }

    setFormLoading(true);
    try {
      const formData: BookFormData = {
        title,
        author,
        genre,
        status,
        rating,
        notes,
      };

      await addBook(user.uid, formData);

      // Clear form
      setTitle('');
      setAuthor('');
      setGenre('');
      setStatus('');
      setRating('');
      setNotes('');
      setHasSubmittedForm(false);
      setBookSuccess('Book added');
    } catch (err: any) {
      setBookError(err.message || 'Failed to add book');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (book: Book) => {
    try {
      await toggleFavoriteBook(book.id, book.favorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedGenreFilter('All');
    setSelectedStatusFilter('All');
    setFavoritesOnly(false);
    setSearchQuery('');
  };

  // Filtered and searched books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Genre filter
      if (selectedGenreFilter !== 'All' && book.genre !== selectedGenreFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'All' && book.status !== selectedStatusFilter) {
        return false;
      }
      // Favorites only
      if (favoritesOnly && !book.favorite) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = book.title?.toLowerCase().includes(query);
        const matchAuthor = book.author?.toLowerCase().includes(query);
        if (!matchTitle && !matchAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [books, selectedGenreFilter, selectedStatusFilter, favoritesOnly, searchQuery]);

  return (
    <View style={styles.container} testID="list-screen">
      <Header title="BookShelf" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SECTION A: ADD BOOK FORM */}
        <View style={styles.sectionContainer} testID="book-form">
          <Text style={styles.sectionTitle}>Add a New Book</Text>

          {/* Success banner */}
          {!!bookSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText} testID="book-success">
                {bookSuccess}
              </Text>
            </View>
          )}

          {/* Error banner */}
          {!!bookError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText} testID="error-book">
                {bookError}
              </Text>
            </View>
          )}

          <Input
            label="Title *"
            placeholder="Book title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setBookSuccess('');
              setBookError('');
            }}
            error={formErrors.title}
            testID="book-title-input"
          />

          <Input
            label="Author *"
            placeholder="Book author"
            value={author}
            onChangeText={(text) => {
              setAuthor(text);
              setBookSuccess('');
              setBookError('');
            }}
            error={formErrors.author}
            testID="book-author-input"
          />

          {/* Genre Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Genre *</Text>
            <TouchableOpacity
              style={[
                styles.selectBox,
                !!formErrors.genre && styles.selectBoxError,
              ]}
              onPress={() => setGenreDropdownOpen(!genreDropdownOpen)}
              testID="genre-select"
            >
              <Text style={[styles.selectBoxText, !genre && styles.placeholderText]}>
                {genre ? genre : 'Choose genre'}
              </Text>
            </TouchableOpacity>
            {genreDropdownOpen && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGenre('');
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
                      setGenre(g);
                      setGenreDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, genre === g && styles.activeDropdownText]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!formErrors.genre && (
              <Text style={styles.errorTextSmall}>{formErrors.genre}</Text>
            )}
          </View>

          {/* Status Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Status *</Text>
            <TouchableOpacity
              style={[
                styles.selectBox,
                !!formErrors.status && styles.selectBoxError,
              ]}
              onPress={() => setStatusDropdownOpen(!statusDropdownOpen)}
              testID="status-select"
            >
              <Text style={[styles.selectBoxText, !status && styles.placeholderText]}>
                {status ? status : 'Choose status'}
              </Text>
            </TouchableOpacity>
            {statusDropdownOpen && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setStatus('');
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
                      setStatus(s);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, status === s && styles.activeDropdownText]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!formErrors.status && (
              <Text style={styles.errorTextSmall}>{formErrors.status}</Text>
            )}
          </View>

          <Input
            label="Rating (0 - 5)"
            placeholder="e.g. 5"
            keyboardType="numeric"
            value={rating}
            onChangeText={(text) => {
              setRating(text);
              setBookSuccess('');
              setBookError('');
            }}
            error={formErrors.rating}
            testID="book-rating-input"
          />

          <Input
            label="Notes"
            placeholder="Personal notes (up to 300 characters)"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              setBookSuccess('');
              setBookError('');
            }}
            error={formErrors.notes}
            testID="book-notes-input"
          />

          <Button
            title="Add Book"
            onPress={handleAddBook}
            loading={formLoading}
            testID="book-submit-button"
          />
        </View>

        {/* SECTION C: FILTER, SEARCH AND SUMMARY */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Filter & Search</Text>

          {/* Search box */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or author..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />

          {/* Genre filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Genre:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', ...GENRES].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    selectedGenreFilter === item && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedGenreFilter(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedGenreFilter === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', ...STATUSES].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    selectedStatusFilter === item && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedStatusFilter(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedStatusFilter === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Favorites only switch */}
          <View style={styles.switchContainer}>
            <Text style={styles.filterLabel}>Favorites only:</Text>
            <Switch
              value={favoritesOnly}
              onValueChange={setFavoritesOnly}
              testID="favorites-switch"
            />
          </View>

          {/* Clear button */}
          <Button
            title="Clear Filters"
            onPress={handleClearFilters}
            variant="outline"
            testID="clear-filters-button"
          />

          {/* Summary */}
          <Summary books={filteredBooks} />
        </View>

        {/* SECTION B: THE LIST */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Books</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : filteredBooks.length === 0 ? (
            <View style={styles.emptyContainer} testID="books-empty">
              <Text style={styles.emptyText}>No books found</Text>
            </View>
          ) : (
            filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                testID="book-item"
                onPress={() => navigation.navigate('Detail', { bookId: book.id })}
                activeOpacity={0.7}
              >
                <View style={styles.bookHeader}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(book)}
                    style={styles.favoriteButton}
                    testID={`favorite-toggle-${book.id}`}
                  >
                    <Text style={styles.starIcon}>
                      {book.favorite ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.bookAuthor}>by {book.author}</Text>

                <View style={styles.badgeRow}>
                  <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{book.genre}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{book.status}</Text>
                  </View>
                  {book.rating !== null && book.rating !== undefined && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>★ {book.rating}/5</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContent: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 14,
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
    overflow: 'hidden',
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
  successBanner: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginRight: 10,
    minWidth: 60,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#495057',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingRight: 8,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  bookCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginRight: 10,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
    marginBottom: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 22,
    color: '#f59e0b',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreBadge: {
    backgroundColor: '#e0f2fe',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  genreBadgeText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    backgroundColor: '#fef9c3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '600',
  },
});

