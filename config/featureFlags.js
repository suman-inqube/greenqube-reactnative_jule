// featureFlags.js

import {CURRENT_ENV} from '../config/environment'; // <-- তোমার existing config file

export const FEATURES = {
  ENABLE_DISTANCE_CHECK: CURRENT_ENV === 'LIVE',
  ENABLE_POLYGON_OVERLAP_CHECK: CURRENT_ENV === 'LIVE',
};
