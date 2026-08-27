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
import { registerUser } from '../services/api';
import { COLORS } from '../shared/theme';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterScreen({ navigation, onLoginSuccess }) {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('DONOR');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      setErrorMsg(t('fillAllFields'));
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password,
        role: selectedRole,
      });
      setLoading(false);

      if (res.success) {
        alert('Account created successfully! Please log in with your email and password.');
        navigation.navigate('Login');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error during registration.');
    }
  };

  const roleOptions = [
    { id: 'DONOR', label: '🍱 Donor' },
    { id: 'NGO', label: '🏛️ NGO' },
    { id: 'VOLUNTEER', label: '🚴 Volunteer' },
    { id: 'RECEIVER', label: '🤲 Receiver' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>{t('appName')} 🍲</Text>
          <Text style={styles.brandSubtitle}>{t('appTagline')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('registerTitle')}</Text>

          {errorMsg !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.label}>Select Account Role *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {roleOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedRole(item.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: selectedRole === item.id ? COLORS.primary : '#ccc',
                  backgroundColor: selectedRole === item.id ? '#e8f5e9' : '#f9f9f9',
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: selectedRole === item.id ? COLORS.primary : '#333',
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('fullNamePlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>{t('emailPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>{t('mobilePlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="10 digit mobile number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <Text style={styles.label}>{t('passwordPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>{t('confirmPasswordPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnText}>{t('registerTitle')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.haveAccountText}>{t('haveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('loginLink')}</Text>
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
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  haveAccountText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
