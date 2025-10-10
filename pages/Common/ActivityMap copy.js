import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet, View, Modal, Dimensions, Animated, TouchableOpacity, Text
} from 'react-native';
import MapView, {Polygon, Marker, Callout} from 'react-native-maps';
import { isPointInPolygon } from 'geolib';
const { width, height } = Dimensions.get('window');
const ActivityMap = ({
  modalVisibleMap,
  setModalVisibleMap,
  plotPolygon,
  TakePhoto,
  location,
  outofRange,
  setOutOfRange,
  pipeLatLong,
}) => {
  const mapRef = useRef(null);
  const animatedHeading = useRef(new Animated.Value(0)).current;
  const [currentHeading, setCurrentHeading] = useState(0);
  useEffect(() => {
    const listener = animatedHeading.addListener(({value}) => {
      if (mapRef.current && location) {
        mapRef.current.setCamera(
          {
            heading: value,
            center: location,
            zoom: 18,
            pitch: 45,
          },
          {duration: 300},
        );
      }
    });
    return () => animatedHeading.removeListener(listener);
  }, [animatedHeading, location]);
  useEffect(() => {
    if (location && plotPolygon?.length) {
      const inside = isPointInPolygon(location, plotPolygon);
      console.log('inside22', inside);
      setOutOfRange(inside); // true = outside
    }
  }, [location, plotPolygon]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisibleMap}
      onRequestClose={() => {
        // stopCompass();
        setModalVisibleMap(false);
      }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MapView
            ref={mapRef}
            style={[styles.map, {width, height}]}
            mapType="hybrid"
            showsUserLocation
            followsUserLocation
            showsCompass
            minZoomLevel={15}
            initialCamera={{
              center: location,
              zoom: 18,
              pitch: 45,
              heading: currentHeading,
            }}>
            {plotPolygon?.length > 0 && (
              <Polygon
                coordinates={plotPolygon}
                fillColor="rgba(139, 236, 11, 0.73)"
                strokeColor="rgb(1, 255, 1)"
                strokeWidth={2}
              />
            )}
            {pipeLatLong?.flat().map((polygon, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: polygon?.latitude,
                  longitude: polygon?.longitude,
                }}>
                {/* Option 1: Use Callout */}
                <Callout>
                  <Text>{polygon?.name}</Text>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
 <TouchableOpacity
            style={styles.captureButton}
            onPress={() => TakePhoto()}>
            <Text style={styles.captureIcon}>📷</Text>
          </TouchableOpacity>
        {/*outofRange && (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => TakePhoto()}>
            <Text style={styles.captureIcon}>📷</Text>
          </TouchableOpacity>
        )*/}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  captureButton: {
    backgroundColor: '#FFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: '40%',
    borderWidth: 3,
    borderColor: 'green',
  },
  captureIcon: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 5,
  },
});

export default memo(ActivityMap);
