import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ListScreen } from '../screens/ListScreen';
import { DetailScreen } from '../screens/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // While checking auth state, display a loading screen to prevent any flash of content
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // Protected Screens (Logged In)
          <>
            <Stack.Screen name="List" component={ListScreen} />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={{
                headerShown: true,
                title: 'Book Details',
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          // Public Screens (Logged Out)
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: true,
                title: 'Sign In',
                headerBackTitle: 'Home',
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: true,
                title: 'Register',
                headerBackTitle: 'Home',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

