import axios from "axios"

/**
 * 🚀 SENDGRID - Alternativa a Resend
 *
 * SETUP:
 * 1. Crear cuenta en https://sendgrid.com (GRATIS)
 * 2. Verificar tu email en "Sender Authentication"
 * 3. Crear API Key en Settings > API Keys
 * 4. Copiar la key abajo
 *
 * FREE TIER:
 * - 100 emails/día (3,000/mes)
 * - NO requiere dominio
 * - Solo verificar tu email
 */

// 🔧 CONFIGURACIÓN SENDGRID
const SENDGRID_API_KEY = "" // ⚠️ Pega tu API key aquí
const SENDGRID_VERIFIED_EMAIL = "chepesarco0@gmail.com" // Email verificado en SendGrid

/**
 * Enviar OTP usando SendGrid
 * @param {string} toEmail - Email destino
 * @param {string} otp - Código OTP
 */
export const sendOTPViaSendGrid = async (toEmail, otp) => {
  try {
    console.log(`📧 Enviando OTP via SendGrid a ${toEmail}: ${otp}`)

    // Validar configuración
    if (!SENDGRID_API_KEY) {
      console.warn("⚠️ SendGrid API Key no configurada")
      console.log("═══════════════════════════════════════")
      console.log(`✅ OTP GENERADO PARA: ${toEmail}`)
      console.log(`🔑 CÓDIGO: ${otp}`)
      console.log("═══════════════════════════════════════")
      console.log("💡 Configura SendGrid API Key para enviar emails reales")
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

    // Llamada a SendGrid API
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      {
        personalizations: [
          {
            to: [{ email: toEmail }],
            subject: "Tu código de verificación - FindSpot",
          },
        ],
        from: {
          email: SENDGRID_VERIFIED_EMAIL,
          name: "FindSpot",
        },
        content: [
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.status === 202) {
      console.log("✅ Email enviado correctamente via SendGrid")
      return true
    } else {
      throw new Error("Error al enviar email")
    }
  } catch (error) {
    console.error("❌ Error enviando email via SendGrid:", error)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
    }
    throw error
  }
}
