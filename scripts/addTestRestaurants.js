// Script para agregar restaurantes de prueba a Firestore
// Ejecutar con: node scripts/addTestRestaurants.js

const firebase = require("firebase/compat/app")
require("firebase/compat/firestore")

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZPITiMvi51L9QktYBTgsHh9itIee1r-s",
  authDomain: "findspot-318f6.firebaseapp.com",
  projectId: "findspot-318f6",
  storageBucket: "findspot-318f6.firebasestorage.app",
  messagingSenderId: "526159753501",
  appId: "1:526159753501:web:6129e87f419cc5395bf1f4",
}

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const db = firebase.firestore()

// Restaurantes de prueba
const restaurants = [
  {
    name: "Restaurante UFG Campus",
    category: "Salvadoreña",
    description: "Comida típica salvadoreña cerca de la Universidad Francisco Gavidia",
    address: "Calle el Progreso, San Salvador",
    phone: "+503 2222-1111",
    rating: 4.5,
    priceRange: "$$",
    location: {
      latitude: 13.6929,
      longitude: -89.2182,
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    hours: "Lun-Vie: 7:00 AM - 8:00 PM, Sáb-Dom: 8:00 AM - 6:00 PM",
    features: ["WiFi", "Estacionamiento", "Terraza"],
    createdAt: new Date(),
  },
  {
    name: "Café Centro Histórico",
    category: "Café",
    description: "Café artesanal en el corazón del Centro Histórico de San Salvador",
    address: "Avenida Cuscatlán, Centro Histórico, San Salvador",
    phone: "+503 2333-2222",
    rating: 4.7,
    priceRange: "$",
    location: {
      latitude: 13.6989,
      longitude: -89.1914,
    },
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
    hours: "Lun-Dom: 6:00 AM - 9:00 PM",
    features: ["WiFi", "Aire Acondicionado", "Postres"],
    createdAt: new Date(),
  },
]

// Función para agregar restaurantes
async function addRestaurants() {
  console.log("🚀 Agregando restaurantes de prueba...")

  try {
    for (const restaurant of restaurants) {
      const docRef = await db.collection("restaurantes").add(restaurant)
      console.log(`✅ Restaurante agregado: ${restaurant.name} (ID: ${docRef.id})`)
    }

    console.log("\n✅ ¡Todos los restaurantes fueron agregados exitosamente!")
    console.log("\n📍 Ubicaciones:")
    console.log("- UFG: 13.6929° N, 89.2182° W")
    console.log("- Centro Histórico: 13.6989° N, 89.1914° W")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error agregando restaurantes:", error)
    process.exit(1)
  }
}

addRestaurants()
