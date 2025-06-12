import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, Button, Image } from 'react-native';
import MapView, { Polygon, Marker, Callout } from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
const GOOGLE_PLACES_API_KEY = 'AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8'; // never save your real api key in a snack!
var screenWidth = Dimensions.get('window').width;
export default function Map({ polygons, newPolygon, handleMapPress, setEditing, editing, finalizePolygon, clearNewPolygon, setShowModal }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [marker, setMarker] = useState({ lat: 37.78825, lng: -122.4324 });
    const [value, setValue] = useState(null);
    useEffect(() => {
        const onPageLoad = async () => {
            const fusedLocation = await getItem('fusedLocation');
            const { latitude, longitude } = fusedLocation;
            if (polygons.length == 0) {
                setCurrentLocation({
                    ...currentLocation,
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0022,// Default zoom level
                    longitudeDelta: 0.0021,// Default zoom level
                });
            }
        }
        onPageLoad();
    }, []);
    const mapRef = useRef(null);
    useEffect(() => {
        if (polygons.length != 0) {
            setCurrentLocation({
                ...currentLocation,
                latitude: polygons[0][0]?.latitude,
                longitude: polygons[0][0]?.longitude,
                latitudeDelta: 0.0022,// Default zoom level
                longitudeDelta: 0.0021,// Default zoom level
            });
        }
    }, [polygons]);
    const onchangeLocation = (data, details) => {
        console.log(data)
        const { lat, lng } = details?.geometry?.location
        setCurrentLocation({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0022,// Default zoom level
            longitudeDelta: 0.0021,// Default zoom level
        });
        setMarker({ lat: lat, lng: lng });
    }
    const resetLocation = () => {
        setValue(null)
    }
    const onMarkerSelected = (mark) => {
        console.log(mark)

    }
    const calloutPressed = (ev) => {
        console.log(ev);
    };

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity style={styles.searchIcon} onPress={() => setShowModal(false)}>
                    <Image source={require('../../Common/images/cross100.png')} style={{ width: 35, height: 35, margin: 1 }} />
                </TouchableOpacity>
                <MapView
                    // mapRef={mapRef}
                    style={styles.map}
                    mapType="hybrid"
                    // initialRegion={currentLocation}
                    region={currentLocation}
                    title={'marker?.title'}
                    description={'marker?.description'}
                    onPress={(event) => console.log(JSON.stringify(event))}
                    showsMyLocationButton={true}
                    showsPointsOfInterest={true}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    showsCompass={true}
                    compassOffset={{ x: 20, y: 20 }}

                    // zoomEnabled={true}
                    minZoomLevel={10}
                    scrollEnabled={true}
                    showsScale={true}
                    // zoomControlEnabled={true}
                    // zoomTapEnabled={true}
                    rotateEnabled={false}
                    userLocationUpdateInterval={5000}
                    loadingEnabled={true}
                >
                    {polygons.map((polygon, index) => (
                        <Polygon key={index}
                            coordinates={polygon}
                            fillColor="rgba(0, 200, 0, 0.5)"
                            strokeColor="#FFA500"
                            strokeWidth={2}
                            name="MyPolygon"
                            focusable={true}
                            points="50,15 90,85 10,85"
                            fill="lime"
                            onFocus={() => console.log('Polygon focused')} />
                    ))}
                    {newPolygon.length > 0 && <Polygon coordinates={newPolygon}
                        fillColor="rgba(0, 200, 200, 0.5)" strokeColor="#FFA500"
                        strokeWidth={2} zIndex={0} />}
                    {newPolygon.map((coordinate, index) => (
                        <Marker key={index} coordinate={coordinate}
                        // title="Location Name"
                        // onPress={() => onMarkerSelected(coordinate)}
                        />
                    ))}
                    {/* <Callout onPress={calloutPressed}>
                                <View>
                                    <Text>{coordinate.name}</Text>
                                </View>
                            </Callout> */}
                    {/* </Marker> */}
                    <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
                </MapView>
                <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button title={editing ? "Stop Editing" : "Start Editing"} onPress={() => setEditing(!editing)} />
                    {editing && (
                        <>
                            <Button title="Finalize Polygon" onPress={finalizePolygon} />
                            <Button title="Clear" onPress={clearNewPolygon} />
                        </>
                    )}
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
                    onFail={(error) => console.error(error)}
                    selectProps={{
                        value,
                        onChange: setValue,
                    }}

                    requestUrl={{
                        url:
                            'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
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
                    filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
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
            marginHorizontal: '15%'
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
            opacity: 0.7
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
