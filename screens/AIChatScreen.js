import React, { useState, useRef, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { PremiumContext } from "../context/PremiumContext"
import { chatWithAI } from "../services/aiChatService"

export default function AIChatScreen({ navigation }) {
  const { isPremium } = useContext(PremiumContext)
  const [userPreferences, setUserPreferences] = useState(["Italiana", "Japonesa", "Mexicana"])
  const [nightlifePreferences, setNightlifePreferences] = useState(["Clubs", "Bares", "Lounges"])

  // Mensaje de bienvenida personalizado según Premium
  const welcomeMessage = isPremium
    ? "¡Hola! 👋 Soy tu asistente gastronómico con IA.\n\n✨ Como miembro Premium, tengo acceso completo a lugares NightLife +18 (bares, clubs, lounges) además de todos los restaurantes.\n\nPuedo ayudarte a encontrar el lugar perfecto según tu ocasión, presupuesto, humor o cualquier preferencia. ¿Qué estás buscando hoy?"
    : "¡Hola! 👋 Soy tu asistente gastronómico con IA. Puedo ayudarte a encontrar el lugar perfecto según tu ocasión, presupuesto, humor o cualquier preferencia.\n\n💡 Con Premium tendrías acceso a recomendaciones de NightLife +18.\n\n¿Qué estás buscando hoy?"

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: welcomeMessage,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef()

  // Sugerencias rápidas
  const quickSuggestions = [
    { id: 1, icon: "heart", text: "Cita romántica", query: "Busco un lugar romántico para una cita especial" },
    { id: 2, icon: "briefcase", text: "Reunión de negocios", query: "Necesito un lugar profesional para reunión de trabajo" },
    { id: 3, icon: "cake", text: "Celebración", query: "Quiero celebrar un cumpleaños, algo festivo" },
    { id: 4, icon: "coffee", text: "Café tranquilo", query: "Un lugar tranquilo para trabajar con buen café" },
    { id: 5, icon: "pizza", text: "Comida casual", query: "Algo casual y rico para comer con amigos" },
    { id: 6, icon: "wine", text: "Noche elegante", query: "Una cena elegante y sofisticada" },
  ]

  // Cargar preferencias cuando la pantalla se enfoca
  useFocusEffect(
    React.useCallback(() => {
      loadUserPreferences()
      loadNightlifePreferences()
    }, [])
  )

  useEffect(() => {
    // Auto-scroll al final cuando hay nuevos mensajes
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  useEffect(() => {
    // Debug: Verificar estado Premium y preferencias
    console.log("🔍 AIChatScreen - Estado Premium:", isPremium)
    console.log("🔍 AIChatScreen - Preferencias restaurantes:", userPreferences)
    console.log("🔍 AIChatScreen - Preferencias NightLife:", nightlifePreferences)
  }, [isPremium, userPreferences, nightlifePreferences])

  const loadUserPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("userPreferences")
      if (saved) {
        const savedPreferences = JSON.parse(saved)
        // Convertir IDs a nombres capitalizados para la IA
        const capitalizedPreferences = savedPreferences.map((id) => {
          const categoryMap = {
            italiana: "Italiana",
            japonesa: "Japonesa",
            mexicana: "Mexicana",
            salvadorena: "Salvadoreña",
            cafe: "Café",
            americana: "Americana",
            china: "China",
            india: "India",
            francesa: "Francesa",
            vegetariana: "Vegetariana",
          }
          return categoryMap[id] || id
        })
        setUserPreferences(capitalizedPreferences)
        console.log("✅ Preferencias cargadas:", capitalizedPreferences)
      }
    } catch (error) {
      console.error("Error cargando preferencias:", error)
    }
  }

  const loadNightlifePreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("nightlifePreferences")
      if (saved) {
        const savedPreferences = JSON.parse(saved)
        // Convertir IDs a nombres capitalizados para la IA
        const capitalizedPreferences = savedPreferences.map((id) => {
          const categoryMap = {
            clubs: "Clubs",
            bares: "Bares",
            lounges: "Lounges",
            discos: "Discos",
          }
          return categoryMap[id] || id
        })
        setNightlifePreferences(capitalizedPreferences)
        console.log("✅ Preferencias NightLife cargadas:", capitalizedPreferences)
      }
    } catch (error) {
      console.error("Error cargando preferencias de NightLife:", error)
    }
  }

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    try {
      // Obtener respuesta de la IA (incluyendo preferencias del usuario)
      const aiResponse = await chatWithAI(messageText, messages, isPremium, userPreferences, nightlifePreferences)

      // Agregar respuesta de la IA
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: aiResponse.text,
        recommendations: aiResponse.recommendations, // Si la IA sugiere restaurantes
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error en chat:", error)
      Alert.alert("Error", "No pude procesar tu mensaje. Intenta de nuevo.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickSuggestion = (query) => {
    handleSendMessage(query)
  }

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate("RestaurantDetail", { restaurant })
  }

  const renderMessage = (message) => {
    const isUser = message.type === "user"

    return (
      <View
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#FF6B35" />
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{message.text}</Text>

          {/* Si la IA sugiere restaurantes */}
          {message.recommendations && message.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>💡 Mis sugerencias:</Text>
              {message.recommendations.map((restaurant, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendationCard}
                  onPress={() => handleRestaurantPress(restaurant)}
                >
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationName}>{restaurant.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <Text style={styles.ratingText}>{restaurant.rating || 4.5}</Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationCategory}>{restaurant.category}</Text>
                  <Text style={styles.recommendationReason} numberOfLines={2}>
                    {restaurant.reason}
                  </Text>
                  <View style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>Ver detalles</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FF6B35" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color="#FFF" />
          </View>
        )}
      </View>
    )
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Chat con IA</Text>
            <Text style={styles.headerSubtitle}>
              {isPremium ? "✨ Premium Activo" : "Asistente Gastronómico"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert("Limpiar Chat", "¿Deseas borrar toda la conversación?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Limpiar",
                style: "destructive",
                onPress: () => setMessages([messages[0]]), // Mantener solo mensaje de bienvenida
              },
            ])
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Preferencias activas */}
      {userPreferences.length > 0 && (
        <View style={styles.preferencesBar}>
          <View style={styles.preferencesHeader}>
            <Ionicons name="heart" size={14} color="#FF6B35" />
            <Text style={styles.preferencesTitle}>Tus preferencias:</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.preferencesScroll}>
            {userPreferences.map((pref, index) => (
              <View key={index} style={styles.preferenceChip}>
                <Text style={styles.preferenceChipText}>{pref}</Text>
              </View>
            ))}
            {isPremium && nightlifePreferences.map((pref, index) => (
              <View key={`night-${index}`} style={styles.preferenceChipNight}>
                <Text style={styles.preferenceChipTextNight}>{pref}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => renderMessage(message))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#FF6B35" />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}

        {/* Quick Suggestions (solo si hay pocos mensajes) */}
        {messages.length <= 2 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>💡 Prueba preguntarme:</Text>
            <View style={styles.suggestionsGrid}>
              {quickSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionChip}
                  onPress={() => handleQuickSuggestion(suggestion.query)}
                >
                  <Ionicons name={suggestion.icon} size={18} color="#FF6B35" />
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.poweredBy}>Powered by Groq AI + Llama 3.3 🤖</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    gap: 5,
  },
  backText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  clearButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE8D6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: "#FF6B35",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: "#333",
  },
  userText: {
    color: "#FFF",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  typingBubble: {
    paddingVertical: 15,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  recommendationsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
    marginBottom: 10,
  },
  recommendationCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B35",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  recommendationName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  recommendationCategory: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },
  recommendationReason: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#FF6B35",
    fontWeight: "600",
  },
  suggestionsSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#FF6B35",
    gap: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionText: {
    fontSize: 13,
    color: "#FF6B35",
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#DDD",
  },
  poweredBy: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
  preferencesBar: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  preferencesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  preferencesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  preferencesScroll: {
    flexDirection: "row",
  },
  preferenceChip: {
    backgroundColor: "#FFE8D6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  preferenceChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FF6B35",
  },
  preferenceChipNight: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  preferenceChipTextNight: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FFD700",
  },
})
