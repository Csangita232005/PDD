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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createDonation } from '../services/api';

export default function DonateScreen({ navigation }) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodName || !quantity || !address) {
      Alert.alert('Validation Error', 'Please fill in all donation fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await createDonation({
        foodName,
        quantity: Number(quantity),
        unit: 'Packs',
        address,
        category: 'Cooked Meals',
        deliveryMode: 'VOLUNTEER_NGO_PICKUP',
      });

      setLoading(false);
      if (res.success) {
        Alert.alert('Success 🎉', 'Food donation posted to MongoDB backend!', [
          {
            text: 'OK',
            onPress: () => {
              setFoodName('');
              setAddress('');
              navigation.navigate('Home');
            },
          },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to post donation.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Connection to server failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Donate Surplus Food 🍲</Text>
        <Text style={styles.headerSub}>Help feed communities & minimize food waste</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Food Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Veg Biryani & Curry"
            value={foodName}
            onChangeText={setFoodName}
          />

          <Text style={styles.inputLabel}>Quantity (Packs)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.inputLabel}>Pickup Address</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Enter complete pickup address"
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Submit Food Donation</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: '#a5d6a7',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
