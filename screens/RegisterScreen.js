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
  ScrollView,
} from "react-native"
import { registerUserWithEmailVerification } from "../services/authService"

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const handleRegister = async () => {
    // Validar campos vacíos
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido")
      return
    }

    // Validar longitud de contraseña
    if (!validatePassword(password)) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      console.log("📝 Iniciando registro para:", email)
      console.log("🔍 Navigation object:", navigation)
      console.log("🔍 Routes disponibles:", navigation.getState())

      // 🔥 Registrar usuario con Firebase Auth y enviar código OTP
      const result = await registerUserWithEmailVerification(email, password)

      console.log("✅ Registro exitoso:", result)

      setLoading(false)

      console.log("🚀 Navegando a OTPVerification...")

      // Usar setTimeout para asegurar que la navegación se complete antes de cualquier interferencia
      setTimeout(() => {
        navigation.navigate("OTPVerification", {
          email: email,
          password: password,
        })
        console.log("✅ Navegación a OTPVerification completada")
      }, 100)
    } catch (error) {
      setLoading(false)

      console.error("❌ Error en registro:", error)

      let errorMessage = "No se pudo crear la cuenta"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado. Intenta iniciar sesión."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet."
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert("Error al Registrarse", errorMessage)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>FindSpot</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#FF6B35",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
})
