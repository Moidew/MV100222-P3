import { db } from "./firebaseConfig"
import axios from "axios"
import { Alert } from "react-native"
import { RESEND_API_KEY, RESEND_EMAIL_DOMAIN } from "@env"

// 🔧 CONFIGURACIÓN DE EMAIL
// ⚠️ MODO TEMPORAL: Mientras se verifica el dominio moiplataforms.org
const DEV_MODE = false // true = Muestra código en consola (NO envía emails)
                       // false = Envía emails reales

// 🔧 CONFIGURACIÓN DE DOMINIO
// Opciones:
// 1. "custom" - Usa tu dominio personalizado (requiere verificación DNS completa)
// 2. "resend" - Usa el dominio de Resend (solo envía a emails específicos en plan free)
const EMAIL_MODE = "custom" // Cambiar a "custom" cuando moiplataform.org esté verificado

// 📝 INSTRUCCIONES:
// 1. Mientras esperas la verificación del dominio:
//    - DEV_MODE = true → Los códigos OTP se muestran en la consola
//    - Puedes probar todo el flujo sin enviar emails reales
//
// 2. Cuando moiplataform.org esté verificado:
//    - Cambia DEV_MODE = false
//    - Ya está configurado EMAIL_MODE = "custom" para usar tu dominio

const EMAIL_CONFIG = {
  custom: {
    from: `FindSpot <noreply@${RESEND_EMAIL_DOMAIN}>`,
    description: "Dominio personalizado - Envía a cualquier email",
  },
  resend: {
    from: "FindSpot <onboarding@resend.dev>",
    description: "Dominio de Resend - Plan free limitado",
  },
}

// Generar código OTP de 6 dígitos
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Guardar OTP en Firestore
export const saveOTP = async (email, otp) => {
  try {
    await db.collection("otp_codes").doc(email).set({
      code: otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expira en 10 minutos
      verified: false,
    })
  } catch (error) {
    console.error("Error guardando OTP:", error)
    throw error
  }
}

// Verificar OTP
export const verifyOTP = async (email, code) => {
  try {
    console.log(`🔍 Buscando código OTP para: ${email}`)
    console.log(`🔑 Código ingresado: ${code} (tipo: ${typeof code})`)

    const docSnap = await db.collection("otp_codes").doc(email).get()

    if (!docSnap.exists) {
      console.error("❌ No se encontró código OTP en Firestore")
      throw new Error("Código no encontrado")
    }

    const data = docSnap.data()
    const now = new Date()

    console.log(`📦 Código almacenado: ${data.code} (tipo: ${typeof data.code})`)
    console.log(`⏰ Creado: ${data.createdAt.toDate()}`)
    console.log(`⏳ Expira: ${data.expiresAt.toDate()}`)
    console.log(`🕐 Ahora: ${now}`)
    console.log(`✅ Ya verificado: ${data.verified}`)

    // Verificar si el código expiró
    if (data.expiresAt.toDate() < now) {
      console.error("❌ Código expirado")
      throw new Error("Código expirado")
    }

    // Verificar si ya fue usado
    if (data.verified) {
      console.error("❌ Código ya usado")
      throw new Error("Código ya usado")
    }

    // Verificar si el código coincide (comparar como strings)
    const storedCode = String(data.code)
    const inputCode = String(code)

    console.log(`🔄 Comparando: "${storedCode}" === "${inputCode}"`)

    if (storedCode !== inputCode) {
      console.error(`❌ Código incorrecto. Esperado: ${storedCode}, Recibido: ${inputCode}`)
      throw new Error("Código incorrecto")
    }

    console.log("✅ Código válido! Marcando como verificado...")

    // Marcar como verificado
    await db.collection("otp_codes").doc(email).update({
      verified: true,
    })

    console.log("✅ Código marcado como verificado en Firestore")

    return true
  } catch (error) {
    console.error("❌ Error verificando OTP:", error.message)
    throw error
  }
}

// Enviar OTP por email usando Resend
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Enviando OTP a ${email}: ${otp}`)
    console.log(`📬 Modo de email: ${EMAIL_MODE} - ${EMAIL_CONFIG[EMAIL_MODE].description}`)

    // 🔧 MODO DEVELOPMENT - Simular envío sin usar Resend
    if (DEV_MODE) {
      console.log("⚠️ MODO DEV ACTIVO - Email NO enviado")
      console.log("═══════════════════════════════════════")
      console.log(`✅ OTP GENERADO PARA: ${email}`)
      console.log(`🔑 CÓDIGO: ${otp}`)
      console.log(`⏰ Válido por: 10 minutos`)
      console.log("═══════════════════════════════════════")
      console.log("💡 Para producción, cambiar DEV_MODE = false en otpService.js")

      // Simular delay como si enviara email
      await new Promise(resolve => setTimeout(resolve, 1000))

      return true
    }

    // Template HTML con estilo FindSpot
    const htmlContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 16px; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1)">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px">
            <h1 style="color: #FF6B35; font-size: 32px; font-weight: bold; margin: 0">FindSpot</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px">Encuentra tu restaurante perfecto</p>
          </div>

          <!-- Separador -->
          <div style="border-top: 2px solid #FF6B35; margin-bottom: 30px"></div>

          <!-- Contenido -->
          <p style="font-size: 16px; color: #333; line-height: 1.6">
            ¡Hola! 👋
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6">
            Tu código de verificación para <strong>FindSpot</strong> es:
          </p>

          <!-- Código OTP -->
          <div style="background-color: #FFF5F2; border: 2px solid #FF6B35; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0">
            <p style="font-size: 36px; font-weight: bold; color: #FF6B35; letter-spacing: 8px; margin: 0">
              ${otp}
            </p>
          </div>

          <!-- Información -->
          <p style="font-size: 14px; color: #666; line-height: 1.6">
            Este código es válido por <strong>10 minutos</strong>.
          </p>

          <!-- Advertencia -->
          <div style="background-color: #FFF8E1; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px">
            <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5">
              🔒 <strong>Importante:</strong> No compartas este código con nadie. Si no solicitaste este código, ignora este mensaje.
            </p>
          </div>

          <!-- Footer -->
          <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center">
            Gracias por usar FindSpot 🍽️
          </p>

          <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px">
            Este es un mensaje automático, por favor no respondas a este email.
          </p>
        </div>
      </div>
    `

    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: EMAIL_CONFIG[EMAIL_MODE].from,
        to: email,
        subject: "Tu código de verificación - FindSpot",
        html: htmlContent,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.status === 200) {
      console.log("✅ Email enviado correctamente")
      console.log("Email ID:", response.data.id)
      return true
    } else {
      throw new Error("Error al enviar email")
    }
  } catch (error) {
    console.error("❌ Error enviando email:", error)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
    }
    throw error
  }
}
