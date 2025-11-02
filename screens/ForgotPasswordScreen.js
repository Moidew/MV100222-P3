import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { generateOTP, saveOTP, sendOTPEmail } from "../services/otpService"

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu email")
      return
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido")
      return
    }

    setLoading(true)
    try {
      console.log("📧 Enviando código de recuperación a:", email)

      // Generar y enviar OTP
      const otp = generateOTP()
      await saveOTP(email, otp)
      await sendOTPEmail(email, otp)

      console.log("✅ Código enviado exitosamente")

      setLoading(false)

      // Navegar a pantalla de verificación OTP
      navigation.navigate("ResetPasswordOTP", { email })
    } catch (error) {
      setLoading(false)
      console.error("❌ Error enviando código:", error)
      Alert.alert("Error", "No se pudo enviar el código. Verifica tu email e intenta de nuevo.")
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        {/* Header con icono */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={60} color="#FF6B35" />
          </View>
        </View>

        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

        <Text style={styles.subtitle}>
          No te preocupes. Ingresa tu email y te enviaremos un código de verificación para restablecer tu contraseña.
        </Text>

        {/* Input de email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Botón de enviar */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="mail" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Enviar código</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Información adicional */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            Te enviaremos un código de 6 dígitos a tu email. El código expira en 10 minutos.
          </Text>
        </View>

        {/* Volver a login */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backContainer}>
          <Ionicons name="arrow-back" size={16} color="#999" />
          <Text style={styles.backLink}>Volver al inicio de sesión</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
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
