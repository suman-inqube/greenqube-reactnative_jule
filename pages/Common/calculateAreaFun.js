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

import { getDistance, isPointInPolygon } from 'geolib';
export const isWithin20Meters = (currentLocation, points, distance = 40) => {
  return points?.filter(
    point => getDistance(currentLocation, point) <= distance,
  );
};

export const getOutsidePipeLocations = (pipeDetails, plotPolygon) => {
  if (!Array.isArray(pipeDetails) || !Array.isArray(plotPolygon)) {
    return [];
  }
  const outsideLocations = [];
  pipeDetails.forEach((pipe) => {
    const pipeName = pipe?.[0]?.pipe_name;
    const images = pipe?.[1];
    if (!Array.isArray(images)) return;
    images.forEach((image) => {
      const lat = Number(image?.lat);
      const lon = Number(image?.lon);
      // Skip invalid coordinates
      // if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      //   return;
      // }
      const isInside = isPointInPolygon(
        { lat, lon },
        // {"latitude": "22.366409995044165", "longitude": "87.87663286533432"},
        plotPolygon
      );
      if (!isInside) {
        outsideLocations.push({
          pipe_name: pipeName,
          imageName: image.imageName,
          lat,
          lon,
          status: 'outside',
        });
      }
    });
  });
  return outsideLocations;
};

export const getNearestPipe = (pipeList = [], latitude, longitude) => {
  if (!Array.isArray(pipeList) || pipeList.length === 0) {
    return null;
  }

  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return null;
  }

  const validPipes = pipeList.filter(pipe =>
    Number.isFinite(Number(pipe.latitude)) &&
    Number.isFinite(Number(pipe.longitude))
  );

  if (validPipes.length === 0) return null;

  const nearestPipe = validPipes.reduce((nearest, pipe) => {
    const distance = getDistance(
      {
        latitude: Number(pipe.latitude),
        longitude: Number(pipe.longitude),
      },
      {
        latitude: Number(latitude),
        longitude: Number(longitude),
      }
    );

    return !nearest || distance < nearest.distance
      ? { ...pipe, distance }
      : nearest;
  }, null);

  return nearestPipe;
};


export const areAllPipesInsidePolygon = (pipeList = [], plotPolygon = []) => {
  if (
    !Array.isArray(pipeList) ||
    pipeList.length === 0 ||
    !Array.isArray(plotPolygon) ||
    plotPolygon.length < 3
  ) {
    return false;
  }

  return pipeList.every(pipe => {
    const latitude = Number(pipe.latitude);
    const longitude = Number(pipe.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return false;
    }

    return isPointInPolygon(
      { latitude, longitude },
      plotPolygon
    );
  });
};

