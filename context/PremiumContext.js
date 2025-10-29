import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"
import { db } from "../services/firebaseConfig"

export const PremiumContext = createContext()

export const PremiumProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState(null)

  useEffect(() => {
    if (user) {
      checkPremiumStatus()
    } else {
      setIsPremium(false)
      setLoading(false)
    }
  }, [user])

  const checkPremiumStatus = async () => {
    try {
      const docSnap = await db.collection("subscriptions").doc(user.uid).get()

      if (docSnap.exists) {
        const data = docSnap.data()
        const now = new Date()
        const expiresAt = data.expiresAt.toDate()

        // Verificar si la suscripción está activa
        if (data.status === "active" && expiresAt > now) {
          setIsPremium(true)
          setSubscriptionData(data)
        } else {
          setIsPremium(false)
          setSubscriptionData(null)
        }
      } else {
        setIsPremium(false)
        setSubscriptionData(null)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error verificando premium:", error)
      setIsPremium(false)
      setLoading(false)
    }
  }

  const activatePremium = async (planType = "monthly") => {
    try {
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Calcular fecha de expiración
      const now = new Date()
      let expiresAt = new Date()

      if (planType === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      } else if (planType === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      }

      const subscriptionInfo = {
        userId: user.uid,
        userEmail: user.email,
        status: "active",
        planType: planType,
        price: planType === "monthly" ? 1.99 : 19.99,
        currency: "USD",
        startedAt: now,
        expiresAt: expiresAt,
        paymentMethod: "wompi_simulation",
        autoRenew: true,
        createdAt: now,
      }

      // Guardar en Firestore
      await db.collection("subscriptions").doc(user.uid).set(subscriptionInfo)

      setIsPremium(true)
      setSubscriptionData(subscriptionInfo)

      return true
    } catch (error) {
      console.error("Error activando premium:", error)
      throw error
    }
  }

  const cancelPremium = async () => {
    try {
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      await db.collection("subscriptions").doc(user.uid).update({
        status: "cancelled",
        autoRenew: false,
        cancelledAt: new Date(),
      })

      // Refrescar estado
      await checkPremiumStatus()

      return true
    } catch (error) {
      console.error("Error cancelando premium:", error)
      throw error
    }
  }

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        loading,
        subscriptionData,
        activatePremium,
        cancelPremium,
        checkPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  )
}
