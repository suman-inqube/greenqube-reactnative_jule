export const calculateAreaFun = coordinates => {
    if (coordinates.length < 3) return 0;
    let area = 0;
    const radius = 6378137; // Earth's radius in meters (WGS-84)
    for (let i = 0; i < coordinates.length; i++) {
        const { latitude: lat1, longitude: lon1 } = coordinates[i];
        const { latitude: lat2, longitude: lon2 } = coordinates[(i + 1) % coordinates.length];
        const x1 = (lon1 * Math.PI) / 180;
        const y1 = (lat1 * Math.PI) / 180;
        const x2 = (lon2 * Math.PI) / 180;
        const y2 = (lat2 * Math.PI) / 180;
        area += x1 * y2 - x2 * y1;
    }
    area = (area * radius * radius) / 2.0;
    return Math.abs(area); // Area in square meters
};
export const convertedArrayLatLong = (arrayOfObjects) => {
    return arrayOfObjects.map(data => ({ latitude: Number(data.latitude), longitude: Number(data.longitude) }));
};

import {getDistance} from 'geolib';
export const isWithin20Meters = (currentLocation, points, distance = 40) => {
  return points?.filter(
    point => getDistance(currentLocation, point) <= distance,
  );
};
