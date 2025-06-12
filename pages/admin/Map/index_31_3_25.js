import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Button,
  Image,
} from 'react-native';
import MapView, { Polygon, Marker, Callout } from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
const GOOGLE_PLACES_API_KEY = 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8'; // never save your real api key in a snack!
var screenWidth = Dimensions.get('window').width;
import { calculatePolygonArea } from '../../Common/calculateAreaFun';
// const actions = [
//   { label: "Action 1", onPress: () => alert("Action 1"), style: { backgroundColor: "#FF5733" } },
//   { label: "Action 2", onPress: () => alert("Action 2"), style: { backgroundColor: "#33FF57" } },
//   { label: "Action 3", onPress: () => alert("Action 3"), style: { backgroundColor: "#3357FF" } },
// ];
import { calculateAreaFun } from '../../Common/calculateAreaFun';
import MultiActionButton from '../../Common/MultiActionButton';
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
  location
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [marker, setMarker] = useState({ lat: 37.78825, lng: -122.4324 });
  const [value, setValue] = useState(null);
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  // const [area, setArea] = useState(0);
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
      onPress: () => clearNewPolygon(),
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
      const fusedLocation = await getItem('fusedLocation');
      const { latitude, longitude } = fusedLocation;
      if (polygons.length == 0) {
        setCurrentLocation({
          ...currentLocation,
          latitude: latitude,
          longitude: longitude,
          // latitude: 24.18395258561253,
          // longitude: 87.76164192706347,
          latitudeDelta: 0.0022, // Default zoom level
          longitudeDelta: 0.0021, // Default zoom level
        });
      }
    };
    onPageLoad();
  }, []);
  useEffect(() => {
    if (polygons.length != 0) {
      setCurrentLocation({
        ...currentLocation,
        latitude: polygons[0][0]?.latitude,
        longitude: polygons[0][0]?.longitude,
        latitudeDelta: 0.0022, // Default zoom level
        longitudeDelta: 0.0021, // Default zoom level
      });
    }
    if (newPolygon.length == 0 && polygons.length != 0) {
      setSelectedArea(area);
    }
    // already added
  }, [polygons]);
  useEffect(() => {
    if (newPolygon.length > 2) {
      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setSelectedArea(Number(landUnitsquareMetre?.[0]?.defined_unit_value) * calculateAreaFun(newPolygon));
      } else {
        setSelectedArea(calculateAreaFun(newPolygon));
      }
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon]);
  const onchangeLocation = (data, details) => {
    const { lat, lng } = details?.geometry?.location;
    setCurrentLocation({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.0022, // Default zoom level
      longitudeDelta: 0.0021, // Default zoom level
    });
    setMarker({ lat: lat, lng: lng });
  };
  useEffect(() => {
    const cleanedCoordinates = location?.filter(coord =>
      coord.latitude !== undefined && coord.longitude !== undefined &&
      coord.latitude !== null && coord.longitude !== null &&
      coord.latitude !== "" && coord.longitude !== ""
    )?.map(coord => ({
      latitude: typeof coord.latitude === "string" ? parseFloat(coord.latitude) : coord.latitude,
      longitude: typeof coord.longitude === "string" ? parseFloat(coord.longitude) : coord.longitude
    }));
    setCoordinatesCurrent(cleanedCoordinates)
  }, [location])
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => setShowModal(false)}>
          <Image
            source={require('../../Common/images/cross100.png')}
            style={{ width: 35, height: 35, margin: 1 }}
          />
        </TouchableOpacity>
        <MapView
          // mapRef={mapRef}
          style={styles.map}
          mapType="hybrid"
          // initialRegion={currentLocation}
          region={currentLocation}
          title={'marker?.title'}
          description={'marker?.description'}
          onPress={handleMapPress}
          // showsMyLocationButton={true}
          showsPointsOfInterest={true}
          showsUserLocation={true}
          followsUserLocation={true}
          showsCompass={true}
          compassOffset={{ x: 20, y: 20 }}
          // zoomEnabled={true}
          minZoomLevel={15}
          scrollEnabled={true}
          showsScale={true}
          // zoomControlEnabled={true}
          zoomTapEnabled={true}
          rotateEnabled={false}
          userLocationUpdateInterval={5000}
          loadingEnabled={true}
          showsMyLocationButton>
          {polygons.map((polygon, index) => {
            //basudev
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
                  points="50,15 90,85 10,85"
                  fill="lime"
                  onFocus={() => console.log('Polygon focused')}
                />
              )
            }
          })}
          {/* basudev  */}
          {coordinatesCurrent?.length > 0 && <Polygon
            coordinates={coordinatesCurrent}
            fillColor="rgba(139, 236, 11, 0.73)"
            strokeColor="rgb(1, 255, 1)"
            strokeWidth={2}
            zIndex={0}
          />}

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
            <Marker
              key={index}
              coordinate={coordinate}
            // title="Location Name"
            />
          ))}
          <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
        </MapView>
        {selectedArea != 0 ? (
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              // left: 20,
              right: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: 15, color: '#FFF', backgroundColor: '#000' }}>Selected Area :{selectedArea} {landAreaUnit?.[0]?.defined_unit_value ? landAreaUnit?.[0]?.unit_name : "Square meter"}</Text>
          </View>
        ) : (
          <></>
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 15,
            left: 100,
            // right: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <MultiActionButton actions={actions} />
          {/* <Button
            title={editing ? 'Stop Editing' : 'Start Editing'}
            onPress={() => setEditing(!editing)}
          />
          {editing && (
            <>
              <Button title="Finalize Polygon" onPress={finalizePolygon} />
              <Button title="Clear" onPress={clearNewPolygon} />
              <Button title="Undo Mark" onPress={undoMark} />
            </>
          )} */}
        </View>
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
          onPress={onchangeLocation}
          onFail={error => console.error(error)}
          selectProps={{
            value,
            onChange: setValue,
          }}
          requestUrl={{
            url: 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
            useOnPlatform: 'web',
          }} // this in only required for use on the web. See https://git.io/JflFv more for details.
          // renderRightButton={() => (
          //     <TouchableOpacity onPress={resetLocation}>
          //         <Text>dsfdsf</Text>
          //     </TouchableOpacity>
          // )}
          // textInputProps={{
          //     clearButtonMode: false,
          // }}
          // styles={{
          //   textInput: {
          //     height: 44,
          //     width:100,
          //     color: 'black',
          //     fontSize: 16,
          //   },
          //   description: {
          //     color: 'black', // Set suggestion list text color to red
          //   },
          //   predefinedPlacesDescription: {
          //     color: 'black',
          //   },
          // }}
          styles={{
            container: {
              position: 'absolute',
              top: 12,
              width: '100%',
              // marginHorizontal: '2.5%',
              zIndex: 9999,
            },
            textInputContainer: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              width: '70%',
              marginHorizontal: '15%',
              opacity: 0.7
            },
            textInput: {
              backgroundColor: '#e6dfdf',
              height: 38,
              borderRadius: 5,
              color: '#000',
              fontSize: 16,
              width: '100%',
            },
            listView: {
              backgroundColor: '#e6dfdf',
              opacity: 0.7,
            },
            description: {
              color: 'black', // Set suggestion list text color to red
            },
            predefinedPlacesDescription: {
              color: 'black',
            },
          }}
          // styles={{
          //   textInputContainer: {
          //     width: '100%', // Ensures the container width is 100%
          //   },
          //   textInput: {
          //     height: 44,
          //     fontSize: 16,
          //     width: '80%', // Ensures the placeholder text occupies 100% width
          //     color:'#000'
          //   },
          // }}
          filterReverseGeocodingByTypes={[
            'locality',
            'administrative_area_level_3',
          ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          predefinedPlacesAlwaysVisible={true}
          debounce={200}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // container: {
  //     ...StyleSheet.absoluteFillObject,
  //     justifyContent: 'flex-end',
  //     alignItems: 'center',
  // },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  // map: {
  //     ...StyleSheet.absoluteFillObject,
  // },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  bubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
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
      // backgroundColor: '#FFF',
      top: 12,
      width: '70%',
      borderWidth: 0,
      marginHorizontal: '15%',
    },
    textInput: {
      // backgroundColor: 'transparent',
      backgroundColor: '#e6dfdf',
      // marginLeft: 0,
      // marginRight: 0,
      height: 38,
      borderRadius: 1,
      color: '#5d5d5d',
      fontSize: 16,
      opacity: 0.7,
      // borderWidth: 1,s
    },
    listView: {
      // backgroundColor: 'rgba(192,192,192,0.9)',
      top: 12,
      // backgroundColor: '#e6dfdf',
      opacity: 0.7,
      // width: '70%',
      // marginHorizontal: '15%'
    },
  },
});
