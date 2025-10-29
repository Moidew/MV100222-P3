import { useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function WompiPaymentModal({ visible, onClose, onSuccess, planType = "monthly" }) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [processing, setProcessing] = useState(false)

  const planDetails = {
    monthly: {
      price: "$1.99",
      originalPrice: "$2.99",
      description: "Suscripción mensual",
      savings: "Ahorra $1.00",
      promo: "🎉 Primer mes - Oferta especial",
    },
    yearly: {
      price: "$19.99",
      originalPrice: "$23.88",
      description: "Suscripción anual",
      savings: "Ahorra $3.89",
      promo: "💎 Mejor oferta - 2 meses gratis",
    },
  }

  const plan = planDetails[planType]

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "")
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(" ") : cleaned
  }

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\//g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handlePayment = async () => {
    // Validaciones básicas
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Error", "Número de tarjeta inválido")
      return
    }

    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert("Error", "Fecha de expiración inválida")
      return
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert("Error", "CVV inválido")
      return
    }

    if (!cardHolder) {
      Alert.alert("Error", "Ingresa el nombre del titular")
      return
    }

    setProcessing(true)

    // Simular proceso de pago (2 segundos)
    setTimeout(() => {
      setProcessing(false)
      onSuccess(planType)
      handleClose()

      Alert.alert(
        "🎉 ¡Pago exitoso!",
        `Bienvenido a NightLife Premium\n\nPlan: ${plan.description}\nMonto: ${plan.price}/mes\n\nTu suscripción está activa.`,
        [{ text: "¡Genial!" }]
      )
    }, 2000)
  }

  const handleClose = () => {
    setCardNumber("")
    setExpiryDate("")
    setCvv("")
    setCardHolder("")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: "https://firebasestorage.googleapis.com/v0/b/wompi-logos/o/wompi-logo.png?alt=media" }}
              style={styles.logo}
              defaultSource={require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf")}
            />
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Plan info */}
          <View style={styles.planInfo}>
            <Text style={styles.promoText}>{plan.promo}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
              <Text style={styles.currentPrice}>{plan.price}</Text>
              <Text style={styles.period}>/{planType === "monthly" ? "mes" : "año"}</Text>
            </View>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Número de tarjeta</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                editable={!processing}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Vencimiento</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    editable={!processing}
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={cvv}
                    onChangeText={setCvv}
                    editable={!processing}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Titular de la tarjeta</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="NOMBRE APELLIDO"
                autoCapitalize="characters"
                value={cardHolder}
                onChangeText={setCardHolder}
                editable={!processing}
              />
            </View>
          </View>

          {/* Payment button */}
          <TouchableOpacity
            style={[styles.payButton, processing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.payButtonText}>Pagar {plan.price} - Wompi</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security info */}
          <View style={styles.securityInfo}>
            <Ionicons name="lock-closed" size={16} color="#666" />
            <Text style={styles.securityText}>Pago seguro procesado por Wompi</Text>
          </View>

          <Text style={styles.disclaimer}>
            * Esta es una simulación de pago. En producción se procesaría con Wompi real.
          </Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  closeButton: {
    padding: 5,
  },
  planInfo: {
    backgroundColor: "#FFF5F2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    alignItems: "center",
  },
  promoText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 20,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  currentPrice: {
    fontSize: 32,
    color: "#FF6B35",
    fontWeight: "bold",
  },
  period: {
    fontSize: 16,
    color: "#666",
  },
  savingsText: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  securityInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    gap: 5,
  },
  securityText: {
    fontSize: 12,
    color: "#666",
  },
  disclaimer: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
})
