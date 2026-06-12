import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

import colors from "../constants/colors";
import { useNotifications } from "../context/NotificationContext";
import { formatDateLabel, formatTimeLabel } from "../utils/dateFormatting";

function NotificationRow({ item, onDelete }) {
  const swipeableRef = useRef(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      activeOpacity={0.8}
      onPress={() => {
        swipeableRef.current?.close();
        onDelete(item.id);
      }}
    >
      <Feather name="trash-2" size={22} color={colors.white} />
      <Text style={styles.deleteText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const dateLabel = formatDateLabel(item.receivedAt);
  const timeLabel = formatTimeLabel(item.receivedAt);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
          <Feather name="bell" size={20} color={colors.primary} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!!item.body && (
            <Text style={styles.rowBody} numberOfLines={2}>
              {item.body}
            </Text>
          )}
          {(dateLabel || timeLabel) && (
            <Text style={styles.rowDate}>
              {[dateLabel, timeLabel].filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </Swipeable>
  );
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const {
    notificationHistory,
    removeNotification,
    clearNotificationHistory,
    markHistoryRead,
  } = useNotifications();

  // Al abrir la pantalla se marcan como leídas para limpiar el badge.
  useEffect(() => {
    markHistoryRead();
  }, [markHistoryRead]);

  const isEmpty = notificationHistory.length === 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="chevron-left" size={26} color={colors.darkText} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificaciones</Text>

        {isEmpty ? (
          <View style={styles.headerButton} />
        ) : (
          <TouchableOpacity
            onPress={clearNotificationHistory}
            activeOpacity={0.7}
            style={styles.headerButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>Borrar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Feather name="bell-off" size={48} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Aquí verás los recordatorios de tus clases.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificationHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow item={item} onDelete={removeNotification} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 12,
  },
  headerButton: {
    minWidth: 72,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkText,
  },
  clearText: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "right",
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginLeft: 72,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleUnread: {
    backgroundColor: "#F4E3D6",
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkText,
    marginBottom: 2,
  },
  rowBody: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 4,
  },
  rowDate: {
    fontSize: 12,
    color: colors.placeholderText,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  deleteAction: {
    backgroundColor: "#E5484D",
    justifyContent: "center",
    alignItems: "center",
    width: 96,
  },
  deleteText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkText,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginTop: 6,
  },
});
