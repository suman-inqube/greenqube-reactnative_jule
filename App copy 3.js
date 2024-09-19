import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
const GOOGLE_PLACES_API_KEY = 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8'; // never save your real api key in a snack!
var screenWidth = Dimensions.get('window').width;


const App = () => {
  const [regionCoords, setRegion] = useState({ lat: 37.78825, lng: -122.4324 });
  const [marker, setMarker] = useState({ lat: 37.78825, lng: -122.4324 });

  const onPress = (data, details) => {
    setRegion(details.geometry.location);
    setMarker(details.geometry.location);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: regionCoords.lat,
          longitude: regionCoords.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
      </MapView>

      <GooglePlacesAutocomplete
        styles={styles.searchbar}
        placeholder="Search"
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en', // language of the results
        }}
        GooglePlacesDetailsQuery={{
          fields: 'geometry',
        }}
        fetchDetails={true}
        onPress={onPress}
        onFail={(error) => console.error(error)}
        requestUrl={{
          url:
            'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
          useOnPlatform: 'web',
        }} // this in only required for use on the web. See https://git.io/JflFv more for details.
      />
    </View>
  );
};

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
  searchbar: {
    description: {
      fontWeight: 'bold',
    },
    predefinedPlacesDescription: {
      color: '#1faadb',
    },
    textInputContainer: {
      backgroundColor: 'rgba(0,0,0,0)',
      top: 50,
      width: screenWidth - 10,
      borderWidth: 0,
    },
    textInput: {
      marginLeft: 0,
      marginRight: 0,
      height: 38,
      color: '#5d5d5d',
      fontSize: 16,
      borderWidth: 0,
    },
    listView: {
      backgroundColor: 'rgba(192,192,192,0.9)',
      top: 23,
    },
  },
});

export default App;

