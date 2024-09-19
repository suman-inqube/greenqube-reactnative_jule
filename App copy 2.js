import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const App = () => {
  const [region, setRegion] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [polygon, setPolygon] = useState([
    { latitude: LATITUDE, longitude: LONGITUDE },
    { latitude: LATITUDE + 0.01, longitude: LONGITUDE },
    { latitude: LATITUDE + 0.01, longitude: LONGITUDE + 0.01 },
  ]);

  const handleDragEnd = (coordinate, index) => {
    const newPolygon = polygon.map((point, i) => (i === index ? coordinate : point));
    setPolygon(newPolygon);
  };

  const handleSearch = (data, details = null) => {
    const { lat, lng } = details.geometry.location;
    setRegion({
      ...region,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
        placeholder='Where To ?'
        minLength={4}
        autoFocus={true}
        listViewDisplayed="auto"
        returnKeyType={'search'}
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log(details.geometry.location, data)
        }}
        query={{
          key: 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8',
          language: 'en',
        }}
        nearbyPlacesAPI='GooglePlacesSearch'
        debounce={200}
        styles={[styles, { flex: 0.1 }]}>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Polygon
              coordinates={polygon}
              fillColor="rgba(0, 200, 0, 0.5)"
              strokeColor="rgba(0,0,0,0.5)"
            />
            {polygon.map((point, index) => (
              <Marker
                key={index}
                coordinate={point}
                draggable
                onDragEnd={(e) => handleDragEnd(e.nativeEvent.coordinate, index)}
              />
            ))}
          </MapView>
        </View>
      </GooglePlacesAutocomplete>
    </View>
  );
};
const styles = StyleSheet.create({
  textInputContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    zIndex: 999,
    width: '90%',
    position: 'absolute', width: '100%',
    zIndex: 999,
  },
  // textInputContainer: {
  //   position: 'absolute', width: '100%',
  //   zIndex: 999,
  // },
  textInput: {
    marginLeft: 0,
    marginRight: 0,
    height: 45,
    color: '#5d5d5d',
    fontSize: 16,
    borderWidth: 1,
    zIndex: 999,
  },
  predefinedPlacesDescription: {
    color: '#1faadb'
  },
  listView: {
    top: 45.5,
    zIndex: 10,
    position: 'absolute',
    color: 'black',
    backgroundColor: "white",
    width: '89%',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'blue',
  },
  description: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 14,
    maxWidth: '89%',
  },
});
export default App;
