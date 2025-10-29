import { db } from "./firebaseConfig"

// Obtener reseñas de un restaurante
export const getRestaurantReviews = async (restaurantId) => {
  try {
    const snapshot = await db
      .collection("resenas")
      .where("restaurantId", "==", restaurantId)
      .orderBy("createdAt", "desc")
      .get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo reseñas:", error)
    throw error
  }
}

// Agregar nueva reseña
export const addReview = async (restaurantId, userId, rating, comment, userName) => {
  try {
    const docRef = await db.collection("resenas").add({
      restaurantId,
      userId,
      rating,
      comment,
      userName,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error agregando reseña:", error)
    throw error
  }
}

// Obtener promedio de calificación
export const getAverageRating = async (restaurantId) => {
  try {
    const reviews = await getRestaurantReviews(restaurantId)
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  } catch (error) {
    console.error("Error calculando promedio:", error)
    throw error
  }
}
