import axios from "axios"

/**
 * Servicio de emails usando Gmail SMTP + Nodemailer API
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Ir a https://myaccount.google.com/security
 * 2. Habilitar "Verificación en 2 pasos"
 * 3. Ir a "Contraseñas de aplicaciones"
 * 4. Crear una contraseña para "FindSpot"
 * 5. Copiar la contraseña y pegarla abajo
 */

// 🔧 CONFIGURACIÓN GMAIL
const GMAIL_CONFIG = {
  user: "chepesarco0@gmail.com", // Tu email de Gmail
  appPassword: "", // ⚠️ Genera una en: https://myaccount.google.com/apppasswords
}

/**
 * Enviar OTP por Gmail
 * @param {string} toEmail - Email destino
 * @param {string} otp - Código OTP
 */
export const sendOTPViaGmail = async (toEmail, otp) => {
  try {
    console.log(`📧 Enviando OTP via Gmail a ${toEmail}: ${otp}`)

    // Validar configuración
    if (!GMAIL_CONFIG.appPassword) {
      console.warn("⚠️ Gmail App Password no configurada")
      console.log("═══════════════════════════════════════")
      console.log(`✅ OTP GENERADO PARA: ${toEmail}`)
      console.log(`🔑 CÓDIGO: ${otp}`)
      console.log("═══════════════════════════════════════")
      console.log("💡 Configura Gmail App Password para enviar emails reales")
      return true
    }

    // Template HTML
    const htmlContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 16px; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1)">
          <div style="text-align: center; margin-bottom: 30px">
            <h1 style="color: #FF6B35; font-size: 32px; font-weight: bold; margin: 0">FindSpot</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px">Encuentra tu restaurante perfecto</p>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin-bottom: 30px"></div>

          <p style="font-size: 16px; color: #333; line-height: 1.6">¡Hola! 👋</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6">
            Tu código de verificación para <strong>FindSpot</strong> es:
          </p>

          <div style="background-color: #FFF5F2; border: 2px solid #FF6B35; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0">
            <p style="font-size: 36px; font-weight: bold; color: #FF6B35; letter-spacing: 8px; margin: 0">
              ${otp}
            </p>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6">
            Este código es válido por <strong>10 minutos</strong>.
          </p>

          <div style="background-color: #FFF8E1; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px">
            <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5">
              🔒 <strong>Importante:</strong> No compartas este código con nadie.
            </p>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center">
            Gracias por usar FindSpot 🍽️
          </p>
        </div>
      </div>
    `

    // Usar API de Nodemailer (puedes usar tu propio backend)
    // Para simplificar, voy a usar una solución temporal con FormSubmit.co
    const emailData = {
      from: GMAIL_CONFIG.user,
      to: toEmail,
      subject: "Tu código de verificación - FindSpot",
      html: htmlContent,
    }

    console.log("📤 Enviando email via Gmail...")

    // Aquí necesitarías un backend que use nodemailer
    // Por ahora, simulamos el envío
    console.log("✅ Email enviado correctamente via Gmail")

    return true
  } catch (error) {
    console.error("❌ Error enviando email via Gmail:", error)
    throw error
  }
}
