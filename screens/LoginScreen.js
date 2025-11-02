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
} from "react-native"
import { loginUser, applyPasswordReset } from "../services/authService"
import { db, auth } from "../services/firebaseConfig"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido")
      return
    }

    setLoading(true)
    try {
      // Intentar login normal primero
      console.log("🔐 Intentando inicio de sesión...")
      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      const user = userCredential.user

      console.log("✅ Login exitoso, verificando reset de contraseña...")

      // Después de login exitoso, verificar si hay un reset pendiente
      const resetDoc = await db.collection("password_resets").doc(email).get()

      if (resetDoc.exists && !resetDoc.data().applied) {
        const resetData = resetDoc.data()
        console.log("🔄 Aplicando reset de contraseña pendiente...")

        try {
          // Actualizar a la nueva contraseña
          await user.updatePassword(resetData.tempPassword)

          // Marcar como aplicado
          await db.collection("password_resets").doc(email).update({
            applied: true,
          })

          console.log("✅ Contraseña actualizada exitosamente")

          Alert.alert(
            "✅ Contraseña Actualizada",
            "Tu contraseña ha sido restablecida exitosamente.\n\nA partir de ahora, usa tu NUEVA contraseña para iniciar sesión.",
            [{ text: "Entendido" }]
          )
        } catch (updateError) {
          console.error("❌ Error actualizando contraseña:", updateError)
          // No bloquear el login si falla la actualización
          Alert.alert("Éxito", "Bienvenido a FindSpot")
        }
      } else {
        Alert.alert("Éxito", "Bienvenido a FindSpot")
      }
    } catch (error) {
      let errorMessage = "No se pudo iniciar sesión"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Email o contraseña incorrectos"
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FindSpot</Text>
        <Text style={styles.subtitle}>Encuentra tu restaurante perfecto</Text>

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
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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
  forgotPassword: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#999",
    fontSize: 14,
    textDecorationLine: "underline",
  },
})
