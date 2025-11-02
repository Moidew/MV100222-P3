import React, { useState, useEffect, useContext } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { PremiumContext } from "../context/PremiumContext"
import { getAllRestaurants } from "../services/restaurantService"
import { getNightLifePlaces } from "../services/nightLifeService"
import { getAIRecommendations } from "../services/aiService"

export default function RecommendationsScreen({ navigation }) {
  const { isPremium } = useContext(PremiumContext)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState("restaurants") // "restaurants" o "nightlife"
  const [userPreferences, setUserPreferences] = useState(["Italiana", "Japonesa", "Mexicana"])
  const [nightlifePreferences, setNightlifePreferences] = useState(["Clubs", "Bares", "Lounges"])

  // Cargar preferencias cada vez que la pantalla se enfoca
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 RecommendationsScreen enfocada - Recargando preferencias...")
      loadUserPreferences()
      loadNightlifePreferences()
    }, [])
  )

  useEffect(() => {
    loadRecommendations()
  }, [mode, userPreferences, nightlifePreferences]) // Recargar cuando cambien preferencias

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
        console.log("✅ Preferencias de restaurantes cargadas:", capitalizedPreferences)
        setUserPreferences(capitalizedPreferences)
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
        console.log("✅ Preferencias de NightLife cargadas:", capitalizedPreferences)
        setNightlifePreferences(capitalizedPreferences)
      }
    } catch (error) {
      console.error("Error cargando preferencias de NightLife:", error)
    }
  }

  const loadRecommendations = async () => {
    try {
      setLoading(true)

      // Cargar restaurantes o lugares nocturnos según el modo
      const places = mode === "nightlife" ? await getNightLifePlaces() : await getAllRestaurants()

      if (places.length === 0) {
        Alert.alert("Aviso", "No hay lugares disponibles")
        setRecommendations([])
        setLoading(false)
        return
      }

      // Obtener recomendaciones con IA
      const isNightLife = mode === "nightlife"
      const preferencesToUse = isNightLife ? nightlifePreferences : userPreferences
      const aiRecommendations = await getAIRecommendations(preferencesToUse, places, isNightLife)

      setRecommendations(aiRecommendations)
    } catch (error) {
      console.error("Error cargando recomendaciones:", error)
      Alert.alert("Error", "No se pudieron cargar las recomendaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = (newMode) => {
    if (newMode === "nightlife" && !isPremium) {
      Alert.alert(
        "🔥 Premium Requerido",
        "Las recomendaciones de NightLife +18 son exclusivas para miembros Premium.\n\n¿Deseas activar tu membresía?",
        [
          { text: "Más tarde", style: "cancel" },
          {
            text: "Ver Planes",
            onPress: () => navigation.navigate("NightLife"),
          },
        ]
      )
      return
    }
    setMode(newMode)
  }

  const renderRecommendation = ({ item, index }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>

        <View style={styles.matchScoreContainer}>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: `${item.matchScore}%` }]} />
          </View>
          <Text style={styles.scoreText}>{item.matchScore}% Match</Text>
        </View>

        <Text style={styles.reason}>{item.reason}</Text>

        <View style={styles.footer}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.rating}>{item.rating || 4.5}</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Ver Detalles</Text>
            <Ionicons name="arrow-forward" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Generando recomendaciones personalizadas...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, mode === "nightlife" && styles.containerDark]}>
      <View style={[styles.header, mode === "nightlife" && styles.headerDark]}>
        <View style={styles.headerTop}>
          <Ionicons name="sparkles" size={24} color={mode === "nightlife" ? "#FFD700" : "#FFF"} />
          <Text style={[styles.headerTitle, mode === "nightlife" && styles.headerTitleDark]}>
            Recomendaciones con IA
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, mode === "nightlife" && styles.headerSubtitleDark]}>
          {mode === "nightlife" ? "Powered by Groq AI + Llama 3 🤖" : "Powered by Groq AI + Llama 3 🤖"}
        </Text>
      </View>

      {/* Chat IA Button - NUEVO Y DESTACADO */}
      <TouchableOpacity
        style={[styles.chatAIButton, mode === "nightlife" && styles.chatAIButtonDark]}
        onPress={() => navigation.navigate("AIChat")}
      >
        <View style={styles.chatAIIcon}>
          <Ionicons name="chatbubbles" size={24} color={mode === "nightlife" ? "#000" : "#FFF"} />
        </View>
        <View style={styles.chatAIContent}>
          <Text style={[styles.chatAITitle, mode === "nightlife" && styles.chatAITitleDark]}>
            💬 Chatea con la IA
          </Text>
          <Text style={[styles.chatAISubtitle, mode === "nightlife" && styles.chatAISubtitleDark]}>
            Pregúntame lo que quieras y te ayudo a encontrar el lugar perfecto
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={mode === "nightlife" ? "#FFD700" : "#FF6B35"} />
      </TouchableOpacity>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "restaurants" && styles.modeButtonActive]}
          onPress={() => handleModeSwitch("restaurants")}
        >
          <Ionicons name="restaurant" size={20} color={mode === "restaurants" ? "#FFF" : "#999"} />
          <Text style={[styles.modeButtonText, mode === "restaurants" && styles.modeButtonTextActive]}>
            Restaurantes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "nightlife" && styles.modeButtonActive,
            mode === "nightlife" && styles.modeButtonNight,
          ]}
          onPress={() => handleModeSwitch("nightlife")}
        >
          <Ionicons name="moon" size={20} color={mode === "nightlife" ? "#000" : "#999"} />
          <Text style={[styles.modeButtonText, mode === "nightlife" && styles.modeButtonTextNight]}>
            NightLife +18
          </Text>
          {isPremium && <View style={styles.premiumDot} />}
        </TouchableOpacity>
      </View>

      <View style={[styles.preferencesContainer, mode === "nightlife" && styles.preferencesContainerDark]}>
        <Text style={[styles.preferencesLabel, mode === "nightlife" && styles.preferencesLabelDark]}>
          Analizando tus preferencias:
        </Text>
        <View style={styles.preferencesRow}>
          {(mode === "nightlife" ? nightlifePreferences : userPreferences).length > 0 ? (
            (mode === "nightlife" ? nightlifePreferences : userPreferences).map((pref, index) => (
              <View key={index} style={[styles.preferenceTag, mode === "nightlife" && styles.preferenceTagDark]}>
                <Text style={[styles.preferenceTagText, mode === "nightlife" && styles.preferenceTagTextDark]}>
                  {pref}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noPreferencesText}>
              No hay preferencias configuradas. Ve a tu perfil para seleccionarlas.
            </Text>
          )}
        </View>
      </View>

      {recommendations.length > 0 ? (
        <View style={styles.recommendationsContainer}>
          {recommendations.map((rec, index) => (
            <View key={rec.id || index}>{renderRecommendation({ item: rec, index })}</View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#DDD" />
          <Text style={styles.emptyText}>No hay recomendaciones disponibles</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.refreshButton, mode === "nightlife" && styles.refreshButtonDark]}
        onPress={loadRecommendations}
      >
        <Ionicons name="refresh" size={20} color={mode === "nightlife" ? "#000" : "#FFF"} />
        <Text style={[styles.refreshButtonText, mode === "nightlife" && styles.refreshButtonTextDark]}>
          🤖 Generar Nuevas Recomendaciones con IA
        </Text>
      </TouchableOpacity>

      {mode === "nightlife" && (
        <View style={styles.aiInfo}>
          <Ionicons name="information-circle" size={16} color="#FFD700" />
          <Text style={styles.aiInfoText}>Recomendaciones generadas por IA especializada en vida nocturna</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: "#999",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFE8D6",
    marginTop: 5,
  },
  preferencesContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },
  preferencesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  preferencesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  preferenceTag: {
    backgroundColor: "#FFE8D6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  preferenceTagText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "500",
  },
  editButton: {
    padding: 8,
  },
  recommendationsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  recommendationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rankBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF6B35",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  rankText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardContent: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  matchScoreContainer: {
    marginBottom: 12,
  },
  scoreBar: {
    height: 6,
    backgroundColor: "#EEE",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35",
  },
  reason: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#999",
  },
  refreshButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Mode Selector
  modeSelector: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 15,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#EEE",
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  modeButtonNight: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  modeButtonTextActive: {
    color: "#FFF",
  },
  modeButtonTextNight: {
    color: "#000",
  },
  premiumDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ecc71",
  },
  // Dark Mode Styles
  containerDark: {
    backgroundColor: "#1a1a1a",
  },
  headerDark: {
    backgroundColor: "#2a2a2a",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitleDark: {
    color: "#FFD700",
  },
  headerSubtitleDark: {
    color: "#999",
  },
  preferencesContainerDark: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  preferencesLabelDark: {
    color: "#FFD700",
  },
  preferenceTagDark: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  preferenceTagTextDark: {
    color: "#FFD700",
  },
  refreshButtonDark: {
    backgroundColor: "#FFD700",
  },
  refreshButtonTextDark: {
    color: "#000",
  },
  aiInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    gap: 8,
  },
  aiInfoText: {
    fontSize: 12,
    color: "#999",
    flex: 1,
  },
  noPreferencesText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  // Chat IA Button
  chatAIButton: {
    backgroundColor: "#FF6B35",
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chatAIButtonDark: {
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
  },
  chatAIIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatAIContent: {
    flex: 1,
  },
  chatAITitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 3,
  },
  chatAITitleDark: {
    color: "#000",
  },
  chatAISubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 16,
  },
  chatAISubtitleDark: {
    color: "rgba(0,0,0,0.7)",
  },
})
