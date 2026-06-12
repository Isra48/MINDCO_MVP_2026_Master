import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../../constants/colors";

/**
 * Card del "Challenge del mes". Diseño limpio: icono + texto a la izquierda y
 * un chevron a la derecha. Entra con animación sutil (fade + slide-up +
 * escala). Al tocar, dispara `onPress` para abrir el reto en una web externa.
 */
export default function ChallengeCard({ item, onPress }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay: 120,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  if (!item) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPress?.(item)}
      >
        <View style={styles.iconBadge}>
          <Feather name={item.icon || "target"} size={22} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>{item.badge || "Challenge del mes"}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.progressLabel ? (
            <Text style={styles.progressLabel} numberOfLines={1}>
              {item.progressLabel}
            </Text>
          ) : null}
        </View>

        <Feather name="chevron-right" size={22} color={colors.gray} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    // sombra suave, difusa y discreta
    shadowColor: "#1a1a2e",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(193,122,76,0.12)", // primary @ 12%
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: "600",
    marginBottom: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkText,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
});
