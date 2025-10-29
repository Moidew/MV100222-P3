import { db } from "./firebaseConfig"

// Obtener todos los lugares nocturnos
export const getNightLifePlaces = async () => {
  try {
    const snapshot = await db.collection("nightlife").get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo lugares nocturnos:", error)
    throw error
  }
}

// Obtener lugares por categoría
export const getNightLifePlacesByCategory = async (category) => {
  try {
    const snapshot = await db.collection("nightlife").where("category", "==", category).get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo lugares por categoría:", error)
    throw error
  }
}

// Obtener detalles de un lugar
export const getNightLifePlaceDetail = async (placeId) => {
  try {
    const docSnap = await db.collection("nightlife").doc(placeId).get()
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      throw new Error("Lugar no encontrado")
    }
  } catch (error) {
    console.error("Error obteniendo detalles del lugar:", error)
    throw error
  }
}
