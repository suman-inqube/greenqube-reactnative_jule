import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';

const RadioGroup = ({ navigation, spSheet, options }) => {
  const [selectedId, setSelectedId] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  const handleChangeNavigate = useCallback((item) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    spSheet.hide();
    timeoutRef.current = setTimeout(() => {
      navigation.navigate(item.navigation);
      timeoutRef.current = null;
    }, 500);
  }, [navigation, spSheet]);
  const handleSelect = useCallback((item) => {
    setSelectedId(item.id);
    handleChangeNavigate(item);
  }, [handleChangeNavigate]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardRow}>
        {options?.map((item) => (
          <RadioButton
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={() => handleSelect(item)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default memo(RadioGroup);