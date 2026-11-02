import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with Login and Register buttons */}
      <Header
        title="BookShelf"
        showAuthButtons={true}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title and App Description */}
        <View style={styles.heroSection}>
          <Text style={styles.title} testID="home-title">
            BookShelf
          </Text>
          <Text style={styles.description}>
            Your personal private book tracker. Organize what you read, keep track of your progress, and rate your favorites easily.
          </Text>
        </View>

        {/* Feature Cards (at least 3 cards) */}
        <View style={styles.featuresContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Track your books</Text>
            <Text style={styles.cardText}>
              Keep all your books organized in one place with details like genre, rating, and personal notes.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔄 Sort by status</Text>
            <Text style={styles.cardText}>
              Categorize your reading journey into To Read, Reading, and Finished with instant filtering.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Rate your favorites</Text>
            <Text style={styles.cardText}>
              Mark your top reads as favorites and give whole-number ratings from 0 to 5.
            </Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <Button
            title="Sign In to Your Account"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
          />
          <Button
            title="Create a New Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginVertical: 15,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
  },
});

