import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Book, BookStatus } from '../types';

interface SummaryProps {
  books: Book[];
}

export const Summary: React.FC<SummaryProps> = ({ books }) => {
  const totalCount = books.length;
  const favoriteCount = books.filter((b) => b.favorite).length;

  // Count by status
  const statusCounts: Record<BookStatus, number> = {
    'To Read': 0,
    'Reading': 0,
    'Finished': 0,
  };

  books.forEach((b) => {
    if (b.status in statusCounts) {
      statusCounts[b.status] += 1;
    }
  });

  // Tie breaker order: To Read (0), Reading (1), Finished (2)
  const tieOrder: Record<BookStatus, number> = {
    'To Read': 0,
    'Reading': 1,
    'Finished': 2,
  };

  // Only include statuses that appear (count > 0)
  const breakdown = (Object.keys(statusCounts) as BookStatus[])
    .filter((status) => statusCounts[status] > 0)
    .sort((a, b) => {
      // Sort by count descending
      if (statusCounts[b] !== statusCounts[a]) {
        return statusCounts[b] - statusCounts[a];
      }
      // Equal counts: To Read, then Reading, then Finished
      return tieOrder[a] - tieOrder[b];
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Books</Text>
          <Text style={styles.statValue} testID="book-count">
            {totalCount}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Favorites</Text>
          <Text style={styles.statValue} testID="favorite-count">
            {favoriteCount}
          </Text>
        </View>
      </View>

      {breakdown.length > 0 && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Status Breakdown:</Text>
          {breakdown.map((status) => (
            <View key={status} style={styles.breakdownRow}>
              <Text style={styles.statusName}>{status}</Text>
              <Text style={styles.statusCount}>{statusCounts[status]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 8,
    marginTop: 4,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  statusName: {
    fontSize: 13,
    color: '#333',
  },
  statusCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
});

