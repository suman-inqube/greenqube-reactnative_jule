import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import CollapsibleCard from '../Common/CollapsibleCard';
import StatusBadge from './StatusBadge';
import CropHistorySheet from './CropHistorySheet';
import {useBottomSheet} from '../Common/BottomSheetProvider';

const PlotCard = memo(
  ({item, onPress, landUnitsquareMetre, landAreaUnit, apiCall, index}) => {
    const {showBottomSheet} = useBottomSheet();

    const handleOpenHistory = useCallback(() => {
      // console.log('item--', item);
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
              <Text style={[styles.text, {fontSize: 18, color: Colors.text}]}>
                {item?.plot_no}
              </Text>
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
                    'Plot Name',
                    'Reported Land Area',
                    'Converted Land Area',
                    'Produce Name',
                    'Produce Variety',
                    'Cycle Start Date',
                    'Cycle End Date',
                  ].map((label, idx) => (
                    <Text key={idx} style={styles.text}>
                      {label}
                    </Text>
                  ))}
                </View>
                <View style={{marginLeft: 10}}>
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

              {item?.status_level === 'REJECTED' && (
                <View style={styles.rejectBox}>
                  <Text style={styles.rejectText}>{item?.comment}</Text>
                </View>
              )}
            </>
          }
          footer={
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleOpenHistory}>
                <Text style={styles.historyText}>Crop History</Text>
              </TouchableOpacity>

              <View>
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
              </View>
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
    justifyContent: 'space-between',
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
});
