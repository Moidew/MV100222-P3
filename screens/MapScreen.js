import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { getAllRestaurants } from "../services/restaurantService"

export default function MapScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState("actual") // "actual", "ufg", "centro"

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

  // Función para calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance.toFixed(1) // Retorna distancia en km con 1 decimal
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async (locationKey = "actual") => {
    try {
      let referenceLocation

      if (locationKey === "actual") {
        // Solo mostrar loading si es la primera vez
        if (restaurants.length === 0) {
          setLoading(true)
        }

        // Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          Alert.alert(
            "Permisos de ubicación",
            "Necesitamos acceso a tu ubicación para mostrarte restaurantes cercanos"
          )
          setLoading(false)
          return
        }

        // Obtener ubicación del usuario
        const location = await Location.getCurrentPositionAsync({})
        setUserLocation(location.coords)
        referenceLocation = location.coords
      } else {
        // Usar ubicación predefinida (no mostrar loading, es instantáneo)
        referenceLocation = predefinedLocations[locationKey]
      }

      // Cargar restaurantes desde Firestore
      const restaurantsData = await getAllRestaurants()

      // Calcular distancia y agregar al objeto
      const restaurantsWithDistance = restaurantsData.map((restaurant) => {
        const distance = calculateDistance(
          referenceLocation.latitude,
          referenceLocation.longitude,
          restaurant.location.latitude,
          restaurant.location.longitude
        )

        return {
          ...restaurant,
          distance: `${distance} km`,
          distanceValue: parseFloat(distance),
        }
      })

      // Ordenar por distancia (más cercano primero)
      restaurantsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)

      setRestaurants(restaurantsWithDistance)
      setLoading(false)
    } catch (error) {
      console.error("Error cargando restaurantes:", error)
      Alert.alert("Error", "No se pudieron cargar los restaurantes")
      setLoading(false)
    }
  }

  // Manejar cambio de ubicación
  const handleLocationChange = (locationKey) => {
    setSelectedLocation(locationKey)
    loadRestaurants(locationKey)
  }

  const categories = ["Todos", "Salvadoreña", "Café", "Italiana", "Japonesa", "Americana", "Mexicana"]

  // Filtrar restaurantes por categoría
  const filteredRestaurants =
    selectedCategory === "Todos"
      ? restaurants
      : restaurants.filter((restaurant) => {
          // Debug: ver qué categorías tienen los restaurantes
          console.log(`Restaurante: ${restaurant.name}, Categoría: "${restaurant.category}", Buscando: "${selectedCategory}"`)
          return restaurant.category === selectedCategory
        })

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCategory}>{item.category}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Selector de ubicación */}
      <View style={styles.locationSelector}>
        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "actual" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("actual")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location"
            size={16}
            color={selectedLocation === "actual" ? "#FFF" : "#FF6B35"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.locationText, selectedLocation === "actual" && styles.locationTextActive]}>
            Mi Ubicación
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "ufg" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("ufg")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="school"
            size={16}
            color={selectedLocation === "ufg" ? "#FFF" : "#FF6B35"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.locationText, selectedLocation === "ufg" && styles.locationTextActive]}>UFG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.locationButton, selectedLocation === "centro" && styles.locationButtonActive]}
          onPress={() => handleLocationChange("centro")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="business"
            size={16}
            color={selectedLocation === "centro" ? "#FFF" : "#FF6B35"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.locationText, selectedLocation === "centro" && styles.locationTextActive]}>
            Centro
          </Text>
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

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No hay restaurantes en esta categoría</Text>
          </View>
        }
      />
    </View>
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
  },
  locationSelector: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#FF6B35",
    flex: 1,
    minWidth: 80,
  },
  locationButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  locationText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "600",
  },
  locationTextActive: {
    color: "#FFF",
  },
  categoriesWrapper: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    backgroundColor: "#F5F5F5",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  restaurantCard: {
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
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  distance: {
    marginLeft: 10,
    fontSize: 14,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
})
