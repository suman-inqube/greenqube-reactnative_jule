import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Button,
  Image,
  Alert,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  Callout,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
//  const GOOGLE_PLACES_API_KEY = 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8';
//  const GOOGLE_PLACES_API_KEY = 'AIzaSyCw8BW8Zb3DYtanHde65VY-lZfdrCIyFGw';
// const GOOGLE_PLACES_API_KEY = 'AIzaSyARWleRgAXyLffwWi6Au5Y28dMgifrGzx4';
// const GOOGLE_PLACES_API_KEY = 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8';AIzaSyDZUR2UHEteHVQgwiGA7XJNOV5lHe0r8m4;
//  AIzaSyDdJMFf2yZCrKx9Vc0tgToblNVZ36MX0Io; AIzaSyARWleRgAXyLffwWi6Au5Y28dMgifrGzx4;
const GOOGLE_PLACES_API_KEY = 'AIzaSyDZUR2UHEteHVQgwiGA7XJNOV5lHe0r8m4';
var screenWidth = Dimensions.get('window').width;
import MultiActionButton from '../../Common/MultiActionButton';
import { getDistance } from 'geolib';
import * as geolib from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import { v4 as uuid } from 'uuid';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import { getMapLocation, } from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
export default function Map({
  polygons,
  newPolygon,
  handleMapPress,
  setEditing,
  editing,
  finalizePolygon,
  clearNewPolygon,
  setShowModal,
  undoMark,
  landAreaUnit,
  landUnitsquareMetre,
  area,
  location,
  setOutofRange,
  statuslevel,
  type,
  baselatLong,
   handleRegionChangeComplete,
  isLoading
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [distanceThreshold, setDistanceThreshold] = useState(20);
  const [marker, setMarker] = useState({ lat:0, lng: 0 });
  const [value, setValue] = useState(null);
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  const mapRef = useRef(null);
  const [isStable, setIsStable] = useState(false);
  // const [location, setLocation] = useState(null);
  const actions = [
    {
      label: editing ? 'Stop Editing' : 'Start Editing',
      onPress: () => setEditing(!editing),
      style: { backgroundColor: '#000' },
    },
    editing && {
      label: 'Finalize Polygon',
      onPress: () => finalizePolygon(),
      style: { backgroundColor: '#000' },
    },
    editing && {
      label: 'Clear',
      onPress: () => clearMapGetDistance(),
      style: { backgroundColor: '#000' },
    },
    editing && {
      label: 'Undo Mark',
      onPress: () => undoMark(),
      style: { backgroundColor: '#000' },
    },
  ];


  useEffect(() => {
    const onPageLoad = async () => {
      try {
        if (location?.length && location[0].latitude && location[0].longitude) {
          animateToLocation(
            parseFloat(location[0].latitude),
            parseFloat(location[0].longitude),
          );
        } else {
          animateToLocation(baselatLong.latitude, baselatLong.longitude);
          if (polygons.length === 0) {
            setCurrentLocation({
              latitude: baselatLong.latitude,
              longitude: baselatLong.longitude,
              // latitudeDelta: 0.0022,
              // longitudeDelta: 0.0021,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      } catch (error) {
        console.log('Error fetching location:', error);
      }
    };
    onPageLoad();
  }, [baselatLong, location]);

  const animateToLocation = (latitude, longitude) => {
    if (
      mapRef.current &&
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          1000, // optional animation duration
        );
      }, 100); // Delay to ensure map is ready
    } else {
      console.warn('Invalid or missing coordinates for animateToLocation');
    }
  };

  useEffect(() => {
    if (polygons.length !== 0) {
      setCurrentLocation({
        latitude: polygons[0][0]?.latitude,
        longitude: polygons[0][0]?.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    if (newPolygon.length === 0 && polygons.length !== 0) {
      setSelectedArea(area);
    }
  }, [polygons]);

  useEffect(() => {
    if (newPolygon.length > 2) {
      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setSelectedArea(
          Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
          geolib.getAreaOfPolygon(newPolygon),
        );
      } else {
        setSelectedArea(geolib.getAreaOfPolygon(newPolygon));
      }
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon]);

  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference]);
  const editingLocation = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    if (fusedLocation != null) {
      setDrawingReference({
        latitude: latitude,
        longitude: longitude,
      });
    }
  };

  useEffect(() => {
    const cleanedCoordinates = location
      ?.filter(
        coord =>
          coord.latitude !== undefined &&
          coord.longitude !== undefined &&
          coord.latitude !== null &&
          coord.longitude !== null &&
          coord.latitude !== '' &&
          coord.longitude !== '',
      )
      ?.map(coord => ({
        latitude:
          typeof coord.latitude === 'string'
            ? parseFloat(coord.latitude)
            : coord.latitude,
        longitude:
          typeof coord.longitude === 'string'
            ? parseFloat(coord.longitude)
            : coord.longitude,
      }));
    setCoordinatesCurrent(cleanedCoordinates);
  }, [location]);

  const clearMapGetDistance = async event => {
    try {
      if (type == 'livehoood') {
        clearNewPolygon();
      } else {
        const dist = isWithin20Meters(drawingReference, location, 20);
        if (location.length == 1) {
          clearNewPolygon();
        } else {
          if (dist.length !== 0) {
            // Call function to draw a polygon here
            clearNewPolygon();
          } else {
            Alert.alert(
              '❌ Out of Range',
              'Plot location and current location not are same!.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
              { cancelable: false },
            );
          }
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };
  const handleMapPressGetDistance = async event => {
    try {
      if (type == 'livehoood') {
        handleMapPress(event);
      } else {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const pressedPoint = { latitude, longitude };
        let reference;
        if (editing) {
          reference = drawingReference || currentLocation;
        } else {
          reference = currentLocation;
        }
        if (!reference) {
          return;
        }
        if (newPolygon.length == 0) {
          const distance = getDistance({ latitude, longitude }, reference);
          if (distance <= distanceThreshold) {
            handleMapPress(event);
          } else {
            if (editing) {
              Alert.alert(
                '❌ Out of Range',
                `Plot location and current location not same!`,
              );
            }
          }
        } else {
          const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
          if (dist !== 0) {
            // Call function to draw a polygon here
            handleMapPress(event);
          } else {
            console.log('❌ Point is more than 10m away.');
          }
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };
  const fetchSearchSuggestions = async query => {
    const suggestiveRes = await getMapLocation(query);
    return suggestiveRes?.data?.features || []; // Adjust based on your response shape
  };
  const handleSelect = item => {
    setMarker({ lat: item?.properties?.coordinates?.latitude, lng: item?.properties?.coordinates?.longitude })
    animateToLocation(
      item?.properties?.coordinates?.latitude,
      item?.properties?.coordinates?.longitude,
      
    );
  };
  return (
    <>
      <View style={styles.container}>
          {isLoading && (
          <View style={styles.loaderOverlay}>
            <LoadingScreen />
          </View>
        )}
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => setShowModal(false)}>
          <Image
            source={require('../../Common/images/cross100.png')}
            style={{width: 35, height: 35, margin: 1}}
          />
        </TouchableOpacity>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="hybrid"
          provider={PROVIDER_GOOGLE}
           onRegionChangeComplete={handleRegionChangeComplete}
          // region={currentLocation}
          // initialRegion={{
          //   latitude: currentLocation?.latitude || 22.2906, // Default if no location
          //   longitude: currentLocation?.longitude || 87.8491,
          //   latitudeDelta: 0.05,
          //   longitudeDelta: 0.05,
          // }}
          onPress={handleMapPressGetDistance}
          showsUserLocation={true}
          followsUserLocation={true}
          showsCompass={true}
          compassOffset={{x: 20, y: 20}}
          minZoomLevel={15}
          scrollEnabled={true}
          showsScale={true}
          zoomTapEnabled={true}
          rotateEnabled={false}
          userLocationUpdateInterval={5000}
          loadingEnabled={true}
          // isLoading={isLoading}
          showsMyLocationButton
          zoomEnabled
          zoomControlEnabled={true} // ✅ Enable zoom buttons (Android)
          pitchEnabled={true} // ✅ Allow 3D tilting
        >
          {polygons.map((polygon, index) => {
            if (polygon.length >= 3) {
              return (
                <Polygon
                  key={index}
                  coordinates={polygon}
                  fillColor="rgba(167, 3, 3, 0.66)"
                  strokeColor="rgb(240, 9, 9)"
                  strokeWidth={2}
                  name="MyPolygon"
                  focusable={true}
                  onFocus={() => console.log('Polygon focused')}
                />
              );
            }
          })}
          {coordinatesCurrent?.length > 0 && (
            <Polygon
              coordinates={coordinatesCurrent}
              fillColor="rgba(139, 236, 11, 0.73)"
              strokeColor="rgb(1, 255, 1)"
              strokeWidth={2}
              zIndex={999}
            />
          )}
          {newPolygon.length > 0 && (
            <Polygon
              coordinates={newPolygon}
              fillColor="rgba(0, 200, 200, 0.5)"
              strokeColor="rgb(0, 200, 200)"
              strokeWidth={2}
              zIndex={0}
            />
          )}
          {newPolygon.map((coordinate, index) => (
            <Marker key={index} coordinate={coordinate} />
          ))}
          <Marker coordinate={{latitude: marker.lat, longitude: marker.lng}} />
        </MapView>

        {selectedArea !== 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              right: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{fontSize: 15, color: '#FFF', backgroundColor: '#000'}}>
              Selected Area: {selectedArea}{' '}
              {landAreaUnit?.[0]?.defined_unit_value
                ? landAreaUnit?.[0]?.unit_name
                : 'Square meter'}
            </Text>
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            bottom: 15,
            left: 100,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <MultiActionButton actions={actions} statuslevel={statuslevel} />
        </View>
        <View
          style={{
            width: '70%',
            position: 'absolute',
            top: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <SuggestiveSearchInput
            // placeholder="Type to search..."
            fetchSuggestions={fetchSearchSuggestions}
            onSelect={handleSelect}
          />
        </View>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
  },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: 10,
    zIndex: 999,
    width: 38,
    height: 38,
    backgroundColor: '#e6dfdf',
    opacity: 0.7,
  },
  searchbar: {
    description: {
      fontWeight: 'bold',
    },
    predefinedPlacesDescription: {
      color: '#1faadb',
    },
    textInputContainer: {
      top: 12,
      width: '70%',
      borderWidth: 0,
      marginHorizontal: '15%',
    },
    textInput: {
      backgroundColor: '#e6dfdf',
      height: 38,
      borderRadius: 1,
      color: '#5d5d5d',
      fontSize: 16,
      opacity: 0.7,
    },
    listView: {
      top: 12,
      opacity: 0.7,
    },
      loaderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
  },
});