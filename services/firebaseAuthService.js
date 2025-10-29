import { auth } from "./firebaseConfig"
import { db } from "./firebaseConfig"

/**
 * 🔥 FIREBASE AUTHENTICATION - Sistema de OTP automático
 *
 * VENTAJAS:
 * ✅ Completamente GRATIS
 * ✅ Envía a CUALQUIER email
 * ✅ NO requiere configuración SMTP
 * ✅ Google maneja el envío de emails
 * ✅ Más seguro
 * ✅ Ilimitado
 */

/**
 * Enviar email de verificación usando Firebase Auth
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña temporal
 */
export const sendVerificationEmailFirebase = async (email, password) => {
  try {
    console.log(`📧 Enviando verificación Firebase a ${email}`)

    // 1. Crear usuario temporal en Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password)
    const user = userCredential.user

    // 2. Enviar email de verificación (automático de Firebase)
    await user.sendEmailVerification({
      url: "https://findspot.app/verified", // URL de redirección (opcional)
      handleCodeInApp: false,
    })

    console.log("✅ Email de verificación enviado por Firebase")

    // 3. Guardar usuario en Firestore (sin verificar aún)
    await db.collection("users").doc(user.uid).set({
      email: email,
      emailVerified: false,
      createdAt: new Date(),
      isPremium: false,
    })

    // 4. Cerrar sesión (usuario debe verificar primero)
    await auth.signOut()

    return {
      success: true,
      userId: user.uid,
      message: "Email de verificación enviado. Revisa tu bandeja de entrada.",
    }
  } catch (error) {
    console.error("❌ Error enviando verificación Firebase:", error)

    // Si el usuario ya existe, intentar reenviar
    if (error.code === "auth/email-already-in-use") {
      try {
        // Iniciar sesión y reenviar
        const credential = await auth.signInWithEmailAndPassword(email, password)
        await credential.user.sendEmailVerification()
        await auth.signOut()

        return {
          success: true,
          message: "Email de verificación reenviado.",
        }
      } catch (resendError) {
        throw resendError
      }
    }

    throw error
  }
}

/**
 * Verificar si el email fue confirmado
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 */
export const checkEmailVerified = async (email, password) => {
  try {
    // Iniciar sesión para verificar estado
    const credential = await auth.signInWithEmailAndPassword(email, password)
    await credential.user.reload() // Refrescar estado

    if (credential.user.emailVerified) {
      // Actualizar Firestore
      await db.collection("users").doc(credential.user.uid).update({
        emailVerified: true,
      })

      console.log("✅ Email verificado correctamente")
      return {
        verified: true,
        user: credential.user,
      }
    } else {
      await auth.signOut()
      return {
        verified: false,
        message: "Email aún no verificado. Revisa tu bandeja de entrada.",
      }
    }
  } catch (error) {
    console.error("❌ Error verificando email:", error)
    throw error
  }
}

/**
 * Reenviar email de verificación
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 */
export const resendVerificationEmail = async (email, password) => {
  try {
    const credential = await auth.signInWithEmailAndPassword(email, password)
    await credential.user.sendEmailVerification()
    await auth.signOut()

    console.log("✅ Email de verificación reenviado")
    return {
      success: true,
      message: "Email de verificación reenviado.",
    }
  } catch (error) {
    console.error("❌ Error reenviando verificación:", error)
    throw error
  }
}
