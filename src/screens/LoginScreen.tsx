import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { loginUser } from '../services/firebaseAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const getValidationErrors = (em: string, pw: string) => {
    const errs: { email?: string; password?: string } = {};

    if (!em.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(em)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!pw) {
      errs.password = 'Password is required';
    }

    return errs;
  };

  const errors = hasSubmitted ? getValidationErrors(email, password) : {};

  const handleLogin = async () => {
    setHasSubmitted(true);
    setAuthError('');

    const validationErrors = getValidationErrors(email, password);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      // Navigation to List is automatically handled by AuthContext state change in AppNavigator
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Sign In</Text>

      {/* Global Auth Error */}
      {!!authError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorAuthText} testID="error-auth">
            {authError}
          </Text>
        </View>
      )}

      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setAuthError('');
        }}
        error={errors.email}
        testID="login-email-input"
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setAuthError('');
        }}
        error={errors.password}
        testID="login-password-input"
      />

      <Button
        title="Login"
        onPress={handleLogin}
        loading={loading}
        testID="login-submit-button"
      />

      <TouchableOpacity
        style={styles.switchRow}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.switchLink}>Register</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorAuthText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  switchRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

