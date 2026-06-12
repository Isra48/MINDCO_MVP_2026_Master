import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import PrimaryButton from "../components/buttons/PrimaryButton";
import TextField from "../components/common/TextField";
import SkeletonBlock from "../components/common/SkeletonBlock";
import colors from "../constants/colors";
import { KeyboardAvoidingView, Platform } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import loginBg from "../../assets/images/Welcome.png";
import { useRegisterContentQuery } from "../services/content/register.queries";
import { signUpWithEmail, signInWithGoogle } from "../lib/supabase/auth";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    data: registerContent,
    isLoading: isRegisterContentLoading,
    isFetching: isRegisterContentFetching,
    isError: isRegisterContentError,
  } = useRegisterContentQuery();

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { needsConfirmation } = await signUpWithEmail(email, password);
      if (needsConfirmation) {
        // El proyecto exige confirmar el correo: no hay sesión todavía.
        Alert.alert(
          "Confirma tu correo",
          "Te enviamos un enlace de confirmación. Confírmalo e inicia sesión.",
          [{ text: "Ir a iniciar sesión", onPress: () => navigation.navigate("Login") }]
        );
      }
      // Si hay sesión, AuthContext muestra el onboarding/app automáticamente.
    } catch (error) {
      Alert.alert(
        "No se pudo registrar",
        error?.message || "Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        "Google",
        error?.message || "No se pudo continuar con Google."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const showRegisterSkeleton =
    !registerContent?.title &&
    (isRegisterContentLoading ||
      isRegisterContentFetching ||
      isRegisterContentError);
  const title = registerContent?.title || "Crear cuenta";
  const description =
    registerContent?.description || "Únete a nuestra comunidad MindCo";
  const backgroundMedia = registerContent?.backgroundMedia;
  const isVideoBackground =
    backgroundMedia?.type === "video" && backgroundMedia?.url;
  const backgroundSource = backgroundMedia?.url
    ? typeof backgroundMedia.url === "number"
      ? backgroundMedia.url
      : { uri: backgroundMedia.url }
    : loginBg;

  return (
    <View style={styles.heroContainer}>
      {isVideoBackground ? (
        <Video
          source={backgroundSource}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      ) : (
        <ImageBackground
          source={backgroundSource}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      <View style={styles.loginOverlay} />

      <ScrollView
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.loginWrapper}>
            {/* HEADER */}
            <View style={styles.loginHeader}>
              {showRegisterSkeleton ? (
                <>
                  <SkeletonBlock style={styles.loginTitleSkeleton} />
                  <SkeletonBlock style={styles.loginSubtitleSkeleton} />
                </>
              ) : (
                <>
                  <Text style={styles.heroTitle}>{title}</Text>
                  <Text style={styles.heroSubtitle}>{description}</Text>
                </>
              )}
            </View>

        {/* FORM */}
        <View style={styles.loginForm}>
          <TextField placeholder="Email" value={email} onChangeText={setEmail} />
          <TextField
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <PrimaryButton
            title="Registrar"
            onPress={handleRegister}
            loading={loading}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.8}
          >
            <AntDesign name="google" size={18} color={colors.darkText} />
            <Text style={styles.googleButtonText}>
              {googleLoading ? "Conectando…" : "Continuar con Google"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>

  );
}

const styles = StyleSheet.create({
  heroContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  loginContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  
  },
  loginHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 32
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
  },
  loginTitleSkeleton: {
    height: 40,
    borderRadius: 10,
    width: 180,
    marginBottom: 10,
  },
  loginSubtitleSkeleton: {
    height: 16,
    borderRadius: 8,
    width: 220,
  },
  loginForm: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  linkText: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600",
    marginTop: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.gray,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkText,
  },
});
