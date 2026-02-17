import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {cacheManager} from '../../utils/mmkvStorage';
import {axiosPost, axiosPut} from '../../utils/api';
import CustomHeader from '../CustomHeader';

const {width} = Dimensions.get('window');

const Offline = () => {
  const [queue, setQueue] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadQueue();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadQueue = () => {
    const storedQueue = cacheManager.getQueue() || [];
    setQueue(storedQueue);
  };

  const submitItem = async (item, index) => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      Alert.alert('No Internet', 'Please connect to internet');
      return;
    }

    let finalBody = item.body;

    if (item.isFormData) {
      finalBody = new FormData();
      Object.keys(item.body).forEach(key => {
        finalBody.append(key, item.body[key]);
      });
    }

    try {
      const apiMethod = item.method === 'POST' ? axiosPost : axiosPut;
      await apiMethod(
        item.url,
        finalBody,
        item.token,
        item.isUrlEncoded,
        item.extraHeaders,
      );

      const updatedQueue = [...queue];
      updatedQueue.splice(index, 1);
      cacheManager.updateQueue(updatedQueue);
      setQueue(updatedQueue);

      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      Alert.alert('Error', 'API failed. Will retry later.');
    }
  };
  const renderCustomHeader = useMemo(() => <CustomHeader />, []);
  // const renderItem = ({item, index}) => {
  //   const payload =
  //     item?.body?.data != undefined ? JSON.parse(item?.body?.data) : item?.body;
  //   const url = item.url.split('/').pop();
  //   let plot_name="";
  //   if (url == 'multiLatLong') {
  //      plot_name = 'aaaaaaaaaaa';
  //   }
  //   console.log(JSON.stringify(payload), url);
  //   console.log('*****', url == 'multiLatLong',plot_name);
  //   const itemAnim = new Animated.Value(0);

  //   Animated.spring(itemAnim, {
  //     toValue: 1,
  //     friction: 8,
  //     tension: 40,
  //     useNativeDriver: true,
  //   }).start();

  //   return (
  //     <Animated.View
  //       style={[
  //         styles.card,
  //         {
  //           opacity: itemAnim,
  //           transform: [
  //             {
  //               translateY: itemAnim.interpolate({
  //                 inputRange: [0, 1],
  //                 outputRange: [50, 0],
  //               }),
  //             },
  //           ],
  //         },
  //       ]}>
  //       {/* Header Section */}
  //       <View style={styles.cardHeader}>
  //         <View style={styles.indexBadge}>
  //           <Text style={styles.indexText}>#{index + 1}</Text>
  //         </View>
  //         <View style={styles.methodBadge}>
  //           <Text style={styles.methodText}>{item.method}</Text>
  //         </View>
  //       </View>

  //       {/* Farmer Info Section */}
  //       {/* <View style={styles.farmerSection}>
  //         <View style={styles.avatarCircle}>
  //           <Text style={styles.avatarText}>
  //             {payload[0].farmer_details.userName.charAt(0).toUpperCase()}
  //           </Text>
  //         </View>
  //         <View style={styles.farmerInfo}>
  //           <Text style={styles.farmerName}>
  //             {payload[0].farmer_details.userName}
  //           </Text>
  //           <Text style={styles.farmerPhone}>
  //             📞 {payload[0].farmer_details.contactNumber}
  //           </Text>
  //         </View>
  //       </View> */}

  //       {/* Details Section */}
  //       <View style={styles.detailsSection}>
  //         <View style={styles.detailRow}>
  //           <View style={styles.iconCircle}>
  //             <Text style={styles.iconText}>🌳</Text>
  //           </View>
  //           <View style={styles.detailContent}>
  //             <Text style={styles.detailLabel}>Plot Number</Text>
  //             <Text style={styles.detailValue}>
  //               {url == 'multiLatLong'
  //                 ? payload?.plot_no
  //                 : 'payload?.[0]?.farmer_details?.agri_land_user_rels?.[0]?.plot_no' ||
  //                   'N/A'}
  //               {plot_name}
  //             </Text>
  //           </View>
  //         </View>

  //         {/* <View style={styles.detailRow}>
  //           <View style={styles.iconCircle}>
  //             <Text style={styles.iconText}>🔗</Text>
  //           </View>
  //           <View style={styles.detailContent}>
  //             <Text style={styles.detailLabel}>API Endpoint</Text>
  //             <Text style={styles.detailValue} numberOfLines={1}>
  //               {item.url.split('/').pop()}
  //             </Text>
  //           </View>
  //         </View> */}
  //       </View>

  //       {/* Submit Button */}
  //       <TouchableOpacity
  //         style={styles.submitButton}
  //         onPress={() => submitItem(item, index)}
  //         activeOpacity={0.8}>
  //         <View style={styles.buttonContent}>
  //           <Text style={styles.submitText}>Sync Data</Text>
  //           <Text style={styles.arrowIcon}>→</Text>
  //         </View>
  //       </TouchableOpacity>
  //     </Animated.View>
  //   );
  // };

  const renderItem = ({item, index}) => {
  const payload =
    item?.body?.data != undefined ? JSON.parse(item?.body?.data) : item?.body;
  const url = item.url.split('/').pop();
  
  let displayValue = '';
  let plot_name = '';
  
  console.log(url)
  if (url == 'multiLatLong') {
    displayValue = `${payload?.plot_no || 'N/A'}`;
  } else {
    // Handle other URL types
    displayValue = payload?.[0]?.farmer_details?.agri_land_user_rels?.[0]?.plot_no || 'N/A';
  }
  
  // console.log(JSON.stringify(payload), url);
  // console.log('*****', url == 'multiLatLong', plot_name);
  
  const itemAnim = new Animated.Value(0);

  Animated.spring(itemAnim, {
    toValue: 1,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  }).start();

  return (
    url!=undefined && url!="addPlotImgs" && url !="nearestPlots" ?
    <Animated.View
      style={[
        styles.card,
        {
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>#{index + 1}</Text>
        </View>
        <View style={styles.methodBadge}>
          <Text style={styles.methodText}>{item.method}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🌳</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Plot Number</Text>
            <Text style={styles.detailValue}>
              {displayValue}
            </Text>
          </View>
        </View>

        {/* Add URL info if needed */}
        {/* <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔗</Text>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>API Endpoint</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {url}
            </Text>
          </View>
        </View> */}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => submitItem(item, index)}
        activeOpacity={0.8}>
        <View style={styles.buttonContent}>
          <Text style={styles.submitText}>Sync Data</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
    :<></>
  );
};
  return (
    <View style={styles.container}>
      {renderCustomHeader}
      {/* Header */}
      <Animated.View style={[styles.headerContainer, {opacity: fadeAnim}]}>
        <View style={styles.headerTop}>
          <Text style={styles.header}>Offline Queue</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{queue.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {queue.length === 0
            ? 'All synced up! 🎉'
            : `${queue.length} item${queue.length > 1 ? 's' : ''} pending sync`}
        </Text>
      </Animated.View>

      {/* List */}
      {queue.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, {opacity: fadeAnim}]}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIcon}>✓</Text>
          </View>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptySubtitle}>No pending data to sync</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default Offline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  countBadge: {
    backgroundColor: '#6C5CE7',
    borderRadius: 20,
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#6C5CE7',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  indexBadge: {
    backgroundColor: '#F0F0F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  methodBadge: {
    backgroundColor: '#00D2FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  farmerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F7',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  farmerPhone: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#95A5A6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
    color: '#4CAF50',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
