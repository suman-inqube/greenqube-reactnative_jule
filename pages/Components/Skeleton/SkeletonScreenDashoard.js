import React, {Suspense, lazy, useState, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Skeleton from './index';
import {MotiView} from 'moti';
import {Colors} from '../../utils/Constants';
const SkeletonScreenDashoard = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#003c04" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MotiView
            from={{opacity: 0.3}}
            animate={{opacity: 1}}
            transition={{type: 'timing', duration: 800, loop: true}}>
            <View style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </View>
          </MotiView>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Text style={styles.wheatIcon}>🌾</Text>
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoText}>green</Text>
                <Text style={styles.logoSubText}>Qube</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerIcons}>
            <MotiView
              from={{opacity: 0.4}}
              animate={{opacity: 1}}
              transition={{type: 'timing', duration: 900, loop: true}}>
              <View style={styles.iconButton}>
                <Skeleton height={16} width="75%" borderRadius={4} />
              </View>
            </MotiView>
            <MotiView
              from={{opacity: 0.4}}
              animate={{opacity: 1}}
              transition={{type: 'timing', duration: 1100, loop: true}}>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>⋯</Text>
              </View>
            </MotiView>
          </View>
        </View>
      </View>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            {/* <Skeleton height={20} width="90%" borderRadius={4} /> */}
            <View style={styles.navButtons}>
              {[1, 2, 3].map(item => (
                <View key={item} style={styles.navButton}>
                  <View style={styles.navIconContainer}>
                    <Skeleton height={50} width={50} borderRadius={25} />
                  </View>
                  <View style={styles.navButtonTextContainer}>
                    <Skeleton height={10} width={60} borderRadius={12} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      {/* Activity Feed */}
      <ScrollView
        style={styles.activityFeed}
        showsVerticalScrollIndicator={false}>
        <View style={styles.userCardContainer}>
          <View
            style={{
              width: '50%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Skeleton height={100} width={100} borderRadius={50} />
            {/* <View style={{ marginTop: 12 }} /> */}
            <Skeleton height={10} width="80%" borderRadius={50} />
            <Skeleton
              height={10}
              width="50%"
              borderRadius={4}
              style={{marginTop: 6}}
            />
          </View>
          <View style={{width: '50%', justifyContent: 'center'}}>
            {/* <View style={{ marginTop: 12 }} /> */}
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.activityRow}>
                <Skeleton height={10} width="80%" borderRadius={50} />
                <Skeleton
                  height={10}
                  width="50%"
                  borderRadius={4}
                  style={{marginTop: 6}}
                />
                {index !== 2 && (
                  <Skeleton height={1} width="100%" borderRadius={4} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: '4%',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 16,
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              borderRadius: 50,
              backgroundColor: Colors.background,
              overflow: 'hidden',
              alignSelf: 'flex-end',
              overflow: 'hidden',
            }}>
            <Skeleton height={30} width={70} borderRadius={20} />
            <Skeleton height={30} width={70} borderRadius={20} />
          </View>
          <View style={{justifyContent: 'center'}}>
            {/* <View style={{ marginTop: 12 }} /> */}
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.activityRow}>
                <Skeleton height={10} width="80%" borderRadius={50} />
                <Skeleton
                  height={10}
                  width="50%"
                  borderRadius={4}
                  style={{marginTop: 6}}
                />
                {index !== 2 && (
                  <Skeleton height={1} width="100%" borderRadius={4} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#003c04',
    paddingTop: 0,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  leftStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  networkText: {
    color: 'white',
    fontSize: 12,
    marginRight: 8,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusIcon: {
    fontSize: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 8,
  },
  wheatIcon: {
    fontSize: 20,
  },
  logoTextContainer: {
    flexDirection: 'row',
  },
  logoText: {
    color: '#FFA726',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubText: {
    color: '#FFA726',
    fontSize: 18,
    fontWeight: '300',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  heroSection: {
    height: 180,
    backgroundColor: '#003c04',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    // marginTop: 30,
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
  },
  navIconContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navIcon: {
    fontSize: 20,
  },
  navButtonTextContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityRow: {
    marginTop: 10,
  },

  tabRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default memo(SkeletonScreenDashoard);
