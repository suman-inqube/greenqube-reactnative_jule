
import { useEffect, useState } from "react";
import BackgroundLocation from "../utils/BackgroundLocation";
export default function useBackgroundLocation() {
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    BackgroundLocation.start();
    const unsubscribe = BackgroundLocation.subscribe(loc => {
      setCoords(loc);
    });
    return () => {
      unsubscribe();
      BackgroundLocation.stop();
    };
  }, []);
  return coords; 
}
