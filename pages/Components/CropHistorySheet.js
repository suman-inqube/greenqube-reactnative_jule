import React, {useEffect, useState, useCallback, useContext, memo} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import {ROUTES} from '../utils/Routes';
import {axiosGet} from '../utils/api';
import {userCreateContext} from '../Context/usersCreateContext';

const CropHistorySheet = memo(({plotId, onSelectHistory}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const {loginUser_data} = useContext(userCreateContext);
  const {dbname, lan_id, token} = loginUser_data;

  /* ---------------- FETCH API ---------------- */

  const fetchHistory = useCallback(
    async (pageNumber = 1) => {
      if (!hasMore && pageNumber !== 1) return;

      try {
        setLoading(true);

        const res = await axiosGet(
          ROUTES.GET.GET_CROP_HISTORY({
            plot_id: plotId,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        );

        // console.log('historycount==', JSON.stringify(res?.data?.data));

        const newData = res?.data?.data?.rows || [];
        const totalCount = res?.data?.data?.count || 0;

        if (pageNumber === 1) {
          setData(newData);
        } else {
          setData(prev => [...prev, ...newData]);
        }

        const updatedLength =
          pageNumber === 1 ? newData.length : data.length + newData.length;

        setHasMore(updatedLength < totalCount);
        setPage(pageNumber);
      } catch (err) {
        console.log('History error:', err);
      } finally {
        setLoading(false);
      }
    },
    [plotId, token, dbname, lan_id, hasMore, data.length],
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  /* ---------------- CARD COMPONENT ---------------- */

  const CropHistoryCard = memo(({item}) => {
    const [expanded, setExpanded] = useState(true);

    const formatDate = date => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const seasonName = item?.cropSeasonTime?.season_info?.name;
    const seasonYear = item?.cropSeasonTime?.year;

    return (
      <View style={styles.card}>
        {/* Header */}
        <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
          <View>
            <Text style={styles.titleText}>
              {seasonName ? `${seasonName} (${seasonYear})` : '-'}
              {item?.crop_name?.name ? ` (${item.crop_name.name})` : ''}
            </Text>
          </View>

          <Text style={styles.arrow}>{expanded ? '⌃' : '⌄'}</Text>
        </Pressable>

        {expanded && (
          <Pressable
            onPress={() => onSelectHistory?.(item)}
            style={{marginTop: 4}}>
            <>
              <View style={styles.divider} />

              {/* Details */}
              <View style={styles.infoContainer}>
                <View>
                  {[
                    'Crop Variety',
                    'Season',
                    'Sowing Date',
                    'Harvest Date',
                  ].map((label, idx) => (
                    <Text key={idx} style={styles.labelText}>
                      {label}
                    </Text>
                  ))}
                </View>

                <View style={{marginLeft: 10}}>
                  <Text style={styles.valueText}>
                    : {item?.crop_variety?.name || '-'}
                  </Text>

                  <Text style={styles.valueText}>
                    : {seasonName ? `${seasonName} (${seasonYear})` : '-'}
                  </Text>

                  <Text style={styles.valueText}>
                    : {formatDate(item?.sowing_date)}
                  </Text>

                  <Text style={styles.valueText}>
                    : {formatDate(item?.harvesting_date)}
                  </Text>
                </View>
              </View>
            </>
          </Pressable>
        )}
      </View>
    );
  });
const renderItem = useCallback(
  ({item}) => {
    return <CropHistoryCard item={item} onSelectHistory={onSelectHistory} />;
  },
  [onSelectHistory],
);

  /* ---------------- RETURN ---------------- */

  return (
    <View style={{flex: 1}}>
      <Text style={styles.screenTitle}>Crop History</Text>

      <FlatList
        data={data}
        keyExtractor={item => item?.cu_rel_id}
        renderItem={renderItem}
        onEndReached={() => hasMore && fetchHistory(page + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" /> : null
        }
      />
    </View>
  );
});

export default CropHistorySheet;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    marginHorizontal: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 16,
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  subText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  arrow: {
    fontSize: 18,
    color: '#777',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },

  infoContainer: {
    flexDirection: 'row',
  },

  labelText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },

  historyButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  historyText: {
    color: '#fff',
    fontWeight: '600',
  },

  statusBadge: {
    backgroundColor: '#F3E5AB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: '#9E7C00',
    fontWeight: '600',
    fontSize: 12,
  },
});
