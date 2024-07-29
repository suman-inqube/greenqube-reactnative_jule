import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, Button, Image } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
export default function Map({ polygons, newPolygon, handleMapPress, setEditing, editing, finalizePolygon, clearNewPolygon, setShowModal }) {
    const [currentLocation, setCurrentLocation] = useState(null);
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
        if (mapRef.current) {
            mapRef.current.fitToCoordinates(polygons[0], {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
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
    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.searchIcon} onPress={() => setShowModal(false)}>
                <Image source={require('../../Common/images/cross100.png')} style={{ width: 35, height: 35 }} />
            </TouchableOpacity>
            <MapView
                style={{ flex: 1 }}
                // ref={mapRef}
                // style={styles.map}

                // mapType="satellite"
                mapType="hybrid"
                // initialRegion={{
                //     latitude: 37.78825,
                //     longitude: -122.4324,
                //     latitudeDelta: 5,
                //     longitudeDelta: 5,
                // }}
                initialRegion={currentLocation}
                // initialRegion={{ latitude: 22.582164093281484, longitude: 88.4121436625719, latitudeDelta: 0, longitudeDelta: 0, }}
                // coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                title={'marker?.title'}
                description={'marker?.description'}
                onPress={handleMapPress}
                showsMyLocationButton={true}
                showsPointsOfInterest={true}
                showsUserLocation={true}
                followsUserLocation={true}
                showsCompass={true}
                compassOffset={{ x: 20, y: 20 }}
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
                        onFocus={() => console.log('Polygon focused')}
                    />
                ))}
                {newPolygon.length > 0 && <Polygon coordinates={newPolygon} fillColor="rgba(0, 200, 200, 0.5)" strokeColor="#FFA500" strokeWidth={2} zIndex={0} />}
                {newPolygon.map((coordinate, index) => (
                    <Marker key={index} coordinate={coordinate}
                    // title="Location Name"
                    />
                ))}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
        top: 15,
        left: 10,
        zIndex: 999,
        width: 35,
        height: 35,
        backgroundColor: '#e6dfdf',
        opacity: 0.7
    }
});
