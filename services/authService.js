import { auth, db } from "./firebaseConfig"
import { generateOTP, saveOTP, sendOTPEmail } from "./otpService"

// 🔥 FIREBASE AUTH - Registrar usuario con verificación por OTP
export const registerUserWithEmailVerification = async (email, password) => {
  let userCreated = false
  let userId = null

  try {
    console.log(`📝 Registrando usuario: ${email}`)

    // 1. Crear usuario en Firebase Auth primero (para validar que no existe)
    const userCredential = await auth.createUserWithEmailAndPassword(email, password)
    const user = userCredential.user
    userId = user.uid
    userCreated = true
    console.log(`✅ Usuario creado en Auth: ${user.uid}`)

    // 2. Guardar usuario en Firestore (sin verificar aún)
    await db.collection("users").doc(user.uid).set({
      email: email,
      emailVerified: false,
      createdAt: new Date(),
      isPremium: false,
    })
    console.log(`💾 Usuario guardado en Firestore`)

    // 3. Generar código OTP
    const otp = generateOTP()
    console.log(`🔑 OTP generado: ${otp}`)

    // 4. Guardar OTP en Firestore
    await saveOTP(email, otp)
    console.log(`💾 OTP guardado en Firestore`)

    // 5. Enviar OTP por email
    await sendOTPEmail(email, otp)
    console.log(`📧 Email OTP enviado a: ${email}`)

    // 6. NO cerrar sesión - mantener autenticado para navegar a OTPVerification
    // El usuario permanecerá autenticado pero con emailVerified: false
    console.log(`⚠️ Usuario autenticado pero SIN verificar. Debe ingresar código OTP.`)

    return {
      success: true,
      userId: user.uid,
      user: user,
      message: "Usuario creado. Código OTP enviado a tu email.",
    }
  } catch (error) {
    console.error("❌ Error en registro:", error)

    // Si creamos el usuario pero falló el envío del OTP, eliminarlo
    if (userCreated && userId && error.message && !error.code?.includes("auth/")) {
      try {
        console.log("🗑️ Limpiando usuario creado debido a error en envío de OTP...")
        // Intentar eliminar el usuario de Firestore
        await db.collection("users").doc(userId).delete()
      } catch (cleanupError) {
        console.error("❌ Error limpiando usuario:", cleanupError)
      }
    }

    throw error
  }
}

// Registrar nuevo usuario (legacy - mantener por compatibilidad)
export const registerUser = async (email, password) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await auth.signOut()
  } catch (error) {
    throw error
  }
}

// Escuchar cambios de autenticación
export const onAuthChange = (callback) => {
  return auth.onAuthStateChanged(callback)
}

// 🔥 FIREBASE AUTH - Verificar código OTP y completar registro
export const verifyOTPAndCompleteRegistration = async (email, password, otpCode) => {
  try {
    console.log(`🔍 Verificando OTP para: ${email}`)

    // 1. Importar función de verificación
    const { verifyOTP } = require("./otpService")

    // 2. Verificar el código OTP
    await verifyOTP(email, otpCode)
    console.log(`✅ OTP verificado correctamente`)

    // 3. Obtener el usuario actual (ya está autenticado desde el registro)
    const currentUser = auth.currentUser

    if (!currentUser) {
      // Si por alguna razón no hay usuario autenticado, iniciar sesión
      const credential = await auth.signInWithEmailAndPassword(email, password)
      console.log(`✅ Usuario autenticado: ${credential.user.uid}`)
    }

    // 4. Actualizar estado en Firestore
    const userId = currentUser ? currentUser.uid : (await auth.signInWithEmailAndPassword(email, password)).user.uid
    await db.collection("users").doc(userId).update({
      emailVerified: true,
    })

    console.log(`💾 Usuario marcado como verificado en Firestore`)
    console.log(`🎉 Verificación completada - Usuario puede acceder a la app`)

    return {
      verified: true,
      user: currentUser || auth.currentUser,
      message: "Email verificado exitosamente",
    }
  } catch (error) {
    console.error("❌ Error verificando OTP:", error)
    throw error
  }
}

// 🔥 FIREBASE AUTH - Reenviar código OTP
export const resendVerificationEmail = async (email, password) => {
  try {
    console.log(`🔄 Reenviando código OTP a: ${email}`)

    // 1. Generar nuevo código OTP
    const otp = generateOTP()
    console.log(`🔑 Nuevo OTP generado: ${otp}`)

    // 2. Guardar OTP en Firestore
    await saveOTP(email, otp)
    console.log(`💾 OTP guardado en Firestore`)

    // 3. Enviar OTP por email
    await sendOTPEmail(email, otp)
    console.log(`📧 Email OTP reenviado a: ${email}`)

    return {
      success: true,
      message: "Código OTP reenviado exitosamente.",
    }
  } catch (error) {
    console.error("❌ Error reenviando OTP:", error)
    throw error
  }
}

// 🔥 FIREBASE AUTH - Forzar verificación manual (para usuarios existentes con problemas)
export const forceVerifyUser = async (email) => {
  try {
    console.log(`🔧 Forzando verificación para usuario: ${email}`)

    // Buscar usuario en Firebase Auth por email
    const currentUser = auth.currentUser

    if (currentUser && currentUser.email === email) {
      // Actualizar estado en Firestore
      await db.collection("users").doc(currentUser.uid).update({
        emailVerified: true,
      })

      console.log(`✅ Usuario ${email} marcado como verificado manualmente`)

      return {
        success: true,
        message: "Usuario verificado exitosamente.",
      }
    } else {
      throw new Error("Usuario no encontrado o no está autenticado")
    }
  } catch (error) {
    console.error("❌ Error forzando verificación:", error)
    throw error
  }
}

// 🔥 FIREBASE AUTH - Restablecer contraseña (crear nueva cuenta temporal)
export const resetPassword = async (email, newPassword) => {
  try {
    console.log(`🔄 Preparando reset de contraseña para: ${email}`)

    // Buscar usuario en Firestore para validar que existe
    const usersSnapshot = await db.collection("users").where("email", "==", email).get()

    if (usersSnapshot.empty) {
      throw new Error("user-not-found")
    }

    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()

    // Guardar datos importantes del usuario antes de eliminarlo
    const userBackup = {
      email: userData.email,
      emailVerified: userData.emailVerified,
      isPremium: userData.isPremium,
      createdAt: userData.createdAt,
      preferences: userData.preferences || [],
    }

    console.log(`💾 Backup de datos del usuario creado`)

    // Guardar el backup y la nueva contraseña
    await db.collection("password_resets").doc(email).set({
      newPassword: newPassword,
      userId: userId,
      userBackup: userBackup,
      createdAt: new Date(),
      readyToApply: true,
    })

    console.log(`✅ Reset de contraseña preparado. El usuario puede iniciar sesión con la nueva contraseña.`)

    return {
      success: true,
      message: "Contraseña restablecida exitosamente",
    }
  } catch (error) {
    console.error("❌ Error restableciendo contraseña:", error)
    throw error
  }
}

// 🔥 FIREBASE AUTH - Aplicar reset de contraseña al hacer login
export const applyPasswordReset = async (email, password) => {
  try {
    console.log(`🔍 Verificando si hay reset de contraseña para: ${email}`)

    const resetDoc = await db.collection("password_resets").doc(email).get()

    if (!resetDoc.exists || !resetDoc.data().readyToApply) {
      console.log("⚠️ No hay reset pendiente")
      return null
    }

    const resetData = resetDoc.data()

    // Verificar si la contraseña ingresada es la nueva contraseña
    if (password !== resetData.newPassword) {
      console.log("⚠️ La contraseña ingresada no coincide con la nueva contraseña del reset")
      return null
    }

    console.log(`🔄 Aplicando reset de contraseña...`)

    // Obtener el usuario de Firebase Auth
    const currentUser = auth.currentUser

    if (currentUser) {
      // Si ya está autenticado (no debería pasar), actualizar contraseña
      await currentUser.updatePassword(resetData.newPassword)
    }

    // Restaurar datos del usuario en Firestore
    if (resetData.userBackup) {
      const usersSnapshot = await db.collection("users").where("email", "==", email).get()
      if (!usersSnapshot.empty) {
        const userId = usersSnapshot.docs[0].id
        await db.collection("users").doc(userId).update({
          emailVerified: resetData.userBackup.emailVerified,
          isPremium: resetData.userBackup.isPremium,
          preferences: resetData.userBackup.preferences || [],
        })
      }
    }

    // Marcar como aplicado
    await db.collection("password_resets").doc(email).update({
      readyToApply: false,
      applied: true,
      appliedAt: new Date(),
    })

    console.log(`✅ Reset de contraseña aplicado exitosamente`)

    return {
      success: true,
      message: "Contraseña actualizada correctamente",
    }
  } catch (error) {
    console.error("❌ Error aplicando reset:", error)
    return null
  }
}
