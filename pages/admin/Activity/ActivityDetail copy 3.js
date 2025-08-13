import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ActivityDetail = () => {
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });

  const [farmerActivity] = useState({
    cropActivity: '',
    typeActivity: '',
    userName: 'John Farmer',
    contactNumber: '+1 234-567-8900',
    activitycategoryName: 'Irrigation Management',
    cropActivitycategoryName: 'Water Application',
    plot_no: 'Plot-A-001',
    cropName: 'Wheat',
    growthStage: 'Flowering',
    act_perform_date: '2024-03-15',
    act_desc: 'Applied drip irrigation system for optimal water distribution across the field.',
    material_used: 'Drip irrigation pipes, emitters, filters',
    water_used: '500 liters',
    power_used: '2.5 kWh',
    act_start_date: '2024-03-10',
    act_to_date: '2024-03-20',
  });

  const [selectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });

  const [carbonActivity] = useState([]);

  const formatDateToDateName = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const InputTextForm = ({ label, value, editable = true, icon }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value || ''}
        editable={editable}
      />
    </View>
  );

  const TakePhoto = ({ selectedImage, title }) => (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.labelRow}>
        <Icon name="camera" size={16} color="#2563eb" />
        <Text style={styles.labelText}>{title}</Text>
      </View>
      <View style={styles.gridRow}>
        {[selectedImage.firstItem, selectedImage.secondItem, selectedImage.thirdItem].map((image, index) => (
          <TouchableOpacity key={index} style={styles.photoBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photoImage} />
            ) : (
              <Icon name="camera" size={32} color="#9ca3af" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const RecordComp = ({ selectedRecord, title, soundPlay }) => (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.labelRow}>
        <Icon name="mic" size={16} color="#2563eb" />
        <Text style={styles.labelText}>{title}</Text>
      </View>
      <View style={styles.gridRow}>
        {[selectedRecord.firstItemRecord, selectedRecord.secondItemRecord, selectedRecord.thirdItemRecord].map((record, index) => (
          <TouchableOpacity key={index} style={styles.photoBox}>
            {record ? (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => soundPlay && soundPlay(record)}
              >
                <Icon name="play" size={28} color="#2563eb" />
              </TouchableOpacity>
            ) : (
              <Icon name="mic" size={32} color="#9ca3af" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const soundPlay = (path) => {
    console.log('Playing audio:', path);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="leaf" size={20} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Activity Details</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Farmer Info */}
        <Text style={styles.sectionTitle}>Farmer Information</Text>
        <View style={styles.row}>
          <InputTextForm
            label="Farmer Name"
            value={farmerActivity.userName}
            editable={false}
            icon={<Icon name="user" size={14} />}
          />
          <InputTextForm
            label="Contact Number"
            value={farmerActivity.contactNumber}
            editable={false}
            icon={<Icon name="phone" size={14} />}
          />
        </View>

        {/* Activity Info */}
        {farmerActivity?.cropActivitycategoryName && (
          <>
            <Text style={styles.sectionTitle}>Activity Information</Text>
            <View style={styles.row}>
              <InputTextForm
                label="Activity Type"
                value={farmerActivity.activitycategoryName}
                editable={false}
                icon={<Icon name="file-text" size={14} />}
              />
              <InputTextForm
                label="Activity Name"
                value={`${farmerActivity.cropActivitycategoryName} ${formatDateToDateName(farmerActivity.act_start_date)} - ${formatDateToDateName(farmerActivity.act_to_date)}`}
                editable={false}
                icon={<Icon name="calendar" size={14} />}
              />
            </View>
          </>
        )}

        {/* Field & Crop Info */}
        <Text style={styles.sectionTitle}>Field & Crop Information</Text>
        <View style={styles.row}>
          <InputTextForm
            label="Plot Name"
            value={farmerActivity.plot_no}
            editable={false}
            icon={<Icon name="map-pin" size={14} />}
          />
          <InputTextForm
            label="Crop Name"
            value={farmerActivity.cropName}
            editable={false}
            icon={<Icon name="leaf" size={14} />}
          />
          <InputTextForm
            label="Growth Stage"
            value={farmerActivity.growthStage}
            editable={false}
            icon={<Icon name="leaf" size={14} />}
          />
          <InputTextForm
            label="Activity Performed Date"
            value={formatDateToDateName(farmerActivity.act_perform_date)}
            editable={false}
            icon={<Icon name="calendar" size={14} />}
          />
        </View>

        {/* Resource Usage */}
        <Text style={styles.sectionTitle}>Resource Usage</Text>
        <InputTextForm
          label="Activity Description"
          value={farmerActivity.act_desc}
          editable={false}
          icon={<Icon name="file-text" size={14} />}
        />
        <View style={styles.row}>
          <InputTextForm
            label="Material Used"
            value={farmerActivity.material_used}
            editable={false}
            icon={<Icon name="file-text" size={14} />}
          />
          <InputTextForm
            label="Water Used"
            value={farmerActivity.water_used}
            editable={false}
            icon={<Icon name="droplet" size={14} />}
          />
          <InputTextForm
            label="Power Used"
            value={farmerActivity.power_used}
            editable={false}
            icon={<Icon name="zap" size={14} />}
          />
        </View>

        {/* Media */}
        {carbonActivity.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>Media & Documentation</Text>
            <TakePhoto
              selectedImage={selectedImage}
              title="Photos (Optional)"
            />
            <RecordComp
              selectedRecord={selectedRecord}
              title="Audio Comments (Optional)"
              soundPlay={soundPlay}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb'
  },
  headerIcon: {
    backgroundColor: '#059669',
    padding: 6,
    borderRadius: 8,
    marginRight: 8
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inputContainer: { flex: 1, marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  labelText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    color: '#111827'
  },
  inputDisabled: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb'
  },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6'
  },
  photoImage: { width: '100%', height: '100%', borderRadius: 8 },
  playButton: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff'
  }
});
