import React, { useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  Easing,
  Dimensions,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import { Colors, Fonts } from '../utils/Constants';
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
  setState,
  state,
}) => {
  // Animations -----------------------------
  const cardAnim = useRef(new Animated.Value(animationsEnabled ? 0 : 1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  // ---------- Entrance Animation ----------
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 70,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [index]);

  // ---------- Expand Animation ----------
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 260,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  // ---------- Memoized File Filter ----------
  const profileImage = useMemo(() => {
    const filtered = item?.agri_files?.filter(f => f.term_type === '1');
    return filtered?.[0]?.file_path ?? null;
  }, [item?.agri_files]);

  // ---------- Memoized Plots Data ----------
  const plotData = useMemo(() => {
    return (
      item.agri_land_user_rels?.map(data => ({
        value: data.rel_id,
        label: data.plot_no,
      })) || []
    );
  }, [item.agri_land_user_rels]);

  // ---------- Memoized MENU Buttons ----------
  const menuButtons = useMemo(
    () =>
      MENU_ITEMS.map((menuItem, idx) => (
        <ModernMenuButton
          key={menuItem.key}
          item={menuItem}
          onPress={() => handleMenuPress(menuItem.key)}
          t={t}
          index={idx}
          isExpanded={isExpanded}
        />
      )),
    [t, isExpanded] // MENU_ITEMS static
  );

  // ---------- Callbacks ----------
  const handleMenuPress = useCallback(
    menuKey => {
      onMenuPress(menuKey, {
        farmeruserID: item.user_id,
        agri_land_user_rels: plotData,
        userName: item.userName,
        contactNumber: item.contactNumber,
        profileImage,
        gender: item.gender,
        farmer_type: item.farmer_type,
      });
    },
    [onMenuPress, plotData, item, profileImage]
  );

  const handleCardPress = useCallback(() => {
    onToggle(item.user_id);
    setState(prev => ({ ...prev, onPageLoad: true }));
  }, [item.user_id, onToggle, setState]);

  // ---------- Card Enter Style ----------
  const cardStyle =
    state.onPageLoad === false
      ? {
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
      }
      : null;

  return (
    <Animated.View style={[styles.modernUserCard, cardStyle]}>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9} style={styles.cardTouchable}>
        {/* ---------- Header ---------- */}
        <View style={styles.cardHeader}>
          <View style={styles.userAvatar}>
            {profileImage ? (
              <ImageForm
                source={profileImage}
                width={60}
                height={60}
                resizeMode="cover"
                borderRadius={30}
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
            <Text style={styles.dateText}>{item.CreateDateTime?.substring(0, 10)}</Text>
          </View>

          <View style={styles.cardActions}>
            <View style={styles.plotsBadge}>
              <Text style={styles.plotsCount}>{item.agri_land_user_rels?.length || 0}</Text>
              <Text style={styles.plotsLabel}>{t('plots')}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ---------- Expandable Menu ---------- */}
      <Animated.View
        style={[
          styles.menuPositionContainer,
          {
            height: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            opacity: expandAnim,
            borderTopWidth: isExpanded ? 1.5 : 0,
            borderColor: Colors.border,
          },
        ]}>
        <View style={styles.modernMenuContainer}>{menuButtons}</View>
      </Animated.View>
    </Animated.View>
  );
};

export default memo(ModernUserCard);

/* --------------------------------- STYLES --------------------------------- */

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
  },

  plotsCount: {
    fontSize: 15,
    color: Colors.borderGreen,
    fontFamily: Fonts.SemiBold,
    marginRight: 4,
  },
  plotsLabel: {
    fontSize: 10,
    color: Colors.borderGreen,
    fontFamily: Fonts.Medium,
  },

  menuPositionContainer: {
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  modernMenuContainer: {
    height: 120,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};
