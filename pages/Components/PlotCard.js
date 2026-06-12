import React, { memo, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../utils/Constants';
import CollapsibleCard from '../Common/CollapsibleCard';
import StatusBadge from './StatusBadge';
import CropHistorySheet from './CropHistorySheet';
import { useBottomSheet } from '../Common/BottomSheetProvider';
import { useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../Context/usersCreateContext';

const PlotCard = memo(
  ({
    item,
    onPress,
    landUnitsquareMetre,
    landAreaUnit,
    apiCall,
    index,
    role = 'farmer',
    activityApi,
  }) => {
    const { t } = useContext(userCreateContext);
    const { showBottomSheet } = useBottomSheet();
    const navigation = useNavigation();
    // console.log(JSON.stringify(item));

    const handleOpenHistory = useCallback(() => {
      showBottomSheet(
        <CropHistorySheet
          plotId={item?.rel_id}
          onSelectHistory={historyItem => {
            const updatedItem = {
              ...item,
              plot_crops: [historyItem], // push history as plot_crops
            };
            showBottomSheet(null);

            onPress({
              source: 'HISTORY',
              data: updatedItem,
            });
          }}
        />,
      );
    }, [item?.rel_id, onPress, showBottomSheet]);
    const convertedArea = (
      Number(landUnitsquareMetre?.[0]?.defined_unit_value || 0) *
      Number(item?.google_area || 0)
    ).toFixed(2);

    return (
      <TouchableOpacity
        onPress={() =>
          onPress({
            source: 'CURRENT',
            data: item,
          })
        }>
        <CollapsibleCard
          width="100%"
          apiCall={() => apiCall(item, index)}
          header={
            <View style={styles.headerContainer}>
              {/* Top Row: Plot Name + Status */}
              <View style={styles.topRow}>
                <Text style={styles.plotName} numberOfLines={1}>
                  {item?.plot_no}
                </Text>

                <View style={styles.statusRow}>
                  <StatusBadge type="Plot" status={item?.plot_status} />
                  <StatusBadge
                    type="Carbon"
                    status={
                      [
                        'CARBON_DOCUMENTS_SUBMITTED',
                        'CARBON_DOCUMENTS_APPROVED',
                        'CARBON_DOCUMENTS_REJECTED',
                      ].includes(item?.status_level)
                        ? item?.status_level
                        : 'PENDING'
                    }
                  />
                  {/* <StatusBadge type="Carbon" status={item?.status_level} /> */}
                </View>
              </View>

              {/* Area Row */}
              <View style={styles.areaRow}>
                <Image
                  source={require('../Common/images/area-with-pins.png')}
                  style={styles.areaIcon}
                />
                <Text style={styles.text}>
                  {convertedArea} {landAreaUnit?.[0]?.name || ''}
                </Text>
              </View>
            </View>
          }
          content={
            <>
              <View style={styles.plotInfoContainer}>
                <View>
                  {[
                    'plot_name',
                    'reported_land_area',
                    'converted_land_area',
                    'produce_name',
                    'produce_variety',
                    'cycle_start_date',
                    'cycle_end_date',
                  ].map((label, idx) => (
                    <Text key={idx} style={styles.text}>
                      {t(label)}
                    </Text>
                  ))}
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.label}>: {item?.plot_no}</Text>
                  <Text style={styles.label}>
                    : {item?.land_size} {item?.land_unit?.name}
                  </Text>
                  <Text style={styles.label}>
                    : {parseFloat(item?.land_convert_size).toFixed(2)}{' '}
                    {landAreaUnit?.[0]?.name}
                  </Text>
                  <Text style={styles.label}>
                    : {item?.plot_crops?.[0]?.crop_name?.name}
                  </Text>
                  <Text style={styles.label}>
                    : {item?.plot_crops?.[0]?.crop_variety?.name}
                  </Text>
                  <Text style={styles.label}>
                    : {item?.plot_crops?.[0]?.sowing_date?.substring(0, 10)}
                  </Text>
                  <Text style={styles.label}>
                    : {item?.plot_crops?.[0]?.harvesting_date?.substring(0, 10)}
                  </Text>
                </View>
              </View>
              {/* change logic to show reject reason if plot is rejected or comment is there add ||item?.plot_status_comment!="" */}
              {item?.plot_status === 'REJECTED' || item?.plot_status_comment !== "" ? (
                <View style={styles.rejectBox}>
                  <Text style={styles.rejectText}>
                    {item?.plot_status_comment}
                  </Text>
                </View>
              ) : <></>}
            </>
          }
          footer={
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenHistory}>
                <Text style={styles.actionText}>{t('crop_history')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => activityApi(item?.rel_id)}>
                <Text style={styles.actionText}>{t('Activity')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </TouchableOpacity>
    );
  },
);

export default PlotCard;

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    marginVertical: 3,
    lineHeight: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
    fontSize: 14,
    marginVertical: 3,
    lineHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotInfoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 🔥 Important
    alignItems: 'center',
    marginTop: 8,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  rejectBox: {
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  rejectText: {
    color: 'red',
    fontSize: 13,
  },
  historyButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },
  headerContainer: {
    flex: 1, // important for arrow spacing
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  plotName: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
    flex: 1,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // if gap not supported, use marginRight
  },
  actionButton: {
    backgroundColor: '#15af50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120, // keeps symmetry
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },
});
