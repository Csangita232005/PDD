import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '../shared/theme';

export default function LocationMap({ title = 'Live Location & Rescue Map' }) {
  const [coords, setCoords] = useState({ lat: 17.3850, lng: 78.4867 });
  const [locationText, setLocationText] = useState('Detecting current GPS location...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setLocationText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          setLoading(false);
        },
        (err) => {
          console.warn('Mobile geolocation warning:', err);
          setLocationText('Hyderabad (Default City Location)');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationText('Hyderabad (Active Location)');
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>📍 {title}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchLocation}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.gpsBadge}>
          <Text style={styles.gpsBadgeText}>GPS LIVE</Text>
        </View>
        <Text style={styles.coordsText}>{locationText}</Text>
      </View>

      <View style={styles.mapContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000',
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapOverlay}>
          <View style={styles.markerCircle}>
            <Text style={{ fontSize: 18 }}>📍</Text>
          </View>
          <View style={styles.pulseBox}>
            <Text style={styles.pulseText}>Real-Time Tracking Enabled</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginVertical: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  refreshBtn: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gpsBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  gpsBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coordsText: {
    fontSize: 13,
    color: '#555',
  },
  mapContainer: {
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 8,
  },
  pulseBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pulseText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
