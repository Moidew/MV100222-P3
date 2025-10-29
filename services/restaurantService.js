import { db } from "./firebaseConfig"

// Obtener todos los restaurantes
export const getAllRestaurants = async () => {
  try {
    const snapshot = await db.collection("restaurantes").get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo restaurantes:", error)
    throw error
  }
}

// Obtener restaurantes por categoría
export const getRestaurantsByCategory = async (category) => {
  try {
    const snapshot = await db.collection("restaurantes").where("category", "==", category).get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo restaurantes por categoría:", error)
    throw error
  }
}

// Obtener detalles de un restaurante
export const getRestaurantDetail = async (restaurantId) => {
  try {
    const docSnap = await db.collection("restaurantes").doc(restaurantId).get()
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      throw new Error("Restaurante no encontrado")
    }
  } catch (error) {
    console.error("Error obteniendo detalles del restaurante:", error)
    throw error
  }
}

// Agregar restaurante a favoritos
export const addToFavorites = async (userId, restaurantId) => {
  try {
    await db.collection("favoritos").add({
      userId,
      restaurantId,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error agregando a favoritos:", error)
    throw error
  }
}

// Obtener favoritos del usuario
export const getUserFavorites = async (userId) => {
  try {
    const snapshot = await db.collection("favoritos").where("userId", "==", userId).get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo favoritos:", error)
    throw error
  }
}
