import { useState, useEffect, useContext } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useFocusEffect } from "@react-navigation/native"
import { getNightLifePlaces } from "../services/nightLifeService"
import { AuthContext } from "../context/AuthContext"
import { PremiumContext } from "../context/PremiumContext"
import { ThemeContext } from "../context/ThemeContext"
import WompiPaymentModal from "../components/WompiPaymentModal"

export default function NightModeScreen({ navigation }) {
  const { user } = useContext(AuthContext)
  const { isPremium, activatePremium, loading: premiumLoading } = useContext(PremiumContext)
  const { toggleDarkMode } = useContext(ThemeContext)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState("actual")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("monthly")

  // Ubicaciones predefinidas
  const predefinedLocations = {
    ufg: {
      name: "UFG - Universidad Francisco Gavidia",
      latitude: 13.6929,
      longitude: -89.2182,
    },
    centro: {
      name: "Centro Histórico de San Salvador",
      latitude: 13.6989,
      longitude: -89.1914,
    },
  }

  // Función para calcular distancia
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance.toFixed(1)
  }

  // Activar dark mode cuando la pantalla está en foco
  useFocusEffect(() => {
    toggleDarkMode(true)
    return () => {
      toggleDarkMode(false)
    }
  })

  useEffect(() => {
    if (isPremium) {
      loadPlaces()
    }
  }, [isPremium])

  const loadPlaces = async (locationKey = "actual") => {
    try {
      let referenceLocation

      if (locationKey === "actual") {
        if (places.length === 0) {
          setLoading(true)
        }

        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          Alert.alert("Permisos de ubicación", "Necesitamos acceso a tu ubicación")
          setLoading(false)
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        setUserLocation(location.coords)
        referenceLocation = location.coords
      } else {
        referenceLocation = predefinedLocations[locationKey]
      }

      const placesData = await getNightLifePlaces()

      const placesWithDistance = placesData.map((place) => {
        const distance = calculateDistance(
          referenceLocation.latitude,
          referenceLocation.longitude,
          place.location.latitude,
          place.location.longitude
        )

        return {
          ...place,
          distance: `${distance} km`,
          distanceValue: parseFloat(distance),
        }
      })

      placesWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)

      setPlaces(placesWithDistance)
      setLoading(false)
    } catch (error) {
      console.error("Error cargando lugares:", error)
      Alert.alert("Error", "No se pudieron cargar los lugares")
      setLoading(false)
    }
  }

  const handleLocationChange = (locationKey) => {
    setSelectedLocation(locationKey)
    loadPlaces(locationKey)
  }

  const handleUpgradeToPremium = (planType = "monthly") => {
    setSelectedPlan(planType)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (planType) => {
    try {
      await activatePremium(planType)
      setShowPaymentModal(false)
    } catch (error) {
      Alert.alert("Error", "No se pudo activar la suscripción. Intenta de nuevo.")
    }
  }

  const categories = ["Todos", "Bares", "Clubs", "Discos", "Lounges", "Strip Clubs"]

  const filteredPlaces =
    selectedCategory === "Todos" ? places : places.filter((place) => place.category === selectedCategory)

  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeOverlay}>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeCategory}>{item.category}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Ionicons name="location" size={14} color="#FFF" style={{ marginLeft: 10 }} />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
        <View style={styles.ageRestriction}>
          <Text style={styles.ageText}>+18</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (premiumLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  if (!isPremium) {
    return (
      <View style={styles.paywallContainer}>
        <ScrollView
          contentContainerStyle={styles.paywallScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.paywallContent}>
            <Ionicons name="moon" size={80} color="#FF6B35" />
            <Text style={styles.paywallTitle}>🔥 NightLife Premium</Text>
            <Text style={styles.paywallSubtitle}>Descubre la vida nocturna de San Salvador</Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                <Text style={styles.benefitText}>Acceso a bares exclusivos</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                <Text style={styles.benefitText}>Clubs y discotecas VIP</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                <Text style={styles.benefitText}>Eventos especiales +18</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                <Text style={styles.benefitText}>Recomendaciones personalizadas</Text>
              </View>
            </View>

            <View style={styles.planOptions}>
              <TouchableOpacity style={styles.planCard} onPress={() => handleUpgradeToPremium("monthly")}>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>🎉 OFERTA</Text>
                </View>
                <Text style={styles.planTitle}>Plan Mensual</Text>
                <View style={styles.planPriceContainer}>
                  <Text style={styles.planPriceOld}>$2.99</Text>
                  <Text style={styles.planPrice}>$1.99</Text>
                </View>
                <Text style={styles.planPeriod}>por mes</Text>
                <Text style={styles.planSavings}>Ahorra $1.00</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.planCard, styles.planCardFeatured]} onPress={() => handleUpgradeToPremium("yearly")}>
                <View style={[styles.planBadge, styles.planBadgeFeatured]}>
                  <Text style={styles.planBadgeText}>💎 MEJOR OFERTA</Text>
                </View>
                <Text style={styles.planTitle}>Plan Anual</Text>
                <View style={styles.planPriceContainer}>
                  <Text style={styles.planPriceOld}>$23.88</Text>
                  <Text style={styles.planPrice}>$19.99</Text>
                </View>
                <Text style={styles.planPeriod}>por año</Text>
                <Text style={styles.planSavings}>Ahorra $3.89 (2 meses gratis)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimerText}>Contenido exclusivo para mayores de 18 años</Text>
          </View>
        </ScrollView>

        <WompiPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          planType={selectedPlan}
        />
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.premiumHeader}>
        <Ionicons name="moon" size={24} color="#FFD700" />
        <Text style={styles.premiumHeaderText}>NightLife Premium</Text>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>+18</Text>
        </View>
      </View>

      {/* Selector de ubicación */}
      <View style={styles.locationSelector}>
        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "actual" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("actual")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={16} color={selectedLocation === "actual" ? "#000" : "#FFF"} style={{ marginRight: 4 }} />
          <Text style={[styles.locationText, selectedLocation === "actual" && styles.locationTextActive]}>Mi Ubicación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "ufg" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("ufg")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="school" size={16} color={selectedLocation === "ufg" ? "#000" : "#FFF"} style={{ marginRight: 4 }} />
          <Text style={[styles.locationText, selectedLocation === "ufg" && styles.locationTextActive]}>UFG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "centro" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("centro")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="business" size={16} color={selectedLocation === "centro" ? "#000" : "#FFF"} style={{ marginRight: 4 }} />
          <Text style={[styles.locationText, selectedLocation === "centro" && styles.locationTextActive]}>Centro</Text>
        </TouchableOpacity>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Lista de lugares */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderPlace}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wine-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No hay lugares en esta categoría</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", // Modo oscuro
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B35",
    gap: 10,
  },
  premiumHeaderText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
  premiumBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  locationSelector: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
    justifyContent: "space-evenly",
    gap: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3a3a3a",
    borderWidth: 1.5,
    borderColor: "#FF6B35",
    flex: 1,
    minWidth: 80,
  },
  locationButtonActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  locationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  locationTextActive: {
    color: "#000",
  },
  categoriesWrapper: {
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#3a3a3a",
    borderWidth: 1.5,
    borderColor: "#4a4a4a",
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryText: {
    color: "#CCC",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  placeCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  placeImage: {
    width: "100%",
    height: 200,
  },
  placeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  placeCategory: {
    fontSize: 14,
    color: "#FF6B35",
    marginBottom: 8,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
  },
  distance: {
    marginLeft: 5,
    fontSize: 14,
    color: "#CCC",
  },
  ageRestriction: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ageText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  // Paywall styles
  paywallContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  paywallScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingVertical: 40,
  },
  paywallContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginTop: 20,
    marginBottom: 10,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
    marginBottom: 30,
  },
  benefitsList: {
    width: "100%",
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  benefitText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 15,
  },
  planOptions: {
    width: "100%",
    marginBottom: 20,
    gap: 15,
  },
  planCard: {
    backgroundColor: "#3a3a3a",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    alignItems: "center",
    position: "relative",
  },
  planCardFeatured: {
    borderColor: "#FFD700",
    backgroundColor: "#3f3519",
  },
  planBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeFeatured: {
    backgroundColor: "#FFD700",
  },
  planBadgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
    marginBottom: 10,
  },
  planPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planPriceOld: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  planPeriod: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 5,
  },
  planSavings: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
})
