import { useState, useRef } from "react"
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
import { verifyOTPAndCompleteRegistration, resendVerificationEmail } from "../services/authService"

export default function OTPVerificationScreen({ route, navigation }) {
  const { email, password } = route.params
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  // Referencias para los inputs
  const inputRefs = useRef([])

  // Manejar cambio de texto en cada input
  const handleChangeText = (text, index) => {
    // Solo permitir números
    if (text && !/^\d+$/.test(text)) return

    const newOtp = [...otp]
    newOtp[index] = text

    setOtp(newOtp)

    // Auto-focus al siguiente input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Manejar borrado con backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Verificar código OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Por favor ingresa los 6 dígitos del código")
      return
    }

    setLoading(true)
    try {
      const result = await verifyOTPAndCompleteRegistration(email, password, otpCode)

      setLoading(false)

      if (result.verified) {
        console.log("🎉 Usuario verificado exitosamente!")
        // La navegación al Home será automática gracias al AuthContext
        // que detectará que ahora emailVerified = true
      }
    } catch (error) {
      setLoading(false)

      let errorMessage = "No se pudo verificar el código"

      if (error.message.includes("no encontrado")) {
        errorMessage = "Código no encontrado. Solicita un nuevo código."
      } else if (error.message.includes("expirado")) {
        errorMessage = "El código ha expirado. Solicita un nuevo código."
      } else if (error.message.includes("incorrecto")) {
        errorMessage = "Código incorrecto. Verifica e intenta de nuevo."
      } else if (error.message.includes("ya usado")) {
        errorMessage = "Este código ya fue usado. Solicita un nuevo código."
      }

      Alert.alert("Error", errorMessage)

      // Limpiar inputs en caso de error
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  }

  // Reenviar código OTP
  const handleResendOTP = async () => {
    setResending(true)
    try {
      await resendVerificationEmail(email, password)

      Alert.alert(
        "✅ Código Reenviado",
        `Hemos enviado un nuevo código de verificación a:\n\n${email}\n\nRevisa tu bandeja de entrada y spam.`
      )

      // Limpiar inputs
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error) {
      Alert.alert("Error", "No se pudo reenviar el código. Intenta de nuevo.")
    } finally {
      setResending(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        {/* Header con icono */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={60} color="#FF6B35" />
          </View>
        </View>

        <Text style={styles.title}>Verifica tu Email</Text>

        <Text style={styles.subtitle}>
          Ingresa el código de 6 dígitos que enviamos a:{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* Inputs para OTP */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Información */}
        <View style={styles.infoBox}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoText}>El código expira en 10 minutos</Text>
        </View>

        {/* Botón de verificar */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.some((digit) => !digit)}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Verificar Código</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Reenviar código */}
        <TouchableOpacity onPress={handleResendOTP} disabled={resending} style={styles.resendContainer}>
          {resending ? (
            <ActivityIndicator size="small" color="#FF6B35" />
          ) : (
            <Text style={styles.link}>¿No recibiste el código? Reenviar</Text>
          )}
        </TouchableOpacity>

        {/* Consejos */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Consejos:</Text>
          <Text style={styles.tipsText}>• Revisa tu carpeta de spam</Text>
          <Text style={styles.tipsText}>• El código tiene 6 dígitos</Text>
          <Text style={styles.tipsText}>• Solicita uno nuevo si expiró</Text>
        </View>

        {/* Volver */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backContainer}>
          <Ionicons name="arrow-back" size={16} color="#999" />
          <Text style={styles.backLink}>Volver atrás</Text>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#DDD",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    backgroundColor: "#FFF",
  },
  otpInputFilled: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF5F2",
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
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
    minHeight: 20,
  },
  link: {
    color: "#FF6B35",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  tipsBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B35",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    gap: 5,
  },
  backLink: {
    color: "#999",
    fontSize: 14,
  },
})
