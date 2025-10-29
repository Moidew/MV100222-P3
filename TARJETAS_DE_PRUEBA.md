# 🔧 Tarjetas de Prueba para Testing - Wompi

## Tarjetas de Testing Universales

Estas son tarjetas de prueba estándar que funcionan en la mayoría de los gateways de pago (Stripe, Wompi, PayU, etc.):

### ✅ Tarjetas que APRUEBAN el pago:

#### **Visa**
- **Número:** `4242 4242 4242 4242`
- **Fecha:** Cualquier fecha futura (ej: `12/25`, `03/26`)
- **CVV:** Cualquier 3 dígitos (ej: `123`, `456`)
- **Titular:** Cualquier nombre

#### **Visa (Internacional)**
- **Número:** `4111 1111 1111 1111`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Titular:** Cualquier nombre

#### **Mastercard**
- **Número:** `5555 5555 5555 4444`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Titular:** Cualquier nombre

#### **Mastercard (Alternativa)**
- **Número:** `5105 1051 0510 5100`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Titular:** Cualquier nombre

---

### ❌ Tarjetas que RECHAZAN el pago (para probar errores):

#### **Visa - Fondos Insuficientes**
- **Número:** `4000 0000 0000 9995`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Resultado:** Error de fondos insuficientes

#### **Visa - Declinada**
- **Número:** `4000 0000 0000 0002`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Resultado:** Pago declinado

#### **Visa - CVV Incorrecto**
- **Número:** `4000 0000 0000 0127`
- **Fecha:** Cualquier fecha futura
- **CVV:** Cualquier 3 dígitos
- **Resultado:** Error de CVV

---

## 🌐 Páginas Web con Más Tarjetas de Prueba

### 1. **Stripe Testing Cards** (Más completo)
**URL:** https://stripe.com/docs/testing

Incluye tarjetas para probar:
- Pagos exitosos
- Pagos declinados
- 3D Secure
- Diferentes países
- Diferentes errores específicos

### 2. **Wompi Docs** (Específico para Wompi Colombia)
**URL:** https://docs.wompi.co/docs/en/testeo

Tarjetas específicas de Wompi con escenarios de prueba reales.

### 3. **PayU Testing Cards** (Para Latinoamérica)
**URL:** https://developers.payulatam.com/latam/en/docs/getting-started/test-your-solution.html

Incluye tarjetas de prueba para:
- Argentina
- Brasil
- Chile
- Colombia
- México
- Perú

---

## 💡 Tips para Testing

1. **Fecha de Vencimiento:**
   - Usa cualquier fecha futura
   - Formato: `MM/AA` (ej: `12/25`, `06/28`)
   - NO uses fechas pasadas o te dará error

2. **CVV:**
   - Visa/Mastercard: 3 dígitos (ej: `123`)
   - American Express: 4 dígitos (ej: `1234`)

3. **Nombre del Titular:**
   - Cualquier nombre funciona
   - Ejemplos: `JUAN PEREZ`, `MARIA LOPEZ`, `TEST USER`

4. **Código Postal (si se requiere):**
   - USA: `12345`, `90210`
   - Internacional: Cualquier código válido

---

## 🔒 Recordatorio de Seguridad

⚠️ **NUNCA uses tarjetas reales en modo de prueba/desarrollo**

Estas tarjetas solo funcionan en:
- Entornos de desarrollo
- Modo sandbox/testing de los gateways de pago
- Demos y presentaciones

En producción, siempre debes usar tarjetas reales y credenciales de producción del gateway de pago.

---

## 📝 Para tu Proyecto FindSpot

Como estás usando una **simulación de Wompi** (no el servicio real), cualquiera de estas tarjetas funcionará porque el pago se simula con un `setTimeout` de 2 segundos.

### Tarjeta Recomendada para Demo:
```
Número: 4242 4242 4242 4242
Fecha: 12/25
CVV: 123
Titular: JUAN PEREZ
```

Esta es la tarjeta de prueba más conocida y fácil de recordar. ✨
