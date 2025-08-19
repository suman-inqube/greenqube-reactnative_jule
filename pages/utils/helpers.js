import { Colors } from "./Constants";
import { detectNavigationType } from 'react-native-detect-navbar-android';
const getStatusColor = (status) => {
    switch (status) {
        case 'active': return Colors.active;
        case 'completed': return Colors.completed;
        case 'pending': return Colors.pending;
        default: return '#6B7280';
    }
};
const getProduceEmoji = (produce) => {
    switch (produce?.toLowerCase()) {
        case 'tomato': return '🍅';
        case 'paddy': return '🌾';
        default: return '🌱';
    }
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};


const getNavigationType = async () => {
  try {
    const type = await detectNavigationType(); // "GESTURE" | "BUTTON" | "UNKNOWN"
    return type;
  } catch (err) {
    console.warn('Nav type detect failed:', err);
    return 'UNKNOWN';
  }
}
const groupByRelId = (data) =>
  Object.values(
    data.reduce((result, item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng)) return result;

      (result[item.rel_id] = result[item.rel_id] || []).push({ latitude: lat, longitude: lng });
      return result;
    }, {})
  );

export {
    getStatusColor,
    getProduceEmoji,
    formatDate,
    getNavigationType,
    groupByRelId
}