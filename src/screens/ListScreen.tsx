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
import { RootStackParamList, Movie, Genre, MovieStatus, MovieFormData } from '../types';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Summary } from '../components/Summary';
import { useAuth } from '../context/AuthContext';
import {
  subscribeUserMovies,
  addMovie,
  toggleFavoriteMovie,
} from '../services/movieService';

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

const GENRES: Genre[] = ['Action', 'Comedy', 'Drama', 'Horror'];
const STATUSES: MovieStatus[] = ['Plan to Watch', 'Watching', 'Watched'];

export const ListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  // Movies state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [status, setStatus] = useState<MovieStatus | ''>('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [movieSuccess, setMovieSuccess] = useState('');
  const [movieError, setMovieError] = useState('');

  // Filter & Search state
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown expansion state for Genre and Status in Form
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Subscribe to Firestore movies
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeUserMovies(
      user.uid,
      (fetchedMovies) => {
        setMovies(fetchedMovies);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching movies:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Form Validation logic
  const getFormErrors = (
    t: string,
    d: string,
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

    // Director
    if (!d.trim()) {
      errs.director = 'Director is required';
    } else if (d.length > 60) {
      errs.director = 'Director must be at most 60 characters';
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
    ? getFormErrors(title, director, genre, status, rating, notes)
    : {};

  // Handle Add Movie
  const handleAddMovie = async () => {
    setHasSubmittedForm(true);
    setMovieSuccess('');
    setMovieError('');

    const errors = getFormErrors(title, director, genre, status, rating, notes);
    if (Object.keys(errors).length > 0 || !user) {
      return;
    }

    setFormLoading(true);
    try {
      const formData: MovieFormData = {
        title,
        director,
        genre,
        status,
        rating,
        notes,
      };

      await addMovie(user.uid, formData);

      // Clear form
      setTitle('');
      setDirector('');
      setGenre('');
      setStatus('');
      setRating('');
      setNotes('');
      setHasSubmittedForm(false);
      setMovieSuccess('Movie added');
    } catch (err: any) {
      setMovieError(err.message || 'Failed to add movie');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (movie: Movie) => {
    try {
      await toggleFavoriteMovie(movie.id, movie.favorite);
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

  // Filtered and searched movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Genre filter
      if (selectedGenreFilter !== 'All' && movie.genre !== selectedGenreFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'All' && movie.status !== selectedStatusFilter) {
        return false;
      }
      // Favorites only
      if (favoritesOnly && !movie.favorite) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = movie.title?.toLowerCase().includes(query);
        const matchDirector = movie.director?.toLowerCase().includes(query);
        if (!matchTitle && !matchDirector) {
          return false;
        }
      }
      return true;
    });
  }, [movies, selectedGenreFilter, selectedStatusFilter, favoritesOnly, searchQuery]);

  return (
    <View style={styles.container} testID="list-screen">
      <Header title="CineList" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SECTION A: ADD MOVIE FORM */}
        <View style={styles.sectionContainer} testID="movie-form">
          <Text style={styles.sectionTitle}>Add a New Movie</Text>

          {/* Success banner */}
          {!!movieSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText} testID="movie-success">
                {movieSuccess}
              </Text>
            </View>
          )}

          {/* Error banner */}
          {!!movieError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText} testID="error-movie">
                {movieError}
              </Text>
            </View>
          )}

          <Input
            label="Title *"
            placeholder="Movie title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setMovieSuccess('');
              setMovieError('');
            }}
            error={formErrors.title}
            testID="movie-title-input"
          />

          <Input
            label="Director *"
            placeholder="Movie director"
            value={director}
            onChangeText={(text) => {
              setDirector(text);
              setMovieSuccess('');
              setMovieError('');
            }}
            error={formErrors.director}
            testID="movie-director-input"
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
              setMovieSuccess('');
              setMovieError('');
            }}
            error={formErrors.rating}
            testID="movie-rating-input"
          />

          <Input
            label="Notes"
            placeholder="Personal notes (up to 300 characters)"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              setMovieSuccess('');
              setMovieError('');
            }}
            error={formErrors.notes}
            testID="movie-notes-input"
          />

          <Button
            title="Add Movie"
            onPress={handleAddMovie}
            loading={formLoading}
            testID="movie-submit-button"
          />
        </View>

        {/* SECTION C: FILTER, SEARCH AND SUMMARY */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Filter & Search</Text>

          {/* Search box */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or director..."
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
          <Summary movies={filteredMovies} />
        </View>

        {/* SECTION B: THE LIST */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Movies</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : filteredMovies.length === 0 ? (
            <View style={styles.emptyContainer} testID="movies-empty">
              <Text style={styles.emptyText}>No movies found</Text>
            </View>
          ) : (
            filteredMovies.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                style={styles.movieCard}
                testID="movie-item"
                onPress={() => navigation.navigate('Detail', { movieId: movie.id })}
                activeOpacity={0.7}
              >
                <View style={styles.movieHeader}>
                  <Text style={styles.movieTitle}>{movie.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(movie)}
                    style={styles.favoriteButton}
                    testID={`favorite-toggle-${movie.id}`}
                  >
                    <Text style={styles.starIcon}>
                      {movie.favorite ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.movieDirector}>Directed by {movie.director}</Text>

                <View style={styles.badgeRow}>
                  <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{movie.genre}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{movie.status}</Text>
                  </View>
                  {movie.rating !== null && movie.rating !== undefined && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>★ {movie.rating}/5</Text>
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
  movieCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginRight: 10,
  },
  movieDirector: {
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
