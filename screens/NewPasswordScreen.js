import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { resetPassword } from "../services/authService"

export default function NewPasswordScreen({ route, navigation }) {
  const { email } = route.params
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return false
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return false
    }

    return true
  }

  const handleResetPassword = async () => {
    if (!validatePassword()) return

    setLoading(true)
    try {
      console.log("🔄 Guardando nueva contraseña para:", email)

      await resetPassword(email, password)

      console.log("✅ Contraseña guardada exitosamente")

      setLoading(false)

      Alert.alert(
        "✅ Contraseña Actualizada",
        "Tu contraseña ha sido restablecida exitosamente.\n\nPara aplicar el cambio, por favor inicia sesión nuevamente con tu CONTRASEÑA ANTIGUA.\n\nDespués de iniciar sesión, el sistema actualizará automáticamente tu contraseña a la nueva.",
        [
          {
            text: "Ir a Inicio de Sesión",
            onPress: () => {
              // Navegar a Login y limpiar toda la pila de navegación
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            },
          },
        ]
      )
    } catch (error) {
      setLoading(false)
      console.error("❌ Error restableciendo contraseña:", error)

      let errorMessage = "No se pudo restablecer la contraseña"

      if (error.message.includes("user-not-found")) {
        errorMessage = "No existe una cuenta con este email"
      } else if (error.message.includes("too-many-requests")) {
        errorMessage = "Demasiados intentos. Intenta más tarde"
      }

      Alert.alert("Error", errorMessage)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        {/* Header con icono */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={60} color="#FF6B35" />
          </View>
        </View>

        <Text style={styles.title}>Nueva Contraseña</Text>

        <Text style={styles.subtitle}>
          Ingresa tu nueva contraseña para {"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* Input de nueva contraseña */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Input de confirmar contraseña */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Información de requisitos */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#666" />
          <Text style={styles.infoText}>La contraseña debe tener al menos 6 caracteres</Text>
        </View>

        {/* Botón de restablecer */}
        <TouchableOpacity
          style={[styles.button, (loading || !password || !confirmPassword) && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Restablecer Contraseña</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Volver */}
        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}
          style={styles.backContainer}
        >
          <Ionicons name="arrow-back" size={16} color="#999" />
          <Text style={styles.backLink}>Cancelar y volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE8D6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 20,
  },
  email: {
    fontWeight: "bold",
    color: "#FF6B35",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 25,
    gap: 8,
  },
  infoText: {
    color: "#666",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 5,
  },
  backLink: {
    color: "#999",
    fontSize: 14,
  },
})
