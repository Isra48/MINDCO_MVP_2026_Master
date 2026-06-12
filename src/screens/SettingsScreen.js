import React, { useState } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import colors from "../constants/colors";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function SettingsScreen() {
  const [email, setEmail] = useState(false);
  const { pushEnabled, togglePushEnabled, refreshPermissions, cancelAllNotifications } = useNotifications();
  const { signOut } = useAuth();

  const logout = async () => {
    // Al cerrar sesión, la sesión de Supabase se limpia y la navegación
    // (AuthContext) vuelve a la pantalla de Login automáticamente.
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", error?.message || "No se pudo cerrar sesión.");
    }
  };

  const handlePushToggle = async (value) => {
    if (value) {
      const status = await refreshPermissions();
      if (status === "denied") {
        Alert.alert(
          "Permiso requerido",
          "Activa las notificaciones en los ajustes del sistema para continuar.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      await togglePushEnabled(true);
    } else {
      await togglePushEnabled(false);
      await cancelAllNotifications();
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.screenHeader}>
        <Text style={globalStyles.screenTitle}>Ajustes</Text>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <Text>Notificaciones Push</Text>
          <Switch value={pushEnabled} onValueChange={handlePushToggle} />
        </View>

        <View style={styles.settingItem}>
          <Text>Notificaciones por Email</Text>
          <Switch value={email} onValueChange={setEmail} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settingsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
