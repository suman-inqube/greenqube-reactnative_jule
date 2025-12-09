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
const formatToDDMMYYYY = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months start at 0
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
const getAgeLimitDates = () => {
  const today = new Date();

  const minimumDate = new Date(
    today.getFullYear() - 99,
    today.getMonth(),
    today.getDate()
  );

  const maximumDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

  return { minimumDate, maximumDate };
};
export {
  getStatusColor,
  getProduceEmoji,
  formatDate,
  getNavigationType,
  groupByRelId,
  formatToDDMMYYYY,
   getAgeLimitDates,
}