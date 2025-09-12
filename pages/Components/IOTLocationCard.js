import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';

const IOTLocationCard = ({
  latitude,
  longitude,
  onCapturePress,
  disabled = false,
  t,
}) => {
  const hasLocation = latitude && longitude;

  return (
    <View style={styles.locationContainer}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationTitle}>{t('Geo tag IOT Device')}</Text>

        <TouchableOpacity
          onPress={!disabled ? onCapturePress : null}
          style={[
            styles.locationStatus,
            hasLocation ? styles.active : styles.inactive,
          ]}
          disabled={disabled}>
          <MaterialIcons
            name={hasLocation ? 'check-circle' : 'location-on'}
            size={20}
            color={hasLocation ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.locationStatusText}>
            {hasLocation ? t('captured') : t('tap_to_tag')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinateItem}>
          <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
          <Text style={styles.coordinateText}>
            {t('lat')}: {latitude || '0.0'}
          </Text>
        </View>
        <View style={styles.coordinateItem}>
          <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
          <Text style={styles.coordinateText}>
            {t('long')}: {longitude || '0.0'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  locationContainer: {
    backgroundColor: '#f6f7ffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginTop: 10,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: Fonts.Medium,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  active: {
    backgroundColor: '#E8F5E9',
  },
  inactive: {
    backgroundColor: '#FFEBEE',
  },
  locationStatusText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: 'black',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 5,
    width: '48%',
  },
  coordinateText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#0D47A1',
    fontFamily: Fonts.Regular,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
};

export default IOTLocationCard;
