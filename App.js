import React, { useContext } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { AuthProvider, AuthContext } from "./context/AuthContext"
import { ThemeProvider, ThemeContext } from "./context/ThemeContext"
import { PremiumProvider } from "./context/PremiumContext"
import { db } from "./services/firebaseConfig"

// Pantallas
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import OTPVerificationScreen from "./screens/OTPVerificationScreen"
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen"
import ResetPasswordOTPScreen from "./screens/ResetPasswordOTPScreen"
import NewPasswordScreen from "./screens/NewPasswordScreen"
import MapScreen from "./screens/MapScreen"
import NightModeScreen from "./screens/NightModeScreen"
import RestaurantDetailScreen from "./screens/RestaurantDetailScreen"
import ProfileScreen from "./screens/ProfileScreen"
import ReviewsScreen from "./screens/ReviewsScreen"
import RecommendationsScreen from "./screens/RecommendationsScreen"
import AIChatScreen from "./screens/AIChatScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Navegación de autenticación
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordOTP" component={ResetPasswordOTPScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  )
}

// Navegación principal (después de login)
function MainTabs() {
  const { theme } = useContext(ThemeContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === "Map") {
            iconName = focused ? "restaurant" : "restaurant-outline"
          } else if (route.name === "NightLife") {
            iconName = focused ? "moon" : "moon-outline"
          } else if (route.name === "Recommendations") {
            iconName = focused ? "sparkles" : "sparkles-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerShown: true,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: "Restaurantes" }} />
      <Tab.Screen
        name="NightLife"
        component={NightModeScreen}
        options={{
          title: "NightLife +18",
          tabBarBadge: "🔥",
          tabBarBadgeStyle: { backgroundColor: "transparent" },
        }}
      />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: "Recomendaciones" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Mi Perfil" }} />
    </Tab.Navigator>
  )
}

// Stack para detalles (se superpone sobre tabs)
function RootStack() {
  const { user, loading } = useContext(AuthContext)
  const [emailVerified, setEmailVerified] = React.useState(null)

  // Escuchar cambios en tiempo real del estado de verificación
  React.useEffect(() => {
    if (user) {
      console.log("👂 Escuchando cambios de verificación para:", user.uid)

      // Listener en tiempo real de Firestore
      const unsubscribe = db
        .collection("users")
        .doc(user.uid)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              const isVerified = doc.data().emailVerified
              console.log(`📊 Estado de verificación actualizado: ${isVerified}`)
              setEmailVerified(isVerified)
            }
          },
          (error) => {
            console.error("Error escuchando verificación:", error)
          }
        )

      // Cleanup al desmontar
      return () => {
        console.log("🔇 Deteniendo listener de verificación")
        unsubscribe()
      }
    } else {
      setEmailVerified(null)
    }
  }, [user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user && emailVerified ? (
        // Usuario autenticado Y verificado
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ animationEnabled: false }} />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: "Detalles" }} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Reseñas" }} />
            <Stack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={{
                title: "Chat con IA",
                headerShown: false,
                presentation: "card"
              }}
            />
          </Stack.Group>
        </>
      ) : (
        // Usuario NO autenticado O autenticado pero NO verificado
        <Stack.Screen name="Auth" component={AuthStack} options={{ animationEnabled: false }} />
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PremiumProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </PremiumProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
})
