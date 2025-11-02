import axios from "axios"
import { getAllRestaurants } from "./restaurantService"
import { getNightLifePlaces } from "./nightLifeService"
import { GROQ_API_KEY } from "@env"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

/**
 * Chat inteligente con IA - Asistente gastronómico
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} conversationHistory - Historial de mensajes
 * @param {boolean} isPremium - Si el usuario tiene Premium
 * @param {Array} userPreferences - Preferencias de categorías del usuario
 * @param {Array} nightlifePreferences - Preferencias de NightLife del usuario
 * @returns {Object} { text: string, recommendations: Array }
 */
export const chatWithAI = async (userMessage, conversationHistory = [], isPremium = false, userPreferences = [], nightlifePreferences = []) => {
  try {
    console.log("🤖 Chat IA - Estado Premium recibido:", isPremium)
    console.log("🎯 Preferencias del usuario:", userPreferences)
    console.log("🌙 Preferencias NightLife:", nightlifePreferences)

    // SIEMPRE cargar TODOS los lugares (restaurantes + nightlife)
    // La IA decidirá qué recomendar según el estado Premium
    const restaurants = await getAllRestaurants()
    const nightlifePlaces = await getNightLifePlaces()

    const allPlaces = [...restaurants, ...nightlifePlaces]

    console.log(`📊 Lugares cargados: ${restaurants.length} restaurantes + ${nightlifePlaces.length} NightLife = ${allPlaces.length} total`)
    console.log(`👤 Usuario: ${isPremium ? 'PREMIUM ✨' : 'NORMAL'}`)

    // Analizar la intención del usuario
    const intent = analyzeIntent(userMessage)

    // Construir contexto de conversación
    const conversationContext = conversationHistory
      .slice(-4) // Últimos 4 mensajes para contexto
      .map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }))

    // Separar lugares por tipo para el prompt
    const regularPlaces = allPlaces.filter(p => !p.isNightLife)
    const nightlifePlacesList = allPlaces.filter(p => p.isNightLife)

    // Preparar preferencias para el prompt
    const preferencesText = userPreferences.length > 0
      ? userPreferences.join(", ")
      : "No especificadas"

    const nightlifePreferencesText = nightlifePreferences.length > 0
      ? nightlifePreferences.join(", ")
      : "No especificadas"

    // Prompt del sistema - el cerebro del asistente
    const systemPrompt = `Eres un asistente gastronómico experto y amigable llamado "FindSpot AI".

TU PERSONALIDAD:
- Conversacional y cálido, como un amigo que conoce todos los restaurantes
- Haces preguntas inteligentes para entender mejor lo que el usuario busca
- Das recomendaciones ESPECÍFICAS con razones claras
- Eres creativo y entiendes contexto emocional (celebraciones, citas, reuniones, etc.)

TU CONOCIMIENTO:
- Conoces ${allPlaces.length} lugares en San Salvador (${regularPlaces.length} restaurantes + ${nightlifePlacesList.length} NightLife +18)
- ESTADO DEL USUARIO: ${isPremium ? '✨ PREMIUM - Acceso completo a TODOS los lugares' : '🔓 NORMAL - Solo acceso a restaurantes (NO NightLife +18)'}

PREFERENCIAS DEL USUARIO:
- 🍽️ Categorías favoritas de restaurantes: ${preferencesText}
${isPremium ? `- 🌙 Categorías favoritas de NightLife: ${nightlifePreferencesText}` : ''}

REGLAS IMPORTANTES SOBRE NIGHTLIFE +18:
${isPremium
  ? `- ✅ Este usuario ES PREMIUM: PUEDES recomendar libremente lugares NightLife +18 (bares, clubs, lounges)
- Cuando recomiendas NightLife, menciona que es parte de su membresía Premium`
  : `- ⛔ Este usuario NO ES PREMIUM: NO puedes recomendar lugares NightLife +18
- Si pregunta por bares/clubs/nightlife, responde amablemente:
  "¡Me encantaría mostrarte opciones de NightLife! 🍸✨ Sin embargo, el acceso a lugares +18 (bares, clubs, lounges) es exclusivo para miembros Premium. Con Premium tendrías acceso a ${nightlifePlacesList.length} lugares increíbles de vida nocturna. ¿Te gustaría que te recomiende restaurantes increíbles mientras tanto?"`
}

CÓMO RESPONDES:
1. Si el usuario hace una pregunta general → Responde amigablemente y pide más detalles
2. Si el usuario da suficiente contexto → Recomienda 2-3 lugares ESPECÍFICOS
3. PRIORITIZA lugares que coincidan con las preferencias del usuario cuando sea posible
4. SIEMPRE verifica si el lugar es NightLife antes de recomendarlo a usuarios no-Premium
5. SIEMPRE sé específico con los nombres de restaurantes reales de la lista
6. Incluye emojis relevantes pero no exageres
7. Si recomiendas algo fuera de sus preferencias habituales, explica por qué es una buena excepción

CONTEXTO DE LA CONVERSACIÓN:
${conversationContext.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

RESTAURANTES DISPONIBLES (primeros 15):
${regularPlaces
  .slice(0, 15)
  .map((p, i) => `${i + 1}. ${p.name} - ${p.category} (${p.rating || 4.5}★)`)
  .join("\n")}

${isPremium ? `\nNIGHTLIFE +18 DISPONIBLE (primeros 10):\n${nightlifePlacesList
  .slice(0, 10)
  .map((p, i) => `${i + 1}. ${p.name} - ${p.category} (${p.rating || 4.5}★) 🔞`)
  .join("\n")}` : ''}

IMPORTANTE:
- Si recomiendas lugares, usa el formato: **Nombre del Restaurante**
- Explica POR QUÉ recomiendas cada lugar
- Respeta las reglas de acceso según el estado Premium del usuario`

    const userPrompt = userMessage

    // Llamada a Groq AI
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationContext,
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8, // Más creativo
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    )

    const aiText = response.data.choices[0].message.content.trim()

    // Extraer nombres de restaurantes mencionados en la respuesta
    const mentionedRestaurants = extractMentionedRestaurants(aiText, allPlaces)

    // Si la IA mencionó restaurantes específicos, agregarlos como recomendaciones
    let recommendations = []
    if (mentionedRestaurants.length > 0) {
      recommendations = mentionedRestaurants.slice(0, 3).map((restaurant) => ({
        ...restaurant,
        reason: extractReasonForRestaurant(aiText, restaurant.name),
      }))
    }

    console.log(`✅ Chat IA generado. Mencionó ${mentionedRestaurants.length} lugares`)

    return {
      text: aiText,
      recommendations: recommendations,
    }
  } catch (error) {
    console.error("❌ Error en chat IA:", error.response?.data || error.message)

    // Fallback a respuesta genérica
    return {
      text: "Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías reformular tu pregunta? Por ejemplo: 'Busco un lugar romántico para cenar' o '¿Dónde puedo comer comida italiana?'",
      recommendations: [],
    }
  }
}

/**
 * Analiza la intención del mensaje del usuario
 */
function analyzeIntent(message) {
  const lowerMessage = message.toLowerCase()

  const intents = {
    romantic: ["romántico", "cita", "aniversario", "pareja", "íntimo"],
    business: ["negocios", "trabajo", "reunión", "profesional", "corporativo"],
    celebration: ["celebrar", "cumpleaños", "fiesta", "celebración", "festejo"],
    casual: ["casual", "informal", "rápido", "amigos"],
    fancy: ["elegante", "fino", "sofisticado", "lujo", "exclusivo"],
    quiet: ["tranquilo", "silencioso", "trabajar", "estudiar", "leer"],
    nightlife: ["bar", "club", "disco", "fiesta", "bailar", "tragos", "nightlife"],
  }

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return intent
    }
  }

  return "general"
}

/**
 * Extrae restaurantes mencionados en el texto de la IA
 */
function extractMentionedRestaurants(aiText, allPlaces) {
  const mentioned = []

  // Buscar nombres de restaurantes en el texto (los que están entre **)
  const matches = aiText.match(/\*\*([^*]+)\*\*/g)
  if (matches) {
    matches.forEach((match) => {
      const name = match.replace(/\*\*/g, "").trim()
      const restaurant = allPlaces.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (restaurant && !mentioned.find((r) => r.id === restaurant.id)) {
        mentioned.push(restaurant)
      }
    })
  }

  // Si no encontró con **, buscar menciones directas
  if (mentioned.length === 0) {
    allPlaces.forEach((place) => {
      if (aiText.includes(place.name) && !mentioned.find((r) => r.id === place.id)) {
        mentioned.push(place)
      }
    })
  }

  return mentioned
}

/**
 * Extrae la razón por la que la IA recomendó un restaurante
 */
function extractReasonForRestaurant(aiText, restaurantName) {
  // Buscar el párrafo que menciona el restaurante
  const sentences = aiText.split(/[.!?]\s+/)
  for (const sentence of sentences) {
    if (sentence.includes(restaurantName)) {
      // Limpiar markdown
      return sentence.replace(/\*\*/g, "").trim()
    }
  }
  return "Recomendado por la IA según tus preferencias"
}

/**
 * Genera análisis de reseñas con IA (para usar en el chat)
 */
export const analyzeReviewsWithAI = async (restaurantName, reviews) => {
  try {
    const reviewsText = reviews.map((r) => `"${r.comment}" - ${r.rating}★`).join("\n")

    const prompt = `Analiza estas reseñas del restaurante "${restaurantName}" y genera un resumen breve (máximo 100 palabras):

RESEÑAS:
${reviewsText}

Resume:
- Lo que MÁS destacan los clientes (positivo)
- Lo que MENOS gustó (si hay críticas)
- Perfil del restaurante (¿para quién es ideal?)

Responde en español, de forma conversacional y amigable.`

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
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
    console.error("Error analizando reseñas:", error)
    return "No pude analizar las reseñas en este momento."
  }
}

/**
 * Compara restaurantes con IA
 */
export const compareRestaurantsWithAI = async (restaurant1, restaurant2) => {
  try {
    const prompt = `Compara estos dos restaurantes y ayuda al usuario a decidir:

**${restaurant1.name}**
- Categoría: ${restaurant1.category}
- Rating: ${restaurant1.rating || 4.5}★
- Ubicación: ${restaurant1.address || "San Salvador"}

**${restaurant2.name}**
- Categoría: ${restaurant2.category}
- Rating: ${restaurant2.rating || 4.5}★
- Ubicación: ${restaurant2.address || "San Salvador"}

Genera una comparación breve (máximo 150 palabras):
- ¿Cuál es mejor para qué ocasión?
- Ventajas de cada uno
- Tu recomendación final

Responde de forma amigable y conversacional.`

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
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
    console.error("Error comparando restaurantes:", error)
    return "No pude hacer la comparación en este momento."
  }
}
