import React, { memo } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';
import Skeleton from './index';

const SkeletonScreenDashboard = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#003c04" barStyle="light-content" />

      {/* 🔥 Single animation wrapper for header */}
      <MotiView
        from={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 900, loop: true, repeatReverse: true }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.wheatIcon}>🌾</Text>
              <Text style={styles.logoText}>green</Text>
              <Text style={styles.logoSubText}>Qube</Text>
            </View>
          </View>

          <View style={styles.headerIcons}>
            <View style={styles.iconButton}>
              <Skeleton height={16} width="75%" borderRadius={4} />
            </View>
            <View style={styles.iconButton}>
              <Text style={styles.iconText}>⋯</Text>
            </View>
          </View>
        </View>
      </MotiView>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <View style={styles.navButtons}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.navButton}>
                  <Skeleton height={50} width={50} borderRadius={25} />
                  <Skeleton height={10} width={60} borderRadius={12} style={styles.navLabel} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Feed */}
      <ScrollView style={styles.activityFeed} showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={styles.userCardContainer}>
          <View style={styles.userCardLeft}>
            <Skeleton height={100} width={100} borderRadius={50} />
            <Skeleton height={10} width="80%" borderRadius={50} style={styles.mt8} />
            <Skeleton height={10} width="50%" borderRadius={4} style={styles.mt6} />
          </View>
          <View style={styles.userCardRight}>
            {[1, 2, 3].map((_, idx) => (
              <View key={idx} style={styles.activityRow}>
                <Skeleton height={10} width="80%" borderRadius={50} />
                <Skeleton height={10} width="50%" borderRadius={4} style={styles.mt6} />
                {idx !== 2 && <Skeleton height={1} width="100%" borderRadius={4} />}
              </View>
            ))}
          </View>
        </View>

        {/* Activity box */}
        <View style={styles.activityBox}>
          <View style={styles.filterRow}>
            <Skeleton height={30} width={70} borderRadius={20} />
            <Skeleton height={30} width={70} borderRadius={20} />
          </View>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.activityRow}>
              <Skeleton height={10} width="80%" borderRadius={50} />
              <Skeleton height={10} width="50%" borderRadius={4} style={styles.mt6} />
              {idx !== 2 && <Skeleton height={1} width="100%" borderRadius={4} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default memo(SkeletonScreenDashboard);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003c04' },

  header: { backgroundColor: '#003c04' },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: 'white', fontSize: 25, fontWeight: 'bold' },

  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { flexDirection: 'row', alignItems: 'center' },
  wheatIcon: { fontSize: 20, marginRight: 8 },
  logoText: { color: '#FFA726', fontSize: 18, fontWeight: 'bold' },
  logoSubText: { color: '#FFA726', fontSize: 18, fontWeight: '300' },

  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 16 },

  heroSection: { height: 180, backgroundColor: '#003c04' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center' },
  heroContent: { paddingHorizontal: 20, alignItems: 'center' },
  navButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  navButton: { alignItems: 'center', flex: 1 },
  navLabel: { marginTop: 8 },

  activityFeed: {
    flex: 1,
    backgroundColor: Colors.background_light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },

  userCardContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userCardLeft: { width: '50%', alignItems: 'center' },
  userCardRight: { width: '50%', justifyContent: 'center' },
  activityRow: { marginTop: 10 },

  activityBox: {
    backgroundColor: '#fff',
    marginHorizontal: '4%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },

  // spacing helpers
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
});
