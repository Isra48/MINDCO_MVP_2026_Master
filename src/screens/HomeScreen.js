import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import colors from "../constants/colors";
import { globalStyles } from "../styles/globalStyles";

import HeroCard from "../components/cards/HeroCard";
import ChallengeCard from "../components/cards/ChallengeCard";
import CategoryCard from "../components/cards/CategoryCard";
import DestinationCard from "../components/cards/DestinationCard";
import ClassInfoBottomSheet from "../components/common/ClassInfoBottomSheet";
import SkeletonBlock from "../components/common/SkeletonBlock";

import { useHeroClassQuery, useHomeClassesQuery } from "../services/content/classes.queries";
import { useEventsQuery } from "../services/content/events.queries";
import { useHomeContentQuery } from "../services/content/home.queries";
import { useMonthlyChallengeQuery } from "../services/content/challenge.queries";


import { useNotifications } from "../context/NotificationContext";

export default function HomeScreen() {
  const navigation = useNavigation();

  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [classList, setClassList] = useState([]);

  const {
    shouldShowPermissionPrompt,
    requestPermissions,
    markPromptSeen,
    scheduleClassNotifications,
    unreadCount,
  } = useNotifications();

  const {
    data: heroData,
    isLoading: isHeroLoading,
    isFetching: isHeroFetching,
    isError: isHeroError,
  } = useHeroClassQuery();
  const {
    data: homeClasses,
    isLoading: isHomeLoading,
    isFetching: isHomeFetching,
    isError: isHomeError,
    refetch,
  } = useHomeClassesQuery({ limit: 4 });
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isFetching: isEventsFetching,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useEventsQuery();
  const {
    data: homeContent,
    isLoading: isHomeContentLoading,
    isFetching: isHomeContentFetching,
    isError: isHomeContentError,
    refetch: refetchHomeContent,
  } = useHomeContentQuery();
  const { data: challenge, refetch: refetchChallenge } = useMonthlyChallengeQuery();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setFeatured(heroData || null);
    const list = homeClasses || [];
    const filtered = list.filter((item) => item.id !== heroData?.id);
    setClassList(filtered.length ? filtered : list);
  }, [heroData, homeClasses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        refetchEvents(),
        refetchHomeContent(),
        refetchChallenge(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchEvents, refetchHomeContent, refetchChallenge]);

  const showHeroSkeleton =
    !refreshing &&
    !heroData &&
    (isHeroLoading || isHeroFetching || isHeroError);
  const showListSkeleton =
    !refreshing &&
    !(homeClasses && homeClasses.length) &&
    (isHomeLoading || isHomeFetching || isHomeError);
  const showEventsSkeleton =
    !refreshing &&
    !(eventsData && eventsData.length) &&
    (isEventsLoading || isEventsFetching || isEventsError);
  const showCarouselTitleSkeleton =
    !refreshing &&
    !homeContent?.carouselTitle &&
    (isHomeContentLoading || isHomeContentFetching || isHomeContentError);
  const showListTitleSkeleton =
    !refreshing &&
    !homeContent?.listTitle &&
    (isHomeContentLoading || isHomeContentFetching || isHomeContentError);
  const shouldRenderListSection = classList.length > 0 || showListSkeleton;
  const eventsList = eventsData || [];
  const carouselTitle = homeContent?.carouselTitle || "Eventos presenciales";
  const listTitle = homeContent?.listTitle || "Próximas clases";

  

  /**
   * Mostrar modal de permisos de notificaciones
   */
  useEffect(() => {
    if (shouldShowPermissionPrompt) {
      setPermissionModalVisible(true);
    }
  }, [shouldShowPermissionPrompt]);

  /**
   * Agendar notificaciones para la clase destacada
   */
  useEffect(() => {
    if (featured) {
      scheduleClassNotifications(featured);
    }
  }, [featured, scheduleClassNotifications]);

  const handleEnableNotifications = async () => {
    setPermissionModalVisible(false);
    await requestPermissions();
  };

  const handleDismissPermission = () => {
    setPermissionModalVisible(false);
    markPromptSeen();
  };

  const openClassDetails = (classItem) => {
    if (!classItem) return;
    setSelectedClass(classItem);
  };

  const handleJoinLive = () => {
    Alert.alert(
      "Entrar a la clase",
      "Aquí se abrirá Zoom cuando la clase esté en vivo."
    );
  };

  const handleOpenChallenge = async (challengeItem) => {
    const url = challengeItem?.url;
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("Failed to open challenge link", error);
      }
    }
  };

  const handleOpenEventLink = async (eventItem) => {
    const url = eventItem?.link;
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("Failed to open event link", error);
      }
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.homeHeader}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileEditor")}
          activeOpacity={0.7}
        >
          <View style={styles.smallAvatar}>
            <Feather name="user" size={24} color="#000" />
          </View>
        </TouchableOpacity>

        <Text style={styles.homeTitle}>MindCo</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Notifications")}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View>
            <Feather name="bell" size={24} color="#000" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Challenge del mes (opcional) */}
      {challenge ? (
        <ChallengeCard item={challenge} onPress={handleOpenChallenge} />
      ) : null}

      {/* Hero */}
      {showHeroSkeleton ? (
        <View style={styles.heroSkeleton}>
          <SkeletonBlock style={styles.heroSkeletonImage} />
          <SkeletonBlock style={styles.heroSkeletonLine} />
          <SkeletonBlock style={styles.heroSkeletonLineShort} />
        </View>
      ) : (
        featured && (
        <HeroCard
          item={featured}
          onOpenDetails={openClassDetails}
          onJoinLive={handleJoinLive}
        />
        )
      )}

      {/* Categorías */}
      {showCarouselTitleSkeleton ? (
        <SkeletonBlock style={[styles.sectionTitleSkeleton, styles.sectionTitle]} />
      ) : (
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>
          {carouselTitle}
        </Text>
      )}

      {showEventsSkeleton ? (
        <FlatList
          horizontal
          data={Array.from({ length: 4 }, (_, index) => `event-skeleton-${index}`)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryListContent}
          renderItem={() => (
            <View style={styles.categorySkeletonCard}>
              <SkeletonBlock style={styles.categorySkeletonImage} />
              <SkeletonBlock style={styles.categorySkeletonLine} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <FlatList
          horizontal
          data={eventsList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryListContent}
          renderItem={({ item }) => (
            <CategoryCard item={item} onPress={() => handleOpenEventLink(item)} />
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* Próximas clases */}
      {shouldRenderListSection && (
        <>
          {showListTitleSkeleton ? (
            <SkeletonBlock style={[styles.sectionTitleSkeleton, styles.sectionTitle]} />
          ) : (
            <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>
              {listTitle}
            </Text>
          )}

          {showListSkeleton
            ? Array.from({ length: 4 }).map((_, index) => (
                <View key={`home-skeleton-${index}`} style={styles.listSkeletonCard}>
                  <SkeletonBlock style={styles.listSkeletonImage} />
                  <View style={styles.listSkeletonContent}>
                    <SkeletonBlock style={styles.listSkeletonLine} />
                    <SkeletonBlock style={styles.listSkeletonLineShort} />
                  </View>
                </View>
              ))
            : classList.map((item) => (
                <DestinationCard
                  key={item.id}
                  item={item}
                  onPress={() => openClassDetails(item)}
                />
              ))}
        </>
      )}


      {/* Modal permisos notificaciones */}
      <Modal transparent visible={permissionModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.permissionModal}>
            <Text style={styles.modalTitle}>Recibe recordatorios</Text>
            <Text style={styles.modalText}>
              Obtén notificaciones para no perder tus clases.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleDismissPermission}
              >
                <Text style={styles.secondaryText}>Ahora no</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleEnableNotifications}
              >
                <Text style={styles.primaryText}>Activar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom sheet */}
      <ClassInfoBottomSheet
        visible={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        classInfo={selectedClass}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 12,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: "400",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionTitleSkeleton: {
    height: 16,
    width: 180,
    borderRadius: 8,
  },
  categoryListContent: {
    paddingLeft: 16,
    paddingBottom: 12,
  },
  heroSkeleton: {
    marginHorizontal: 24,
    marginBottom: 20,
    height: 335,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
    justifyContent: "flex-end",
    padding: 16,
  },
  heroSkeletonImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSkeletonLine: {
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
    width: "70%",
  },
  heroSkeletonLineShort: {
    height: 12,
    borderRadius: 6,
    width: "45%",
  },
  categorySkeletonCard: {
    width: 140,
    height: 140,
    borderRadius: 14,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
    justifyContent: "flex-end",
    padding: 8,
  },
  categorySkeletonImage: {
    ...StyleSheet.absoluteFillObject,
  },
  categorySkeletonLine: {
    height: 12,
    borderRadius: 6,
    width: "70%",
  },
  listSkeletonCard: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
  },
  listSkeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  listSkeletonContent: { flex: 1 },
  listSkeletonLine: {
    height: 12,
    borderRadius: 6,
    width: "70%",
    marginBottom: 8,
  },
  listSkeletonLineShort: {
    height: 12,
    borderRadius: 6,
    width: "45%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionModal: {
    width: "82%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalText: {
    color: colors.gray,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 10,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  secondaryText: {
    color: colors.gray,
  },
});
