import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Pressable,
  Appearance,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TextField from "../components/common/TextField";
import PrimaryButton from "../components/buttons/PrimaryButton";
import colors from "../constants/colors";
import { getUser, setUser } from "../utils/storage";
import { globalStyles } from "../styles/globalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";
import PhoneInput from "react-native-phone-number-input";
import { Feather } from "@expo/vector-icons";

// ID del accesorio de teclado (iOS) para poder colapsarlo con un botón "Listo".
const KEYBOARD_ACCESSORY_ID = "profileKeyboardAccessory";

export default function ProfileEditorScreen({ navigation }) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);

  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔒 Forzar Light Mode SOLO en esta pantalla
  useEffect(() => {
    const originalScheme = Appearance.getColorScheme();
    Appearance.setColorScheme("light");

    return () => {
      Appearance.setColorScheme(originalScheme);
    };
  }, []);

  // Precargar datos existentes del usuario (incluida la foto).
  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) return;
      setName(user.name || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setPhone(user.phoneLocal || "");
      setFormattedPhone(user.phone || "");
      setAvatarUri(user.avatar || null);
      if (user.birthDate) {
        const parsed = new Date(user.birthDate);
        if (!Number.isNaN(parsed.getTime())) setBirthDate(parsed);
      }
    })();
  }, []);

  const openDatePicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };
  const closeDatePicker = () => setShowDatePicker(false);

  const onChangeDate = (_, selectedDate) => {
    if (Platform.OS === "android") {
      closeDatePicker();
    }

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Selección de foto: galería o cámara. Funciona sin backend (uri local).
  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Concede acceso a tus fotos para elegir una imagen."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Concede acceso a la cámara para tomar una foto."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onChangePhoto = () => {
    Keyboard.dismiss();
    const options = [
      { text: "Elegir de la galería", onPress: pickFromLibrary },
      { text: "Tomar foto", onPress: takePhoto },
    ];
    if (avatarUri) {
      options.push({
        text: "Quitar foto",
        style: "destructive",
        onPress: () => setAvatarUri(null),
      });
    }
    options.push({ text: "Cancelar", style: "cancel" });
    Alert.alert("Foto de perfil", "¿Qué deseas hacer?", options);
  };

  const save = async () => {
    if (!name || !lastName || !username || !birthDate || !phone) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (!formattedPhone || !phoneInputRef.current?.isValidNumber(phone)) {
      Alert.alert("Número inválido", "Ingresa un número de WhatsApp válido");
      return;
    }

    setLoading(true);
    const user = (await getUser()) || {};

    await setUser({
      ...user,
      name,
      lastName,
      username,
      birthDate,
      phone: formattedPhone,
      phoneLocal: phone,
      avatar: avatarUri,
    });

    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const formattedBirthDate = birthDate
    ? birthDate.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "";

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Completa tu perfil</Text>
          <Text style={styles.profileSubtitle}>
            Esto nos ayudará a personalizar tu experiencia
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={onChangePhoto} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={52} color="#6f6e6e" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onChangePhoto}>
            <Text style={styles.changePhotoLink}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TextField
            placeholder="Nombre o nombres"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            inputAccessoryViewID={KEYBOARD_ACCESSORY_ID}
          />

          <TextField
            placeholder="Apellidos"
            value={lastName}
            onChangeText={setLastName}
            returnKeyType="next"
            inputAccessoryViewID={KEYBOARD_ACCESSORY_ID}
          />

          <TextField
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="done"
            inputAccessoryViewID={KEYBOARD_ACCESSORY_ID}
          />

          <View style={styles.phoneContainer}>
            <PhoneInput
              ref={phoneInputRef}
              defaultCode="MX"
              layout="first"
              value={phone}
              onChangeText={setPhone}
              onChangeFormattedText={setFormattedPhone}
              containerStyle={styles.phoneInputContainer}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.phoneText}
              codeTextStyle={styles.phoneCodeText}
              flagButtonStyle={styles.flagButton}
              textInputProps={{
                keyboardType: "number-pad",
                placeholder: "Número de WhatsApp",
                inputAccessoryViewID: KEYBOARD_ACCESSORY_ID,
              }}
            />
          </View>

          <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8}>
            <TextField
              placeholder="Fecha de nacimiento"
              value={formattedBirthDate}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* ANDROID */}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={birthDate || new Date(2000, 0, 1)}
              mode="date"
              maximumDate={maxDate}
              onChange={onChangeDate}
              textColor={colors.darkText}
              themeVariant="light"
            />
          )}

          {/* iOS */}
          {Platform.OS === "ios" && (
            <Modal
              transparent
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={closeDatePicker}
            >
              <View style={styles.modalOverlay}>
                <Pressable style={styles.backdrop} onPress={closeDatePicker} />

                <View style={styles.iosPickerContainer}>
                  <DateTimePicker
                    value={birthDate || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={maxDate}
                    onChange={onChangeDate}
                    textColor={colors.darkText}
                    themeVariant="light"
                    style={styles.iosPicker}
                  />

                  <TouchableOpacity
                    style={styles.iosPickerDone}
                    onPress={closeDatePicker}
                  >
                    <Text style={styles.iosPickerDoneText}>Listo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <PrimaryButton title="Guardar" onPress={save} loading={loading} />
        </View>
      </ScrollView>

      {/* Botón "Listo" sobre el teclado (iOS) para colapsarlo. */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <Text style={styles.accessoryText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.darkText,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.gray,
    paddingTop: 4,
  },

  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
  },
  changePhotoLink: {
    marginTop: 12,
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  phoneContainer: {
    marginBottom: 16,
  },
  phoneInputContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FFFFFF", // fijo
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  phoneTextContainer: {
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 16,
    color: colors.darkText,
  },
  phoneCodeText: {
    fontSize: 16,
    color: colors.darkText,
  },
  flagButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF", // fijo
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iosPicker: {
    width: "100%",
    alignSelf: "stretch",
  },
  iosPickerDone: {
    alignItems: "center",
    paddingVertical: 10,
  },
  iosPickerDoneText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },

  accessory: {
    backgroundColor: "#F2F2F7",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C7C7CC",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accessoryText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
});
