import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';
import { COLORS } from '../shared/theme';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const routeByRole = (user, token) => {
    onLoginSuccess(user, token);
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      setLoading(false);

      if (res.success && res.user) {
        await AsyncStorage.setItem('sharebite_token', res.token);
        onLoginSuccess(res.user, res.token);

        navigation.navigate('RoleSelection');
      } else {
        setErrorMsg(res.message || 'Login failed. Invalid credentials.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Failed to reach server.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>{t('appName')} 🍲</Text>
          <Text style={styles.brandSubtitle}>{t('appTagline')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('loginBtn')}</Text>
          <Text style={styles.cardSubtitle}>{t('welcomeBack')}</Text>

          {errorMsg !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.label}>{t('emailPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. donor@sharebite.org"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>{t('passwordPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnText}>{t('loginBtn')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.adminText}>🛡️ {t('adminLogin')}</Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.noAccountText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{t('registerLink')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#a5d6a7',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  adminBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#eceff1',
    borderRadius: 10,
  },
  adminText: {
    color: COLORS.admin.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
