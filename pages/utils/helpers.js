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
const detectDocumentType = text => {
  const normalized = text.toLowerCase().replace(/\s/g, '');
  // Aadhaar
  if (normalized.includes('uidai') || normalized.includes('governmentofindia') || /\d{4}\s?\d{4}\s?\d{4}/.test(text)) {
    return 'Aadhaar Card';
  }
  // Voter Card
  if (normalized.includes('electioncommissionofindia',) || normalized.includes('elector') || normalized.includes('identitycard') || normalized.includes('epic') || /[A-Z]{3}[0-9]{7}/i.test(text)) {
    return 'Voter Card';
  }
  return 'Unknown Document';
};
const getOwnerName = (rawText, documentType) => {
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const ignoreWords = [
    'government',
    'india',
    'uidai',
    'aadhaar',
    'male',
    'female',
    'dob',
    'birth',
    'year',
    'father',
    'husband',
    'address',
    'elector',
    'identity',
    'card',
    'election',
    'commission',
    'epic',
    'signature',
  ];
  let index = "";
  index = lines.findIndex(line => {
    const lower = line.toLowerCase();
    return (
      lower.includes("elector's name") ||
      lower.includes('electors name') ||
      lower.includes('name')
    );
  });
  let ownerName = '';
  // =========================
  // FIND NAME
  // =========================
  if (documentType === 'Voter Card') {
    for (let i = 0; i < lines.length; i++) {
      const current =
        lines[i].toLowerCase();
      // Elector's Name
      if (current.includes("elector's name",) || current.includes('electors name',) || current.includes('name',)) {
        // Check next 5 lines
        for (let j = i + 1; j < i + 6; j++) {
          if (!lines[j]) continue;
          const next = lines[j].trim();
          if (
            next.toLowerCase().includes('father') ||
            next.toLowerCase().includes('mother') ||
            next.toLowerCase().includes('husband') ||
            next.toLowerCase().includes('sex') ||
            next.toLowerCase().includes('male',) ||
            next.toLowerCase().includes('female') ||
            next.toLowerCase().includes('age',)
          ) {
            continue;
          }
          if (documentType === 'Voter Card') {
            ownerName = lines[index]?.replace(/^(elector'?s?\sname|electors\sname|name)\s*:?\s*/i, '',).trim();
            if (ownerName) {
              return ownerName.trim();
            }
          }
          // Remove :
          const cleanName = next.replace(/:/g, '',);
          // Valid name
          if (/^[A-Za-z\s]+$/.test(cleanName,) && cleanName.length > 3) {
            console.log('FOUND NAME:', cleanName,);
            return cleanName.replace(/^(elector'?s?\sname|name)\s*:?\s*/i, '').trim();
          }
        }
      }
    }
  } else if (documentType === 'Aadhaar Card') {
    const filtered = lines.filter(line => {
      const lower = line.toLowerCase();
      const hasIgnore = ignoreWords.some(word => lower.includes(word),);
      const hasBigNumber = /\d{4,}/.test(lower);
      return !hasIgnore && !hasBigNumber;
    });
    // =========================
    // AADHAAR LOGIC
    // =========================

    if (documentType === 'Aadhaar Card') {
      for (let line of filtered) {
        const words = line.split(' ');

        if (
          words.length >= 2 &&
          words.length <= 4
        ) {
          return line;
        }
      }
    }
  }
};
// const getSimilarity = (a, b) => {
//   a = a.toLowerCase().trim();
//   b = b.toLowerCase().trim();
//   const matrix = [];
//   for (let i = 0; i <= b.length; i++) {
//     matrix[i] = [i];
//   }
//   for (let j = 0; j <= a.length; j++) {
//     matrix[0][j] = j;
//   }
//   for (let i = 1; i <= b.length; i++) {
//     for (let j = 1; j <= a.length; j++) {
//       if (b[i - 1] === a[j - 1]) {
//         matrix[i][j] = matrix[i - 1][j - 1];
//       } else {
//         matrix[i][j] = Math.min(
//           matrix[i - 1][j] + 1,
//           matrix[i][j - 1] + 1,
//           matrix[i - 1][j - 1] + 1
//         );
//       }
//     }
//   }
//   const distance = matrix[b.length][a.length];
//   return (
//     ((Math.max(a.length, b.length) -
//       distance) /
//       Math.max(a.length, b.length)) *
//     100
//   );
// };
// const isNameMatch = (
//   farmerName,
//   extractedName
// ) => {
//   const similarity = getSimilarity(
//     farmerName,
//     extractedName
//   );

//   console.log(
//     'Name Similarity:',
//     similarity
//   );

//   return similarity >= 60;
// };

const normalizeName = name => name.toLowerCase().trim().split(/\s+/).sort().join(' ');

const getSimilarity = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
      }
    }
  }
  const distance = matrix[b.length][a.length];
  return (((Math.max(a.length, b.length) - distance) / Math.max(a.length, b.length)) * 100);
};

const isNameMatch = (name1, name2) => {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  const similarity = getSimilarity(n1, n2);
  console.log('Normalized 1:', n1);
  console.log('Normalized 2:', n2);
  console.log('Similarity:', similarity);
  return similarity >= 60;
};
// const isNameMatch = (name1, name2) => {
//   const n1 = name1.toLowerCase().trim().replace(/\s+/g, ' ');
//   const n2 = name2.toLowerCase().trim().replace(/\s+/g, ' ');
//   // Full name similarity
//   const similarity = [...n1].filter((c, i) => c === n2[i]).length / Math.max(n1.length, n2.length) * 100;
//   // console.log('NAME SIMILARITY:', similarity, n1, n2);
//   return similarity >= 60;
// };
export {
  getStatusColor,
  getProduceEmoji,
  formatDate,
  getNavigationType,
  groupByRelId,
  formatToDDMMYYYY,
  getAgeLimitDates,
  detectDocumentType,
  getOwnerName,
  isNameMatch
}