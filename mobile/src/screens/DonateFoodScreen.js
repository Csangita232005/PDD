import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { createDonation } from '../services/api';
import { COLORS } from '../shared/theme';

export default function DonateFoodScreen({ navigation, user }) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Packs');
  const [address, setAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('VOLUNTEER');
  const [loading, setLoading] = useState(false);

  const handlePostDonation = async () => {
    if (!foodName || !quantity || !address) {
      Alert.alert('Validation Error', 'Please enter Food Name, Quantity, and Pickup Address.');
      return;
    }

    setLoading(true);
    try {
      const res = await createDonation({
        foodName,
        quantity,
        unit,
        address,
        deliveryMode,
        donorId: user?.id || '1',
        donorName: user?.name || 'Donor',
      });
      setLoading(false);

      if (res.success) {
        Alert.alert('Donation Posted! 🎉', 'Your food donation is now active.');
        navigation.navigate('DonorDashboard');
      } else {
        Alert.alert('Error', res.message || 'Failed to post donation.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit donation.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.donor.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donate Surplus Food</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Food Name / Item Details *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Veg Biryani Packs, 50 Chapatis"
            value={foodName}
            onChangeText={setFoodName}
          />

          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 20"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitRow}>
            {['Packs', 'Kg', 'Meals'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pickup Address / Landmark *</Text>
          <TextInput
            style={[styles.input, { height: 75 }]}
            placeholder="Enter full address where food can be picked up"
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Delivery Mode</Text>
          <View style={styles.modeColumn}>
            {[
              { id: 'VOLUNTEER', title: '🚚 Volunteer Pickup', desc: 'A volunteer will collect and deliver' },
              { id: 'SELF', title: '🚗 Self Delivery', desc: 'I will personally deliver to NGO' },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, deliveryMode === mode.id && styles.modeCardActive]}
                onPress={() => setDeliveryMode(mode.id)}
              >
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePostDonation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnText}>Post Food Donation</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: COLORS.donor.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 18,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: COLORS.donor.primary,
    borderColor: COLORS.donor.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  unitTextActive: {
    color: '#ffffff',
  },
  modeColumn: {
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  modeCardActive: {
    borderColor: COLORS.donor.primary,
    backgroundColor: COLORS.donor.bgLight,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: COLORS.donor.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
