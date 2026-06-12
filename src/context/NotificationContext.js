import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../navigation/navigationRef";

const PUSH_ENABLED_KEY = "push_enabled";
const PROMPT_SEEN_KEY = "push_prompt_seen";
const PERMISSION_REQUESTED_KEY = "push_permission_requested";

// Historial local de notificaciones recibidas (no es información sensible y
// puede crecer como lista, por eso usamos AsyncStorage en vez de SecureStore).
const HISTORY_KEY = "notification_history";
const HISTORY_LIMIT = 100;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationContext = createContext(null);

const storeBoolean = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to persist", key, error);
  }
};

const getStoredBoolean = async (key, defaultValue) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn("Failed to read", key, error);
    return defaultValue;
  }
};

const getStoredHistory = async () => {
  try {
    const value = await AsyncStorage.getItem(HISTORY_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read notification history", error);
    return [];
  }
};

const persistHistory = async (history) => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("Failed to persist notification history", error);
  }
};

// Construye una entrada de historial a partir de una notificación recibida.
const buildHistoryEntry = (notification) => {
  const request = notification?.request ?? {};
  const content = request.content ?? {};
  return {
    id: `${request.identifier ?? "local"}-${new Date().getTime()}`,
    // Identificador real de la notificación: sirve para evitar duplicados
    // cuando una misma notificación se recibe (foreground) y luego se toca.
    notificationId: request.identifier ?? null,
    title: content.title || "Notificación",
    body: content.body || "",
    data: content.data ?? {},
    receivedAt: new Date().toISOString(),
    read: false,
  };
};

export function NotificationProvider({ children }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState("undetermined");
  const [promptSeen, setPromptSeen] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const scheduledClasses = useRef(new Set());

  useEffect(() => {
    const loadPreferences = async () => {
      const [storedPush, storedPromptSeen, storedRequested, storedHistory, permissions] =
        await Promise.all([
          getStoredBoolean(PUSH_ENABLED_KEY, true),
          getStoredBoolean(PROMPT_SEEN_KEY, false),
          getStoredBoolean(PERMISSION_REQUESTED_KEY, false),
          getStoredHistory(),
          Notifications.getPermissionsAsync(),
        ]);

      setPushEnabled(storedPush);
      setPromptSeen(storedPromptSeen);
      setPermissionRequested(storedRequested);
      setNotificationHistory(storedHistory);
      setPermissionStatus(permissions.status ?? "undetermined");
    };

    loadPreferences();
  }, []);

  // Guarda en el historial local cada notificación que se dispara mientras la
  // app está abierta (p. ej. los recordatorios de clase).
  const addToHistory = useCallback((notification) => {
    const entry = buildHistoryEntry(notification);
    setNotificationHistory((prev) => {
      // Evita duplicar una notificación ya registrada (recibida en foreground
      // y luego tocada, o tocada más de una vez).
      if (entry.notificationId && prev.some((item) => item.notificationId === entry.notificationId)) {
        return prev;
      }
      const next = [entry, ...prev].slice(0, HISTORY_LIMIT);
      persistHistory(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      addToHistory(notification);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Cubre el caso de notificaciones disparadas con la app cerrada/en
      // background: se registran cuando el usuario las toca.
      if (response?.notification) {
        addToHistory(response.notification);
      }
      if (navigationRef.isReady()) {
        navigationRef.navigate("Home");
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [addToHistory]);

  const removeNotification = useCallback((id) => {
    setNotificationHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistHistory(next);
      return next;
    });
  }, []);

  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    persistHistory([]);
  }, []);

  const markHistoryRead = useCallback(() => {
    setNotificationHistory((prev) => {
      if (!prev.some((item) => !item.read)) return prev;
      const next = prev.map((item) => (item.read ? item : { ...item, read: true }));
      persistHistory(next);
      return next;
    });
  }, []);

  const togglePushEnabled = useCallback(async (value) => {
    setPushEnabled(value);
    await storeBoolean(PUSH_ENABLED_KEY, value);

    if (!value) {
      scheduledClasses.current.clear();
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, []);

  const markPromptSeen = useCallback(async () => {
    setPromptSeen(true);
    await storeBoolean(PROMPT_SEEN_KEY, true);
  }, []);

  const markPermissionRequested = useCallback(async () => {
    setPermissionRequested(true);
    await storeBoolean(PERMISSION_REQUESTED_KEY, true);
  }, []);

  const requestPermissions = useCallback(async () => {
    await markPromptSeen();
    await markPermissionRequested();
    const result = await Notifications.requestPermissionsAsync();
    setPermissionStatus(result.status ?? "undetermined");
    return result.status;
  }, [markPermissionRequested, markPromptSeen]);

  const refreshPermissions = useCallback(async () => {
    const status = await Notifications.getPermissionsAsync();
    setPermissionStatus(status.status ?? "undetermined");
    return status.status;
  }, []);

  const scheduleClassNotifications = useCallback(
    async (classInfo) => {
      if (!pushEnabled || permissionStatus !== "granted" || !classInfo?.startDateTime) return;
      if (classInfo.modality && classInfo.modality.toLowerCase() !== "zoom") return;
      if (!classInfo.zoomLink) return;

      const startDate = new Date(classInfo.startDateTime);
      if (Number.isNaN(startDate.getTime()) || startDate <= new Date()) return;

      if (scheduledClasses.current.has(classInfo.id)) return;

      const content = {
        title: classInfo.title,
        body: classInfo.description || "Tu clase está por comenzar",
        data: { link: classInfo.zoomLink || "https://zoom.us/j/123456789" },
      };

      const triggers = [startDate];
      const thirtyMinutesBefore = new Date(startDate.getTime() - 30 * 60 * 1000);
      if (thirtyMinutesBefore > new Date()) {
        triggers.push(thirtyMinutesBefore);
      }

      await Promise.all(
        triggers.map((triggerDate) =>
          Notifications.scheduleNotificationAsync({
            content,
            trigger: triggerDate,
          })
        )
      );

      scheduledClasses.current.add(classInfo.id);
    },
    [permissionStatus, pushEnabled]
  );

  const cancelAllNotifications = useCallback(async () => {
    scheduledClasses.current.clear();
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const unreadCount = useMemo(
    () => notificationHistory.reduce((acc, item) => (item.read ? acc : acc + 1), 0),
    [notificationHistory]
  );

  const value = useMemo(
    () => ({
      pushEnabled,
      permissionStatus,
      promptSeen,
      permissionRequested,
      shouldShowPermissionPrompt: !promptSeen && permissionStatus === "undetermined",
      togglePushEnabled,
      markPromptSeen,
      requestPermissions,
      refreshPermissions,
      scheduleClassNotifications,
      cancelAllNotifications,
      notificationHistory,
      unreadCount,
      removeNotification,
      clearNotificationHistory,
      markHistoryRead,
    }),
    [
      cancelAllNotifications,
      clearNotificationHistory,
      markHistoryRead,
      markPromptSeen,
      notificationHistory,
      permissionRequested,
      permissionStatus,
      promptSeen,
      pushEnabled,
      refreshPermissions,
      removeNotification,
      requestPermissions,
      scheduleClassNotifications,
      togglePushEnabled,
      unreadCount,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
