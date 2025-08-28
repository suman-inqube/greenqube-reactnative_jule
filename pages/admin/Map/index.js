import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { getItem } from "../../../config/getDataFromStorage";
import Geolocation from "@react-native-community/geolocation";
import { getDistance } from "geolib";
import * as geolib from "geolib";
import { isWithin20Meters } from "../../Common/calculateAreaFun";
import SuggestiveSearchInput from "../../Common/SuggestiveSearchInput";
import { getMapLocation } from "../../../config/apiHere";
import LoadingScreen from "../../Common/LoadingScreen";
import { FloatingAction } from "react-native-floating-action";
import { Colors } from "../../utils/Constants";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const screenWidth = Dimensions.get("window").width;

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
  statuslevel,
  type,
  baselatLong,
  handleRegionChangeComplete,
  isLoading,
  coords
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });

  const distanceThreshold = 20;
  const mapRef = useRef(null);

  /** Animate to location */
  const animateToLocation = useCallback((latitude, longitude) => {
    if (!mapRef.current || isNaN(latitude) || isNaN(longitude)) {
      console.warn("Invalid coordinates for animateToLocation");
      return;
    }
    setTimeout(() => {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000
      );
    }, 100);
  }, []);

  /** Floating actions */
  const actions = useMemo(
    () =>
      [
        {
          text: editing ? "Stop Editing" : "Start Editing",
          icon: require("../../Common/images/editing.png"),
          name: "toggleEdit",
          position: 1,
          color: Colors.useGreen,
        },
        editing && {
          text: "Finalize Polygon",
          icon: require("../../Common/images/check.png"),
          name: "finalizePolygon",
          position: 2,
          color: Colors.useGreen,
        },
        editing && {
          text: "Clear",
          icon: require("../../Common/images/bin.png"),
          name: "clear",
          position: 3,
          color: Colors.useGreen,
        },
        editing && {
          text: "Undo Mark",
          icon: require("../../Common/images/undo.png"),
          name: "undoMark",
          position: 4,
          color: Colors.useGreen,
        },
      ].filter(Boolean),
    [editing]
  );

  /** Init load */
  useEffect(() => {
    const init = async () => {
      try {
        if (location?.[0]?.latitude && location?.[0]?.longitude) {
          animateToLocation(+location[0].latitude, +location[0].longitude);
        } else {
          animateToLocation(baselatLong.latitude, baselatLong.longitude);
          if (polygons.length === 0) {
            setCurrentLocation({
              latitude: baselatLong.latitude,
              longitude: baselatLong.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      } catch (err) {
        console.log("Init error:", err);
      }
    };
    init();
  }, [baselatLong, location, polygons.length, animateToLocation]);

  /** Polygon area calculation */
  useEffect(() => {
    if (newPolygon.length > 2) {
      const base = landUnitsquareMetre?.[0]?.defined_unit_value || 1;
      setSelectedArea(base * geolib.getAreaOfPolygon(newPolygon));
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon, landUnitsquareMetre]);

  /** Keep track of coordinates for filled polygon */
  useEffect(() => {
    const cleaned = location
      ?.filter(
        (c) =>
          c?.latitude != null &&
          c?.longitude != null &&
          c.latitude !== "" &&
          c.longitude !== ""
      )
      ?.map((c) => ({
        latitude: typeof c.latitude === "string" ? +c.latitude : c.latitude,
        longitude: typeof c.longitude === "string" ? +c.longitude : c.longitude,
      }));
    setCoordinatesCurrent(cleaned);
  }, [location]);

  /** Setup drawing reference if editing */
  useEffect(() => {
    if (editing && !drawingReference) {
      (async () => {
        const { latitude, longitude } = coords || {};
        if (coords != null) {
          setDrawingReference({
            latitude,
            longitude,
          });
        }
      })();
    }
  }, [editing, drawingReference]);

  /** Clear polygon with distance check */
  const clearMapGetDistance = useCallback(() => {
    try {
      if (type === "livehoood") return clearNewPolygon();
      const dist = isWithin20Meters(drawingReference, location, 20);
      if (location.length <= 1 || dist.length !== 0) {
        clearNewPolygon();
      } else {
        Alert.alert("❌ Out of Range", "Plot location and current location not same!");
      }
    } catch (err) {
      console.log("Clear error:", err);
    }
  }, [drawingReference, location, type, clearNewPolygon]);

  /** Handle map press */
  const handleMapPressGetDistance = useCallback(
    (event) => {
      try {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const pressedPoint = { latitude, longitude };

        if (type === "livehoood") return handleMapPress(event);

        const reference = editing ? drawingReference || currentLocation : currentLocation;
        if (!reference) return;

        if (newPolygon.length === 0) {
          const dist = getDistance({ latitude, longitude }, reference);
          if (dist <= distanceThreshold) {
            handleMapPress(event);
          } else if (editing) {
            Alert.alert("❌ Out of Range", "Plot location and current location not same!");
          }
        } else {
          const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
          if (dist !== 0) handleMapPress(event);
        }
      } catch (err) {
        console.log("Press error:", err);
      }
    },
    [type, editing, drawingReference, currentLocation, newPolygon, handleMapPress]
  );


  const handleSelect = useCallback(
    (item) => {
      const { lat, lng } = item || {};
      if (lat && lng) {
        setMarker({ lat, lng });
        animateToLocation(lat, lng);
      }
    },
    [animateToLocation]
  );

  const handleActionPress = useCallback(
    (name) => {
      switch (name) {
        case "toggleEdit":
          setEditing(!editing);
          break;
        case "finalizePolygon":
          finalizePolygon();
          break;
        case "clear":
          clearMapGetDistance();
          break;
        case "undoMark":
          undoMark();
          break;
        case "MapView":
          setShowModal((prev) => !prev);
          break;
        default:
          console.log("Unhandled action:", name);
      }
    },
    [editing, setEditing, finalizePolygon, clearMapGetDistance, undoMark, setShowModal]
  );
  const handleGpsButtonPress = useCallback(() => {
    const { latitude, longitude } = coords || {};
    animateToLocation(latitude, longitude);
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPressGetDistance}
        showsUserLocation
        followsUserLocation
        showsCompass
        compassOffset={{ x: 20, y: 20 }}
        minZoomLevel={15}
        showsScale
        zoomTapEnabled
        rotateEnabled={false}
        userLocationUpdateInterval={5000}
        loadingEnabled
        showsMyLocationButton
        zoomEnabled
        // zoomControlEnabled
        pitchEnabled

      >
        {polygons.map((polygon, idx) =>
          polygon.length >= 3 ? (
            <Polygon
              key={idx}
              coordinates={polygon}
              fillColor="rgba(167, 3, 3, 0.66)"
              strokeColor="rgb(240, 9, 9)"
              strokeWidth={2}
            />
          ) : null
        )}
        {coordinatesCurrent.length > 0 && (
          <Polygon coordinates={coordinatesCurrent} fillColor="rgba(139, 236, 11, 0.73)" strokeColor="rgb(1, 255, 1)" strokeWidth={2} />
        )}
        {newPolygon.length > 0 && (
          <Polygon coordinates={newPolygon} fillColor="rgba(0, 200, 200, 0.5)" strokeColor="rgb(0, 200, 200)" strokeWidth={2} />
        )}
        {newPolygon.map((coord, idx) => (
          <Marker key={idx} coordinate={coord} />
        ))}
        {marker.lat !== 0 && marker.lng !== 0 && <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />}
      </MapView>

      {selectedArea !== 0 && (
        <View style={styles.areaBox}>
          <Text style={styles.areaText}>
            Selected Area: {selectedArea}{" "}
            {landAreaUnit?.[0]?.defined_unit_value ? landAreaUnit?.[0]?.unit_name : "Square meter"}
          </Text>
        </View>
      )}

      <FloatingAction
        position="right"
        actions={actions}
        color={Colors.useGreen}
        overlayColor="rgba(22, 17, 17, 0.35)"
        distanceToEdge={{ vertical: 80, horizontal: 25 }}
        onPressItem={handleActionPress}
      />

      <View style={styles.searchBox}>
        {/* <SuggestiveSearchInput fetchSuggestions={fetchSearchSuggestions} onSelect={handleSelect} /> */}
        <SuggestiveSearchInput
          placeholder="Search places..."
          onSelect={(place) => {
            handleSelect(place)
          }}
          maxSuggestions={50}
          minQueryLength={2}
        />

      </View>
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={handleGpsButtonPress}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={30}
          color="#3C75BE"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5FCFF" },
  map: { ...StyleSheet.absoluteFillObject },
  searchIcon: {
    top: 12,
    left: 10,
    zIndex: 999,
    width: 38,
    height: 38,
    backgroundColor: "#e6dfdf",
    opacity: 0.7,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  areaBox: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 4,
  },
  areaText: { fontSize: 15, color: "#FFF" },
  searchBox: {
    width: "95%",
    position: "absolute",
    top: 10,
    alignSelf: "center",
    left: 10,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    padding: 5,
    borderRadius: 100,
    backgroundColor: '#fff',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 10
  },
});
