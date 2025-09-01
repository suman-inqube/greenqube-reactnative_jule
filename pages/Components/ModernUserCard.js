import React, { useRef, useEffect, useCallback, memo } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  Easing,
  Dimensions,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import { Colors,Fonts } from '../utils/Constants';
import { MENU_ITEMS } from '../utils/dashboardItems';
import ModernMenuButton from './ModernMenuButton';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ModernUserCard = ({
  item,
  isExpanded,
  onToggle,
  onMenuPress,
  t,
  index,
  animationsEnabled,
  expandedItem,
  setState,
  state,
}) => {
  const cardAnim = useRef(
    new Animated.Value(animationsEnabled ? 0 : 1),
  ).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.spring(cardAnim, {
      toValue: 1,
      delay,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  const handleMenuPress = useCallback(
    menuKey => {
      const plotData =
        item.agri_land_user_rels?.map(data => ({
          value: data.rel_id,
          label: data.plot_no,
        })) || [];
      const filePath = item.agri_files?.[0]?.file_path || '';
      onMenuPress(menuKey, {
        farmeruserID: item.user_id,
        agri_land_user_rels: plotData,
        userName: item.userName,
        contactNumber: item.contactNumber,
        profileImage: filePath,
        gender: item.gender,
        farmer_type: item.farmer_type,
      });
    },
    [item, onMenuPress],
  );

  const handleCardPress = useCallback(() => {
    onToggle(item.user_id);
    setState(prev => ({ ...prev, onPageLoad: true }));
  }, [onToggle, item.user_id, setState]);

  const cardStyle =
    state.onPageLoad == false
      ? [
          styles.modernUserCard,
          {
            opacity: cardAnim,
            transform: [
              { scale: cardAnim },
              {
                translateX: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_WIDTH * 0.3, 0],
                }),
              },
            ],
          },
        ]
      : [styles.modernUserCard];

  return (
    <Animated.View style={cardStyle}>
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.95}
        style={styles.cardTouchable}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.userAvatar}>
            {item.agri_files.length > 0 ? (
              <ImageForm
                source={item.agri_files[0].file_path}
                width={60}
                height={60}
                resizeMode="cover"
                borderRadius={30}
                style={{
                  backgroundColor: '#ccc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              />
            ) : (
              <Text style={styles.avatarText}>
                {item.userName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.modernUserName} numberOfLines={1}>
              {item.userName}
            </Text>
            <Text style={styles.phoneText}>{item.contactNumber}</Text>
            <Text style={styles.dateText}>
              {item.CreateDateTime?.substring(0, 10)}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <View style={styles.plotsBadge}>
              <Text style={styles.plotsCount}>
                {item.agri_land_user_rels?.length || 0}
              </Text>
              <Text style={styles.plotsLabel}>{t('plots')}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expandable menu */}
      <View
        style={[
          styles.menuPositionContainer,
          {
            height: isExpanded ? 120 : 0,
            borderTopWidth: isExpanded ? 1.5 : 0,
            borderColor: Colors.border,
            borderStyle: 'dotted',
          },
        ]}>
        <Animated.View
          style={[
            styles.modernMenuContainer,
            {
              opacity: expandAnim,
              transform: [
                {
                  translateY: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-120, 0],
                  }),
                },
                {
                  scaleY: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.modernMenuGrid}>
            {MENU_ITEMS.map((menuItem, menuIndex) => (
              <ModernMenuButton
                key={menuItem.key}
                item={menuItem}
                onPress={handleMenuPress}
                t={t}
                index={menuIndex}
                isExpanded={isExpanded}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default memo(ModernUserCard);

const styles = {
  modernUserCard: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardTouchable: { padding: 0 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Fonts.Bold,
  },
  userDetails: { flex: 1 },
  modernUserName: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
    fontFamily: Fonts.Medium,
  },
  phoneText: { fontSize: 14, color: Colors.lightText, fontFamily: Fonts.Medium },
  dateText: { fontSize: 12, color: Colors.lightText, fontFamily: Fonts.Medium },
  cardActions: { alignItems: 'center' },
  plotsBadge: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plotsCount: {
    fontSize: 15,
    color: Colors.borderGreen,
    fontFamily: Fonts.SemiBold,
    marginRight: 4,
  },
  plotsLabel: { fontSize: 10, color: Colors.borderGreen, fontFamily: Fonts.Medium },
  menuPositionContainer: { overflow: 'hidden', backgroundColor: Colors.background },
  modernMenuContainer: { height: 120, backgroundColor: Colors.background },
  modernMenuGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
};
