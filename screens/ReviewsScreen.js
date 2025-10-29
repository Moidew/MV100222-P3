import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function ReviewsScreen({ route, navigation }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const { restaurant } = route.params || {}

  // Detectar si es lugar nocturno (tiene ageRestriction o es categoría +18)
  const isNightLife = restaurant?.ageRestriction ||
                      ["Bares", "Clubs", "Discos", "Lounges", "Strip Clubs"].includes(restaurant?.category)

  // Reseñas para restaurantes normales
  const restaurantReviews = [
    {
      id: 1,
      author: "María García",
      rating: 5,
      comment: "Excelente comida y muy buen servicio. Volveré pronto.",
      date: "Hace 2 días",
    },
    {
      id: 2,
      author: "Carlos López",
      rating: 4,
      comment: "Muy bueno, aunque un poco caro.",
      date: "Hace 1 semana",
    },
    {
      id: 3,
      author: "Ana Martínez",
      rating: 5,
      comment: "Platillos deliciosos y ambiente familiar. Recomendado 100%",
      date: "Hace 2 semanas",
    },
  ]

  // Reseñas específicas según categoría de lugar +18
  const getReviewsByCategory = () => {
    const category = restaurant?.category

    // Reseñas para BARES
    if (category === "Bares") {
      return [
        {
          id: 1,
          author: "Diego R.",
          rating: 5,
          comment: "Los mejores tragos de San Salvador! El bartender es un artista. Ambiente perfecto para relajarse después del trabajo 🍺",
          date: "Hace 1 día",
        },
        {
          id: 2,
          author: "Andrea V.",
          rating: 5,
          comment: "Happy hour increíble, 2x1 en cervezas artesanales. La terraza tiene una vista espectacular y la música está perfecta",
          date: "Hace 3 días",
        },
        {
          id: 3,
          author: "Mauricio C.",
          rating: 4,
          comment: "Excelente selección de whisky y la atención es de primera. Un poco caro pero vale cada centavo",
          date: "Hace 5 días",
        },
        {
          id: 4,
          author: "Carolina M.",
          rating: 5,
          comment: "Vine con mi novio y nos encantó! Música en vivo los viernes, cócteles premium y buen ambiente. Volveremos seguro",
          date: "Hace 1 semana",
        },
      ]
    }

    // Reseñas para CLUBS/DISCOS
    if (category === "Clubs" || category === "Discos") {
      return [
        {
          id: 1,
          author: "Roberto M.",
          rating: 5,
          comment: "EL MEJOR CLUB DE SV! 🔥 DJ increíble, sonido brutal y las luces están de otro nivel. Bailé toda la noche sin parar!",
          date: "Hace 1 día",
        },
        {
          id: 2,
          author: "Sofía P.",
          rating: 5,
          comment: "Ladies night espectacular! Tragos gratis hasta las 12 y nos trataron como reinas. El reggaeton estuvo 🔥🔥🔥",
          date: "Hace 2 días",
        },
        {
          id: 3,
          author: "Luis E.",
          rating: 4,
          comment: "Muy bueno, la música EDM está brutal. Mesa VIP worth it. Solo le bajo una estrella por la fila para entrar",
          date: "Hace 4 días",
        },
        {
          id: 4,
          author: "Daniela S.",
          rating: 5,
          comment: "Celebré mi cumple aquí y fue ÉPICO! Servicio de botella excelente, el DJ dedicó canciones y el ambiente increíble 🎉",
          date: "Hace 1 semana",
        },
        {
          id: 5,
          author: "Alejandro G.",
          rating: 5,
          comment: "Top tier! Sistema de sonido profesional, efectos visuales impresionantes. Si te gusta el EDM, este es TU lugar",
          date: "Hace 2 semanas",
        },
      ]
    }

    // Reseñas para LOUNGES
    if (category === "Lounges") {
      return [
        {
          id: 1,
          author: "Patricia R.",
          rating: 5,
          comment: "Ambiente sofisticado y elegante. Perfecto para conversaciones íntimas. Los cócteles son arte líquido 🍸",
          date: "Hace 2 días",
        },
        {
          id: 2,
          author: "Javier M.",
          rating: 5,
          comment: "Excelente para citas o reuniones de negocios. Jazz en vivo increíble, carta de vinos espectacular y servicio impecable",
          date: "Hace 4 días",
        },
        {
          id: 3,
          author: "Melissa T.",
          rating: 4,
          comment: "Ambiente exclusivo y relajado. La shisha está deliciosa y los sofás súper cómodos. Un poco caro pero vale la pena",
          date: "Hace 1 semana",
        },
        {
          id: 4,
          author: "Eduardo L.",
          rating: 5,
          comment: "El mejor lounge de San Salvador sin duda. Mixología de nivel mundial y atención VIP. Totalmente recomendado 👌",
          date: "Hace 1 semana",
        },
      ]
    }

    // Reseñas para STRIP CLUBS
    if (category === "Strip Clubs") {
      return [
        {
          id: 1,
          author: "Andrés K.",
          rating: 5,
          comment: "Shows de nivel internacional, muy profesional todo. Ambiente elegante y discreto. Excelente para despedidas de soltero",
          date: "Hace 3 días",
        },
        {
          id: 2,
          author: "Miguel A.",
          rating: 4,
          comment: "Buen lugar, salas VIP privadas muy cómodas. Servicio de botella premium. Un poco caro pero la experiencia lo vale",
          date: "Hace 1 semana",
        },
        {
          id: 3,
          author: "Fernando R.",
          rating: 5,
          comment: "El más exclusivo de Centroamérica. Shows artísticos de clase mundial, seguridad top y atención de primera 💎",
          date: "Hace 2 semanas",
        },
        {
          id: 4,
          author: "Ricardo V.",
          rating: 5,
          comment: "Ambiente de lujo, champagne bar increíble. Las bailarinas son profesionales y todo muy respetuoso. Recomendado",
          date: "Hace 3 semanas",
        },
      ]
    }

    // Default para otros lugares +18
    return [
      {
        id: 1,
        author: "Diego R.",
        rating: 5,
        comment: "Increíble ambiente, la música estuvo brutal y el servicio de primera. Definitivamente el mejor lugar para salir en San Salvador 🔥",
        date: "Hace 1 día",
      },
      {
        id: 2,
        author: "Sofía M.",
        rating: 5,
        comment: "Vine con mis amigas y nos trataron como VIPs. Los cócteles son de otro nivel y el DJ estuvo espectacular toda la noche!",
        date: "Hace 3 días",
      },
      {
        id: 3,
        author: "Ricardo P.",
        rating: 4,
        comment: "Muy bueno, ambiente exclusivo y seguridad top. Solo que es un poco caro, pero vale la pena para ocasiones especiales.",
        date: "Hace 1 semana",
      },
      {
        id: 4,
        author: "Valeria S.",
        rating: 5,
        comment: "El mejor lugar para celebrar! Reservé mesa VIP para mi cumpleaños y la pasamos increíble. Super recomendado 🎉",
        date: "Hace 1 semana",
      },
    ]
  }

  const mockReviews = isNightLife ? getReviewsByCategory() : restaurantReviews

  const handleSubmitReview = () => {
    if (rating === 0 || !comment.trim()) {
      Alert.alert("Error", "Por favor completa la reseña")
      return
    }
    Alert.alert("Éxito", "Tu reseña ha sido publicada")
    setRating(0)
    setComment("")
  }

  const renderStars = (value, onPress) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onPress(star)}>
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={28}
            color={star <= value ? "#FFB800" : "#DDD"}
          />
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <ScrollView style={[styles.container, isNightLife && styles.containerDark]}>
      <View style={[styles.header, isNightLife && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={isNightLife ? "#FFD700" : "#FF6B35"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isNightLife && styles.headerTitleDark]}>Reseñas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.section, isNightLife && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isNightLife && styles.sectionTitleDark]}>Escribe tu reseña</Text>

        <Text style={[styles.label, isNightLife && styles.labelDark]}>Calificación</Text>
        {renderStars(rating, setRating)}

        <Text style={[styles.label, isNightLife && styles.labelDark]}>Comentario</Text>
        <TextInput
          style={[styles.commentInput, isNightLife && styles.commentInputDark]}
          placeholder="Cuéntanos tu experiencia..."
          placeholderTextColor={isNightLife ? "#999" : "#AAA"}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity style={[styles.submitButton, isNightLife && styles.submitButtonDark]} onPress={handleSubmitReview}>
          <Text style={styles.submitButtonText}>Publicar Reseña</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, isNightLife && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isNightLife && styles.sectionTitleDark]}>Reseñas Recientes</Text>

        {mockReviews.map((review) => (
          <View key={review.id} style={[styles.reviewCard, isNightLife && styles.reviewCardDark]}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewAuthor, isNightLife && styles.reviewAuthorDark]}>{review.author}</Text>
              <Text style={[styles.reviewDate, isNightLife && styles.reviewDateDark]}>{review.date}</Text>
            </View>

            <View style={styles.reviewStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < review.rating ? "star" : "star-outline"}
                  size={16}
                  color={i < review.rating ? (isNightLife ? "#FFD700" : "#FFB800") : (isNightLife ? "#555" : "#DDD")}
                />
              ))}
            </View>

            <Text style={[styles.reviewComment, isNightLife && styles.reviewCommentDark]}>{review.comment}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewStars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Dark mode styles for NightLife +18
  containerDark: {
    backgroundColor: "#1a1a1a",
  },
  headerDark: {
    backgroundColor: "#2a2a2a",
    borderBottomColor: "#3a3a3a",
  },
  headerTitleDark: {
    color: "#FFD700",
  },
  sectionDark: {
    backgroundColor: "#2a2a2a",
  },
  sectionTitleDark: {
    color: "#FFD700",
  },
  labelDark: {
    color: "#FFF",
  },
  commentInputDark: {
    backgroundColor: "#1a1a1a",
    borderColor: "#444",
    color: "#FFF",
  },
  submitButtonDark: {
    backgroundColor: "#FFD700",
  },
  reviewCardDark: {
    backgroundColor: "#1a1a1a",
    borderLeftColor: "#FFD700",
  },
  reviewAuthorDark: {
    color: "#FFD700",
  },
  reviewDateDark: {
    color: "#999",
  },
  reviewCommentDark: {
    color: "#CCC",
  },
})
