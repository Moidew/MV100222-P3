import { useState, useContext, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthContext } from "../context/AuthContext"
import { PremiumContext } from "../context/PremiumContext"
import { logoutUser } from "../services/authService"

// Categorías de restaurantes
const AVAILABLE_CATEGORIES = [
  { id: "italiana", label: "Italiana", icon: "🍝" },
  { id: "japonesa", label: "Japonesa", icon: "🍣" },
  { id: "mexicana", label: "Mexicana", icon: "🌮" },
  { id: "salvadorena", label: "Salvadoreña", icon: "🫔" },
  { id: "cafe", label: "Café", icon: "☕" },
  { id: "americana", label: "Americana", icon: "🍔" },
  { id: "china", label: "China", icon: "🥡" },
  { id: "india", label: "India", icon: "🍛" },
  { id: "francesa", label: "Francesa", icon: "🥐" },
  { id: "vegetariana", label: "Vegetariana", icon: "🥗" },
]

// Categorías de NightLife +18 (solo para Premium)
const NIGHTLIFE_CATEGORIES = [
  { id: "clubs", label: "Clubs", icon: "🎵" },
  { id: "bares", label: "Bares", icon: "🍺" },
  { id: "lounges", label: "Lounges", icon: "🍸" },
  { id: "discos", label: "Discos", icon: "💃" },
]

export default function ProfileScreen() {
  const { user } = useContext(AuthContext)
  const { isPremium, subscriptionData, cancelPremium } = useContext(PremiumContext)
  const [notifications, setNotifications] = useState(true)
  const [selectedPreferences, setSelectedPreferences] = useState(["italiana", "japonesa", "mexicana"])
  const [selectedNightlifePreferences, setSelectedNightlifePreferences] = useState(["clubs", "bares", "lounges"])

  // Cargar preferencias guardadas al iniciar
  useEffect(() => {
    loadPreferences()
    loadNightlifePreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("userPreferences")
      if (saved) {
        setSelectedPreferences(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error cargando preferencias:", error)
    }
  }

  const loadNightlifePreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("nightlifePreferences")
      if (saved) {
        setSelectedNightlifePreferences(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error cargando preferencias de NightLife:", error)
    }
  }

  const savePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem("userPreferences", JSON.stringify(newPreferences))
      setSelectedPreferences(newPreferences)
      Alert.alert("✅ Guardado", "Tus preferencias se actualizaron. La IA las usará para recomendaciones personalizadas.")
    } catch (error) {
      console.error("Error guardando preferencias:", error)
      Alert.alert("Error", "No se pudieron guardar las preferencias")
    }
  }

  const saveNightlifePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem("nightlifePreferences", JSON.stringify(newPreferences))
      setSelectedNightlifePreferences(newPreferences)
      Alert.alert("✅ Guardado", "Tus preferencias de NightLife se actualizaron. La IA las usará para recomendaciones +18.")
    } catch (error) {
      console.error("Error guardando preferencias de NightLife:", error)
      Alert.alert("Error", "No se pudieron guardar las preferencias")
    }
  }

  const togglePreference = (categoryId) => {
    const newPreferences = selectedPreferences.includes(categoryId)
      ? selectedPreferences.filter((id) => id !== categoryId)
      : [...selectedPreferences, categoryId]

    if (newPreferences.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos una preferencia")
      return
    }

    savePreferences(newPreferences)
  }

  const toggleNightlifePreference = (categoryId) => {
    if (!isPremium) {
      Alert.alert(
        "🔥 Premium Requerido",
        "Las preferencias de NightLife +18 son exclusivas para miembros Premium.\n\n¿Deseas activar tu membresía?",
        [
          { text: "Más tarde", style: "cancel" },
          { text: "Ver Planes", onPress: () => {} }, // Aquí podrías navegar a la pantalla de planes
        ]
      )
      return
    }

    const newPreferences = selectedNightlifePreferences.includes(categoryId)
      ? selectedNightlifePreferences.filter((id) => id !== categoryId)
      : [...selectedNightlifePreferences, categoryId]

    if (newPreferences.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos una preferencia de NightLife")
      return
    }

    saveNightlifePreferences(newPreferences)
  }

  const handleCancelSubscription = () => {
    Alert.alert(
      "❌ Cancelar Suscripción Premium",
      `¿Estás seguro de que deseas cancelar tu suscripción ${subscriptionData?.planType === "yearly" ? "anual" : "mensual"}?\n\nPerderás acceso a:\n• NightLife +18\n• Recomendaciones Premium con IA\n• Contenido exclusivo`,
      [
        { text: "No, mantener Premium", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelPremium()
              Alert.alert(
                "Suscripción Cancelada",
                "Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el final del período pagado."
              )
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la suscripción")
            }
          },
        },
      ]
    )
  }

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser()
          } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión")
          }
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#FF6B35" />
        </View>
        <Text style={styles.userName}>{user?.email?.split("@")[0] || "Usuario"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>Premium Member</Text>
          </View>
        )}
      </View>

      {/* Sección Premium */}
      {isPremium && subscriptionData && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={20} color="#FFD700" />
            <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>Mi Suscripción Premium</Text>
          </View>

          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Plan:</Text>
              <Text style={styles.subscriptionValue}>
                {subscriptionData.planType === "yearly" ? "Anual" : "Mensual"} - $
                {subscriptionData.price}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Estado:</Text>
              <Text style={[styles.subscriptionValue, styles.subscriptionActive]}>
                ✓ {subscriptionData.status === "active" ? "Activa" : "Cancelada"}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Renueva:</Text>
              <Text style={styles.subscriptionValue}>
                {subscriptionData.expiresAt
                  ? new Date(subscriptionData.expiresAt.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
            <Ionicons name="close-circle" size={20} color="#e74c3c" />
            <Text style={styles.cancelButtonText}>Cancelar Suscripción</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <Ionicons name="notifications" size={20} color="#FF6B35" />
            <Text style={styles.preferenceText}>Notificaciones</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#DDD", true: "#FF6B35" }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={20} color="#FF6B35" />
          <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>
            🤖 Preferencias para la IA
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Selecciona tus categorías favoritas. La IA las usará para generar recomendaciones personalizadas
        </Text>

        <View style={styles.categoriesGrid}>
          {AVAILABLE_CATEGORIES.map((category) => {
            const isSelected = selectedPreferences.includes(category.id)
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => togglePreference(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                  {category.label}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={18} color="#FF6B35" />}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.aiInfo}>
          <Ionicons name="bulb" size={16} color="#FF6B35" />
          <Text style={styles.aiInfoText}>
            Has seleccionado {selectedPreferences.length} categoría{selectedPreferences.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Sección NightLife +18 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon" size={20} color="#FFD700" />
          <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>
            🔥 Preferencias NightLife +18
          </Text>
          {isPremium && (
            <View style={styles.premiumBadgeSmall}>
              <Ionicons name="star" size={12} color="#FFD700" />
            </View>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>
          {isPremium
            ? "Selecciona tus preferencias de vida nocturna. La IA las usará para recomendaciones +18"
            : "🔒 Contenido exclusivo Premium. Actualiza tu plan para personalizar recomendaciones de NightLife"}
        </Text>

        <View style={styles.categoriesGrid}>
          {NIGHTLIFE_CATEGORIES.map((category) => {
            const isSelected = selectedNightlifePreferences.includes(category.id)
            const isDisabled = !isPremium
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelectedNight,
                  isDisabled && styles.categoryChipDisabled,
                ]}
                onPress={() => toggleNightlifePreference(category.id)}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelectedNight,
                    isDisabled && styles.categoryLabelDisabled,
                  ]}
                >
                  {category.label}
                </Text>
                {isSelected && isPremium && <Ionicons name="checkmark-circle" size={18} color="#FFD700" />}
                {isDisabled && <Ionicons name="lock-closed" size={16} color="#999" />}
              </TouchableOpacity>
            )
          })}
        </View>

        {isPremium ? (
          <View style={styles.aiInfoNight}>
            <Ionicons name="bulb" size={16} color="#FFD700" />
            <Text style={styles.aiInfoTextNight}>
              Has seleccionado {selectedNightlifePreferences.length} categoría
              {selectedNightlifePreferences.length !== 1 ? "s" : ""} de NightLife
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.unlockButton}>
            <Ionicons name="lock-open" size={18} color="#FFD700" />
            <Text style={styles.unlockButtonText}>Desbloquear con Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>

        <TouchableOpacity style={styles.infoItem}>
          <Ionicons name="help-circle-outline" size={20} color="#FF6B35" />
          <Text style={styles.infoText}>Ayuda y Soporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#DDD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem}>
          <Ionicons name="document-text-outline" size={20} color="#FF6B35" />
          <Text style={styles.infoText}>Términos y Condiciones</Text>
          <Ionicons name="chevron-forward" size={20} color="#DDD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#FF6B35" />
          <Text style={styles.infoText}>Política de Privacidad</Text>
          <Ionicons name="chevron-forward" size={20} color="#DDD" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE8D6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    gap: 5,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },
  subscriptionInfo: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: "#666",
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  subscriptionActive: {
    color: "#2ecc71",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e74c3c",
    gap: 8,
  },
  cancelButtonText: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "600",
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DDD",
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: "#FFE8D6",
    borderColor: "#FF6B35",
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryLabelSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  aiInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  aiInfoText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  // Estilos NightLife +18
  categoryChipSelectedNight: {
    backgroundColor: "#FFF9E6",
    borderColor: "#FFD700",
  },
  categoryLabelSelectedNight: {
    color: "#FFD700",
    fontWeight: "600",
  },
  categoryChipDisabled: {
    opacity: 0.5,
    backgroundColor: "#F0F0F0",
  },
  categoryLabelDisabled: {
    color: "#999",
  },
  aiInfoNight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  aiInfoTextNight: {
    fontSize: 13,
    color: "#FFD700",
    flex: 1,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  unlockButtonText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },
  premiumBadgeSmall: {
    marginLeft: "auto",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})
