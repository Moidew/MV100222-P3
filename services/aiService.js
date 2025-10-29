import axios from "axios"
import { GROQ_API_KEY } from "@env"

// 🔑 GROQ API KEY - Configurado en .env
// Groq es MUCHO más rápido que OpenAI y totalmente GRATIS (14,400 requests/día)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

/**
 * Genera recomendaciones personalizadas con IA
 * @param {Array} userPreferences - Preferencias del usuario ["Italiana", "Japonesa"]
 * @param {Array} restaurants - Lista de restaurantes disponibles
 * @param {boolean} isNightLife - Si es para modo +18
 * @returns {Array} Recomendaciones con matchScore y reason
 */
export const getAIRecommendations = async (userPreferences, restaurants, isNightLife = false) => {
  try {
    // Si no hay API key, usar mock
    if (!GROQ_API_KEY || GROQ_API_KEY === "TU_API_KEY_AQUI") {
      console.warn("⚠️ Groq API key no configurada. Usando recomendaciones mock.")
      return generateMockRecommendations(restaurants, userPreferences, isNightLife)
    }

    // Limitar a 20 restaurantes para no sobrecargar el prompt
    const limitedRestaurants = restaurants.slice(0, 20)

    // Preparar lista de restaurantes simplificada
    const restaurantsList = limitedRestaurants
      .map(
        (r, i) =>
          `${i}. ${r.name} - ${r.category} (${r.rating || 4.5}★) - ${r.address || "Sin ubicación"}`
      )
      .join("\n")

    const preferencesText =
      userPreferences.length > 0 ? userPreferences.join(", ") : "todas las categorías"

    // Prompts diferentes para modo normal vs +18
    const systemPrompt = isNightLife
      ? `Eres un experto en vida nocturna y entretenimiento para adultos (+18). Recomiendas los mejores bares, clubs, discotecas y lounges basándote en ambiente, música, tragos y experiencia nocturna.`
      : `Eres un experto gastronómico que recomienda restaurantes personalizados según las preferencias culinarias del usuario.`

    const userPrompt = isNightLife
      ? `Del siguiente listado de lugares nocturnos, recomienda los TOP 5 mejores para alguien interesado en: ${preferencesText}.

Lugares disponibles:
${restaurantsList}

INSTRUCCIONES:
1. Responde SOLO con un JSON array (sin markdown \`\`\`, sin texto extra)
2. Ordena de mejor a peor match
3. Da razones enfocadas en: ambiente, música, tragos, vibra nocturna

Formato JSON:
[
  {"index": 0, "matchScore": 95, "reason": "Ambiente increíble con DJs internacionales y cócteles premium. Perfecto para una noche épica 🔥"},
  {"index": 1, "matchScore": 90, "reason": "..."}
]`
      : `Del siguiente listado de restaurantes, recomienda los TOP 5 mejores para alguien con preferencia por: ${preferencesText}.

Restaurantes disponibles:
${restaurantsList}

INSTRUCCIONES:
1. Responde SOLO con un JSON array (sin markdown \`\`\`, sin texto extra)
2. Ordena de mejor a peor match
3. Da razones enfocadas en: sabor, calidad, experiencia gastronómica

Formato JSON:
[
  {"index": 0, "matchScore": 95, "reason": "Cocina italiana auténtica con ingredientes importados de Italia. Perfecta para amantes de la pasta fresca"},
  {"index": 1, "matchScore": 90, "reason": "..."}
]`

    // Llamada a Groq API (súper rápida!)
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile", // Modelo más reciente y potente
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 segundos timeout
      }
    )

    let aiResponse = response.data.choices[0].message.content.trim()

    // Limpiar markdown si existe
    if (aiResponse.includes("```")) {
      aiResponse = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    }

    // Parse JSON
    const aiRecommendations = JSON.parse(aiResponse)

    // Mapear a restaurantes reales
    const recommendations = aiRecommendations
      .map((rec) => {
        const restaurant = limitedRestaurants[rec.index]
        if (!restaurant) return null

        return {
          ...restaurant,
          matchScore: rec.matchScore,
          reason: rec.reason,
        }
      })
      .filter(Boolean)

    console.log(`✅ IA generó ${recommendations.length} recomendaciones`)
    return recommendations
  } catch (error) {
    console.error("❌ Error con IA:", error.response?.data || error.message)
    // Fallback a mock si falla
    return generateMockRecommendations(restaurants, userPreferences, isNightLife)
  }
}

/**
 * Genera recomendaciones mock (fallback sin IA)
 */
function generateMockRecommendations(restaurants, userPreferences, isNightLife) {
  if (restaurants.length === 0) return []

  // Filtrar por preferencias si existen
  let filtered = restaurants
  if (userPreferences.length > 0) {
    filtered = restaurants.filter((r) => userPreferences.some((pref) => r.category?.includes(pref)))
  }

  // Si no hay matches, usar todos
  if (filtered.length === 0) {
    filtered = restaurants
  }

  // Ordenar por rating y tomar top 5
  const sorted = [...filtered].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
  const top5 = sorted.slice(0, 5)

  // Generar razones mock
  return top5.map((restaurant, index) => {
    const matchScore = 95 - index * 5 // 95, 90, 85, 80, 75

    let reason = ""
    if (isNightLife) {
      const nightReasons = [
        `Ambiente increíble y música de primera. Perfecto para una noche épica 🔥`,
        `Uno de los lugares más populares de la escena nocturna. Siempre buena vibra y excelente servicio`,
        `Ideal para salir con amigos. Gran variedad de tragos y DJs reconocidos`,
        `Ambiente exclusivo y sofisticado. Perfecto para una noche especial`,
        `Buena música, buen ambiente y precios razonables. Siempre recomendado`,
      ]
      reason = nightReasons[index] || nightReasons[0]
    } else {
      const foodReasons = [
        `Excelente calidad de comida y muy buenas reseñas. Perfecto para tus gustos`,
        `Uno de los mejores restaurantes en su categoría. Ingredientes frescos y sabor auténtico`,
        `Ambiente acogedor y platillos deliciosos. Muy recomendado por la comunidad`,
        `Gran relación calidad-precio y servicio atento. Una opción segura`,
        `Menú variado y sabores únicos. Vale la pena probarlo`,
      ]
      reason = foodReasons[index] || foodReasons[0]
    }

    return {
      ...restaurant,
      matchScore,
      reason,
    }
  })
}

/**
 * Generar descripción de restaurante con IA (usando Groq)
 */
export const generateRestaurantDescription = async (restaurantName, cuisine) => {
  try {
    if (!GROQ_API_KEY || GROQ_API_KEY === "TU_API_KEY_AQUI") {
      return `${restaurantName} ofrece una experiencia gastronómica única de comida ${cuisine}. Ingredientes frescos, sabores auténticos y un ambiente acogedor que te hará sentir como en casa.`
    }

    const prompt = `Genera una descripción atractiva y breve (máximo 80 palabras) para un restaurante de comida ${cuisine} llamado ${restaurantName}. Sé persuasivo y menciona lo que lo hace especial.`

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-specdec", // Modelo más rápido y actualizado
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error("Error generando descripción:", error)
    return `${restaurantName} es un excelente restaurante de comida ${cuisine} con gran ambiente y sabores auténticos.`
  }
}
