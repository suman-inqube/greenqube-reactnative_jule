import React, {memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PaginationNav = ({page, totalPages, onPrev, onNext, t, isLoading}) => {
  const disablePrev = page === 1 || isLoading;
  const disableNext = page === totalPages || isLoading;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navButton, disablePrev && styles.disabledButton]}
        disabled={disablePrev}
        onPress={onPrev}>
        {/* <Ionicons name="chevron-back" size={20} color="#666" /> */}
        <Text style={[styles.navText, styles.nextButton]}>
          {t('prev_page')}{' '}
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageIndicator}>
        {t('page_indicator', {page, totalPages})}
      </Text>

      <TouchableOpacity
        style={[styles.navButton, disableNext && styles.disabledButton]}
        disabled={disableNext}
        onPress={onNext}>
        <Text style={[styles.navText, styles.nextButton]}>
          {t('next_page')}
        </Text>
        {/* <Ionicons name="chevron-forward" size={20} color="#666" /> */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
  },
  nextButton: {
    color: Colors.useGreen,
  },
  pageIndicator: {
    color: Colors.text,
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default memo(PaginationNav);
