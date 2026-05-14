import React, {useState, useContext} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {userCreateContext} from '../../Context/usersCreateContext';

const FilterModal = ({
  visible,
  onClose,
  onApply,
  states = [],
  districts = [],
  panchayats = [],
  onStateChange,
  onDistrictChange,
  statesLabel,
  districtsLabel,
  panchayatsLabel,
}) => {
  const {DropdownForm, t} = useContext(userCreateContext);

  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [selectedGP, setSelectedGP] = useState([]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* STATE */}
          <DropdownForm
            label={statesLabel}
            val={state?.value}
            data={states}
            onChange={item => {
              setState(item);
              setDistrict(null);
              setSelectedGP([]);
              onStateChange && onStateChange(item);
            }}
          />

          {/* DISTRICT */}
          <DropdownForm
            label={districtsLabel}
            val={district?.value}
            data={districts}
            disabled={!state}
            onChange={item => {
              setDistrict(item);
              setSelectedGP([]);
              onDistrictChange && onDistrictChange(item);
            }}
          />

          {/* GP MULTI SELECT */}
          {district && (
            <View style={{marginTop: 15}}>
              <Text style={{fontWeight: '600', fontSize: 14, paddingBottom: 5}}>
                {panchayatsLabel} (Max 2)
              </Text>

              {/* 👇 Hint */}

              <View
                style={{
                  maxHeight: 250,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 10,
                  padding: 10,
                  backgroundColor: '#F9FAFB',
                }}>
                <ScrollView showsVerticalScrollIndicator={true}>
                  {panchayats.map(item => {
                    const selected = selectedGP.some(
                      p => p.value === item.value,
                    );

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 5,
                          borderBottomWidth: 0.5,
                          borderBottomColor: '#E5E7EB',
                        }}
                        onPress={() => {
                          let updated = [];

                          if (selected) {
                            updated = selectedGP.filter(
                              p => p.value !== item.value,
                            );
                          } else {
                            if (selectedGP.length >= 2) {
                              alert('Max 2 allowed');
                              return;
                            }
                            updated = [...selectedGP, item];
                          }

                          setSelectedGP(updated);
                        }}>
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            borderWidth: 1.5,
                            borderColor: selected ? '#16A34A' : '#9CA3AF',
                            backgroundColor: selected ? '#16A34A' : '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}>
                          {selected && (
                            <Text style={{color: '#fff', fontSize: 12}}>✓</Text>
                          )}
                        </View>

                        <Text
                          style={{
                            fontSize: 14,
                            color: '#111827',
                            fontWeight: selected ? '600' : '400',
                          }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 👇 Fade Effect */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 20,
                    backgroundColor: 'rgba(249,250,251,0.9)',
                  }}
                />
              </View>
            </View>
          )}

          {/* APPLY */}
          <TouchableOpacity
            style={styles.apply}
            onPress={() => {
              onApply({
                state,
                district,
                panchayats: selectedGP,
              });
              onClose();
            }}>
            <Text style={{color: '#fff'}}>{t('apply')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              padding: 12,
              marginTop: 10,
              alignItems: 'center',
              borderRadius: 8,
            }}
            onPress={() => {
              setState(null);
              setDistrict(null);
              setSelectedGP([]);

              onApply({
                state: null,
                district: null,
                panchayats: [],
                isClear: true, // 🔥 important flag
              });

              onClose();
            }}>
            <Text style={{color: '#fff'}}>{t('clear_filter')}</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={onClose}>
            <Text style={{textAlign: 'center', marginTop: 10}}>Close</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  apply: {
    backgroundColor: 'green',
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
});
