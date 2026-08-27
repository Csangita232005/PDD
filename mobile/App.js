// App.js — Mobile Navigation Root with unified screen registry
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from './src/services/api';
import { COLORS } from './src/shared/theme';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonorDashboardScreen from './src/screens/DonorDashboardScreen';
import NGODashboardScreen from './src/screens/NGODashboardScreen';
import VolunteerDashboardScreen from './src/screens/VolunteerDashboardScreen';
import ReceiverDashboardScreen from './src/screens/ReceiverDashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import DonateFoodScreen from './src/screens/DonateFoodScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RoleSetupScreen from './src/screens/RoleSetupScreen';
import {
  RoleSelectionScreen,
  AdminLoginScreen,
  ForgotPasswordScreen,
  OTPVerificationScreen,
  ResetPasswordScreen,
  NotificationsScreen,
  LiveTrackingScreen,
  ImpactScreen,
  UserManagementScreen,
  AssignVolunteerScreen,
} from './src/screens/ExtraScreens';
import {
  LogoScreen,
  NameScreen,
  TaglineScreen,
  Onboarding1Screen,
  Onboarding2Screen,
  Onboarding3Screen,
  LanguageScreen,
} from './src/screens/IntroScreens';

import { LanguageProvider } from './src/context/LanguageContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionMode, setSessionMode] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('sharebite_token');
      const savedMode = (await AsyncStorage.getItem('sharebite_session_mode')) || 'user';
      setSessionMode(savedMode);
      if (savedToken) {
        setToken(savedToken);
        const res = await getMe(savedToken);
        if (res.success && res.user) {
          const userObj = { ...res.user };
          if (savedMode === 'admin') {
            userObj.role = 'ADMIN';
          }
          setUser(userObj);
        } else {
          handleLogout();
        }
      }
    } catch (e) {
      console.warn('Auth check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (userData, authToken, options = {}) => {
    const mode = options.sessionMode || (userData?.role === 'ADMIN' || userData?.isAdmin ? 'admin' : 'user');
    await AsyncStorage.setItem('sharebite_token', authToken);
    await AsyncStorage.setItem('sharebite_session_mode', mode);
    if (mode === 'admin') {
      await AsyncStorage.setItem('sharebite_role', 'ADMIN');
    }

    const updatedUser = { ...userData };
    if (mode === 'admin') {
      updatedUser.role = 'ADMIN';
    }

    setSessionMode(mode);
    setUser(updatedUser);
    setToken(authToken);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('sharebite_token');
    await AsyncStorage.removeItem('sharebite_session_mode');
    await AsyncStorage.removeItem('sharebite_role');
    await AsyncStorage.removeItem('sharebite_selected_role');
    setSessionMode('user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.primary, fontWeight: 'bold' }}>Loading ShareBite Mobile...</Text>
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!user) return 'Logo';
    if (sessionMode === 'admin' || user.role === 'ADMIN' || user.isAdmin) {
      return 'AdminDashboard';
    }
    return 'RoleSelection';
  };

  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={{ headerShown: false }}>
          {/* Intro & Auth Screens */}
          <Stack.Screen name="Logo" component={LogoScreen} />
          <Stack.Screen name="Name" component={NameScreen} />
          <Stack.Screen name="Tagline" component={TaglineScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
          <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
          <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
          <Stack.Screen name="AdminLogin">
            {(props) => <AdminLoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Role Selection & Setup */}
          <Stack.Screen name="RoleSelection">
            {(props) => <RoleSelectionScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="DonorSetup">
            {(props) => <RoleSetupScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="NGOSetup">
            {(props) => <RoleSetupScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="VolunteerSetup">
            {(props) => <RoleSetupScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="ReceiverSetup">
            {(props) => <RoleSetupScreen {...props} user={user} />}
          </Stack.Screen>

          {/* Dashboards */}
          <Stack.Screen name="AdminDashboard">
            {(props) => <AdminDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="DonorDashboard">
            {(props) => <DonorDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="NGODashboard">
            {(props) => <NGODashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="VolunteerDashboard">
            {(props) => <VolunteerDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="ReceiverDashboard">
            {(props) => <ReceiverDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>

          {/* Common Feature Screens */}
          <Stack.Screen name="Profile">
            {(props) => <ProfileScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="DonateFood">
            {(props) => <DonateFoodScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
          <Stack.Screen name="Impact" component={ImpactScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
          <Stack.Screen name="AssignVolunteer" component={AssignVolunteerScreen} />

          {/* Aliases & Fallbacks to prevent unhandled action crashes */}
          <Stack.Screen name="DonationMonitoring">
            {(props) => <AdminDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="Complaints">
            {(props) => <AdminDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="ActiveDonations">
            {(props) => <DonorDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="MyDonations">
            {(props) => <DonorDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="Home">
            {(props) => <DonorDashboardScreen {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="Donate">
            {(props) => <DonateFoodScreen {...props} user={user} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
