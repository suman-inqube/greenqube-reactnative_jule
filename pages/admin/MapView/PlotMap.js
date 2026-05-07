import React, {useRef, useEffect, useState, useContext} from 'react';
import MapView, {Polygon, Circle} from 'react-native-maps';
import {View, TouchableOpacity, Text} from 'react-native';
import FloatingActionButton from '../../Components/FloatingActionButton';
import {userCreateContext} from '../../Context/usersCreateContext';

const PlotMap = ({
  polygons = [],
  center,
  onPolygonPress,
  onOpenFilter,
  showRadius,
}) => {
  const {loginUser_data, t} = useContext(userCreateContext);
  const mapRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [center]);

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        style={{flex: 1}}
        mapType="hybrid"
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
        initialRegion={{
          latitude: center?.latitude || 22.5726,
          longitude: center?.longitude || 88.3639,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}>
        {center && showRadius && (
          <Circle
            center={{
              latitude: center.latitude,
              longitude: center.longitude,
            }}
            radius={500}
            strokeColor="rgb(1, 200, 255)"
            fillColor="rgba(241, 248, 255, 0.11)"
          />
        )}
        {/* ✅ POLYGONS */}
        {polygons.map((plot, index) => (
          <Polygon
            key={plot.id || index}
            coordinates={plot.coordinates}
            fillColor={
              plot.isSelected
                ? 'rgba(144,238,144,0.7)'
                : 'rgba(31, 164, 42, 0.8)'
            }
            strokeColor={plot.isSelected ? '#004d00' : '#004d00'}
            strokeWidth={2}
            tappable={true}
            onPress={() => onPolygonPress(plot)}
          />
        ))}
      </MapView>

      {showMenu && (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 10,
            elevation: 5,
          }}>
          <TouchableOpacity
            onPress={() => {
              setShowMenu(false);
              onOpenFilter();
            }}
            style={{padding: 10}}>
            <Text>{t('search_location')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FloatingActionButton
        actions={[
          {
            text: t('search_location'),
            icon: require('../../Common/images/find.png'),
            name: 'search_location',
            position: 1,
          },
        ]}
        onPressItem={name => {
          if (name === 'search_location') {
            onOpenFilter();
          }
        }}
      />
    </View>
  );
};

export default React.memo(PlotMap);
