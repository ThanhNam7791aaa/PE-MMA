import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { registerUser } from '../services/firebaseAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form validation function
  const getValidationErrors = (em: string, pw: string, cpw: string) => {
    const errs: { email?: string; password?: string; confirmPassword?: string } = {};

    // Email
    if (!em.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(em)) {
      errs.email = 'Please enter a valid email address';
    }

    // Password
    if (!pw) {
      errs.password = 'Password is required';
    } else if (pw.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    // Confirm password
    if (!cpw) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (cpw !== pw) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  const errors = hasSubmitted ? getValidationErrors(email, password, confirmPassword) : {};

  const handleRegister = async () => {
    setHasSubmitted(true);
    setAuthError('');
    setSuccessMessage('');

    const validationErrors = getValidationErrors(email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password);
      setSuccessMessage('Registration successful');
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Create Account</Text>

      {/* Global Auth Error */}
      {!!authError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorAuthText} testID="error-auth">
            {authError}
          </Text>
        </View>
      )}

      {/* Success Message */}
      {!!successMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText} testID="form-success">
            {successMessage}
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
        testID="register-email-input"
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
        testID="register-password-input"
      />

      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setAuthError('');
        }}
        error={errors.confirmPassword}
        testID="register-confirm-password-input"
      />

      <Button
        title="Register"
        onPress={handleRegister}
        loading={loading}
        testID="register-submit-button"
      />

      <TouchableOpacity
        style={styles.switchRow}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchLink}>Login</Text>
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
  successBanner: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600',
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

