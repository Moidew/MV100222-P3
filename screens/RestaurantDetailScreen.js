import { useState } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params
  const [isFavorite, setIsFavorite] = useState(false)

  const handleReview = () => {
    navigation.navigate("Reviews", { restaurantId: restaurant.id, restaurant: restaurant })
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: restaurant.image }} style={styles.headerImage} />

      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.category}>{restaurant.category}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? "#FF6B35" : "#999"} />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
          <Text style={styles.distance}>{restaurant.distance}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.sectionContent}>{restaurant.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.sectionContent}>
            {restaurant.description || "Excelente lugar con ambiente acogedor y servicio de calidad."}
          </Text>
        </View>

        {restaurant.priceRange && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rango de Precio</Text>
            <Text style={styles.sectionContent}>{restaurant.priceRange}</Text>
          </View>
        )}

        {restaurant.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horario</Text>
            <Text style={styles.sectionContent}>{restaurant.hours}</Text>
          </View>
        )}

        {restaurant.features && restaurant.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresContainer}>
              {restaurant.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF6B35" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {restaurant.ageRestriction && (
          <View style={styles.ageWarning}>
            <Ionicons name="warning" size={20} color="#FF6B35" />
            <Text style={styles.ageWarningText}>+{restaurant.ageRestriction} Solo mayores de {restaurant.ageRestriction} años</Text>
          </View>
        )}

        <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
          <Text style={styles.reviewButtonText}>Ver Reseñas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Alert.alert("Llamar", restaurant.phone || "+503 2999-0000")}
        >
          <Ionicons name="call-outline" size={20} color="#FFF" />
          <Text style={styles.callButtonText}>Llamar {restaurant.phone || ""}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerImage: {
    width: "100%",
    height: 250,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  category: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  distance: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  reviewButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  callButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  featureText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  ageWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B35",
    marginBottom: 20,
    gap: 8,
  },
  ageWarningText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
})
