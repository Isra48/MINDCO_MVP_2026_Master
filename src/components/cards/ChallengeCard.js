import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../../constants/colors";

/**
 * Card del "Challenge del mes". Compacta (≈ tamaño de las cards de clase),
 * con imagen de fondo y entrada animada (fade + slide-up + escala sutil).
 * Al tocar, dispara `onPress` para abrir el reto en una página externa.
 */
export default function ChallengeCard({ item, onPress }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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

  const hasImage = typeof item.image === "string" && item.image.length > 0;

  return (
    <Animated.View
      style={[styles.wrapper, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
      >
        {hasImage ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.imageFallback]} />
        )}

        <View style={styles.overlay}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.emoji ? `${item.emoji} ` : ""}
                {item.badge || "Challenge del mes"}
              </Text>
            </View>
            <View style={styles.linkIcon}>
              <Feather name="arrow-up-right" size={16} color={colors.white} />
            </View>
          </View>

          <View>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginBottom: 16,
  },
  card: {
    height: 128,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageFallback: {
    backgroundColor: colors.secondary,
  },
  overlay: {
    flex: 1,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  linkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.white,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
  },
});
