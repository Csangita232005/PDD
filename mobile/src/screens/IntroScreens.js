import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

// 1. LogoScreen
export function LogoScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Name');
    }, 800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ flex: 1 }}
      onPress={() => navigation.navigate('Name')}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600' }}
        style={styles.fullScreenBg}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" transparent />
        <View style={[styles.darkOverlay, { backgroundColor: 'rgba(10, 30, 14, 0.65)' }]}>
          <View style={styles.centerContent}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// 2. NameScreen
export function NameScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Tagline');
    }, 800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ flex: 1 }}
      onPress={() => navigation.navigate('Tagline')}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200' }}
        style={styles.fullScreenBg}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" transparent />
        <View style={[styles.darkOverlay, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
          <View style={styles.centerContent}>
            <Text style={styles.brandTitle}>ShareBite</Text>
            <Text style={styles.brandSubtitle}>Connecting Food with Humanity</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// 3. TaglineScreen (Navigates directly to Language Selection)
export function TaglineScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Language');
    }, 800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ flex: 1 }}
      onPress={() => navigation.navigate('Language')}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c' }}
        style={styles.fullScreenBg}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" transparent />
        <View style={[styles.darkOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={styles.centerContent}>
            <Text style={styles.taglineText}>
              Share Food ❤️{'\n'}Spread Smiles 😊
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// 4. Onboarding1Screen
export function Onboarding1Screen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f1f8e9' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f8e9" />
      <View style={styles.onboardingContent}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2153/2153788.png' }}
          style={styles.onboardingImage}
          resizeMode="contain"
        />

        <Text style={[styles.obTitle, { color: '#e65100' }]}>{t('donateFood')}</Text>
        <Text style={[styles.obText, { color: '#6d4c41' }]}>
          {t('donateFoodDesc')}
        </Text>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot, { backgroundColor: '#fb8c00' }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.skipBtn, { backgroundColor: '#a1887f' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>{t('skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.nextBtn, { backgroundColor: '#fb8c00' }]}
            onPress={() => navigation.navigate('Onboarding2')}
          >
            <Text style={styles.btnText}>{t('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 5. Onboarding2Screen
export function Onboarding2Screen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e8f5e9' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#e8f5e9" />
      <View style={styles.onboardingContent}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' }}
          style={styles.onboardingImage}
          resizeMode="contain"
        />

        <Text style={[styles.obTitle, { color: '#1b5e20' }]}>{t('liveTracking')}</Text>
        <Text style={[styles.obText, { color: '#2e7d32' }]}>
          {t('liveTrackingDesc')}
        </Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: '#4CAF50' }]} />
          <View style={styles.dot} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.skipBtn, { backgroundColor: '#9e9e9e' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>{t('skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.nextBtn, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('Onboarding3')}
          >
            <Text style={styles.btnText}>{t('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 6. Onboarding3Screen
export function Onboarding3Screen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e3f2fd' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#e3f2fd" />
      <View style={styles.onboardingContent}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3176/3176363.png' }}
          style={styles.onboardingImage}
          resizeMode="contain"
        />

        <Text style={[styles.obTitle, { color: '#0d47a1' }]}>{t('feedLives')}</Text>
        <Text style={[styles.obText, { color: '#1565c0' }]}>
          {t('feedLivesDesc')}
        </Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: '#1976d2' }]} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.skipBtn, { backgroundColor: '#9e9e9e' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>{t('skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.nextBtn, { backgroundColor: '#1976d2' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>{t('getStarted')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 7. LanguageScreen
export function LanguageScreen({ navigation }) {
  const { language, changeLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(language || 'en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ];

  const handleContinue = () => {
    changeLanguage(selectedLang);
    navigation.navigate('Onboarding1');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200' }}
      style={styles.fullScreenBg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" transparent />
      <View style={[styles.darkOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
        <View style={styles.langBox}>
          <Text style={{ fontSize: 50, textAlign: 'center', marginBottom: 10 }}>🌍</Text>
          <Text style={styles.langTitle}>{t('selectLanguage')}</Text>
          <Text style={styles.langSubtitle}>{t('selectLanguageSub')}</Text>

          <ScrollView style={{ maxHeight: 220, marginVertical: 15 }}>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langOption,
                  selectedLang === item.code && styles.langOptionSelected,
                ]}
                onPress={() => setSelectedLang(item.code)}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    selectedLang === item.code && styles.langOptionTextSelected,
                  ]}
                >
                  {item.native} ({item.name})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>{t('continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreenBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  glassLogoCard: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: 'rgba(10, 30, 14, 0.75)',
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },

  outerGlowRing: {
    padding: 6,
    borderRadius: 85,
    backgroundColor: 'rgba(46, 125, 50, 0.4)',
    borderWidth: 2,
    borderColor: '#66bb6a',
    marginBottom: 20,
    shadowColor: '#66bb6a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },

  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },

  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  logoCardTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 6,
    textAlign: 'center',
  },

  logoCardSubtitle: {
    fontSize: 14,
    color: '#a5d6a7',
    textAlign: 'center',
    marginBottom: 25,
  },

  loadingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  activeMiniDot: {
    width: 20,
    backgroundColor: '#66bb6a',
  },

  emojiCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },

  brandTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
  },

  brandSubtitle: {
    fontSize: 18,
    color: '#f5f5f5',
    marginTop: 10,
    textAlign: 'center',
  },

  taglineText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 58,
  },

  container: {
    flex: 1,
  },

  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  onboardingImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },

  obTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  obText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d7ccc8',
    marginHorizontal: 5,
  },

  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },

  btn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 2,
  },

  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  skipBtn: {},

  nextBtn: {},

  langBox: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  langTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 6,
  },

  langSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },

  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },

  langOptionSelected: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },

  langOptionText: {
    fontSize: 16,
    color: '#333333',
  },

  langOptionTextSelected: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },

  continueBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
