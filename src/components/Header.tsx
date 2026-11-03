import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  showAuthButtons?: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'CineList',
  showAuthButtons = false,
  onLoginPress,
  onRegisterPress,
}) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightContainer}>
        {user ? (
          <View style={styles.userRow}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={logout}
              testID="logout-button"
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : showAuthButtons ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.smallButton, styles.loginBtn]} 
              onPress={onLoginPress}
              testID="nav-login-button"
            >
              <Text style={styles.smallButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.smallButton, styles.registerBtn]} 
              onPress={onRegisterPress}
              testID="nav-register-button"
            >
              <Text style={styles.smallButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 240,
  },
  userEmail: {
    fontSize: 13,
    color: '#555',
    marginRight: 10,
    maxWidth: 140,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  loginBtn: {
    backgroundColor: '#007AFF',
  },
  registerBtn: {
    backgroundColor: '#34C759',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

