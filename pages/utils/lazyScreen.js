// utils/lazyLoader.js
import React from 'react';
import { Text } from 'moti';
import WaterDropLoader from '../Components/WaterDropLoader';
export const lazyScreen = (importFunc) => {
  const Screen = React.lazy(importFunc);
  return (props) => (
    <React.Suspense fallback={<WaterDropLoader />}>
      <Screen {...props} />
    </React.Suspense>
  );
};
