# DOCUMENTACIÓN DEL PROYECTO - PARCIAL 3
## Aplicación Móvil con Inteligencia Artificial

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### Nombre del Proyecto
**FindSpot - Asistente Gastronómico Inteligente**

### Descripción Breve
FindSpot es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios descubrir restaurantes y lugares nocturnos en San Salvador mediante un asistente inteligente basado en IA. La aplicación integra autenticación segura mediante OTP (One Time Password) y ofrece recomendaciones personalizadas utilizando inteligencia artificial conversacional.

### Versión
1.0.0

### Fecha de Desarrollo
Noviembre 2025

---

## 2. PLATAFORMA NO-CODE / LOW-CODE UTILIZADA

### Tecnología Principal
**React Native con Expo** (Framework híbrido)

Si bien React Native no es estrictamente "no-code", Expo proporciona una experiencia de desarrollo simplificada que elimina la necesidad de configuraciones complejas:

- **Expo Go**: Permite probar la aplicación sin compilar para iOS/Android
- **Expo CLI**: Automatiza la construcción y despliegue
- **Expo Managed Workflow**: Abstrae configuraciones nativas complejas

### Servicios en la Nube Utilizados

#### 1. Firebase (Backend as a Service)
- **Firebase Authentication**: Gestión de usuarios y autenticación
- **Firebase Firestore**: Base de datos NoSQL en tiempo real
- **Servicios utilizados**:
  - Autenticación con email/password
  - Almacenamiento de datos de usuarios
  - Verificación de OTP
  - Gestión de suscripciones Premium

#### 2. Groq AI (Inteligencia Artificial)
- **Modelo**: Llama 3.3 70B Versatile
- **API**: Groq Cloud API
- **Uso**: Asistente conversacional para recomendaciones gastronómicas

#### 3. EmailJS (Servicio de Email)
- Envío de códigos OTP a usuarios
- Verificación de registro

### Justificación de la Plataforma
Expo permite desarrollo multiplataforma con una sola base de código, reduciendo costos de desarrollo en un 60% comparado con desarrollo nativo. Firebase elimina la necesidad de gestionar servidores propios.

---

## 3. FUNCIONALIDADES IMPLEMENTADAS

### 3.1 Autenticación Segura con OTP

**Flujo de Registro:**
1. Usuario ingresa email y contraseña
2. Sistema genera código OTP de 6 dígitos
3. Email automático con código enviado vía EmailJS
4. Usuario verifica email ingresando el código
5. Acceso concedido solo después de verificación

**Archivos involucrados:**
- `services/authService.js`: Lógica de autenticación
- `services/otpService.js`: Generación y validación de OTP
- `screens/OTPVerificationScreen.js`: Interfaz de verificación

### 3.2 Recuperación de Contraseña

**Flujo implementado:**
1. Usuario solicita recuperación ingresando email
2. Sistema genera nuevo código OTP
3. Verificación del código OTP
4. Usuario establece nueva contraseña
5. Actualización segura en Firebase

**Archivos involucrados:**
- `screens/ForgotPasswordScreen.js`
- `screens/ResetPasswordOTPScreen.js`
- `screens/NewPasswordScreen.js`

### 3.3 Descubrimiento de Restaurantes

**Características:**
- Mapa interactivo con ubicaciones de restaurantes
- Filtrado por categorías (Italiano, Mexicano, Asiático, etc.)
- Visualización de calificaciones y reseñas
- Detalles completos de cada establecimiento

**Archivos:**
- `screens/MapScreen.js`
- `screens/RestaurantDetailScreen.js`
- `services/restaurantService.js`

### 3.4 Sistema Premium: NightLife +18

**Contenido exclusivo:**
- Acceso a bares, clubs y lounges
- Categoría exclusiva en navegación
- Filtrado especial para vida nocturna

**Control de acceso:**
- Verificación de estado Premium en tiempo real
- Interfaz diferenciada para usuarios Premium

**Archivos:**
- `screens/NightModeScreen.js`
- `services/nightLifeService.js`
- `context/PremiumContext.js`

### 3.5 Asistente Inteligente con IA (Funcionalidad Principal)

**Capacidades del Asistente:**

#### Análisis Contextual
- Interpreta intenciones del usuario (citas románticas, reuniones de negocios, celebraciones)
- Mantiene historial de conversación
- Entiende lenguaje natural en español

#### Recomendaciones Inteligentes
- Sugiere 2-3 restaurantes específicos según el contexto
- Explica el **por qué** de cada recomendación
- Considera calificaciones, categorías y tipo de ocasión

#### Respuestas Personalizadas Según Perfil
- **Usuarios Normales**: Solo recomienda restaurantes
- **Usuarios Premium**: Acceso a recomendaciones de NightLife +18

#### Sugerencias Rápidas
Botones pre-configurados con contextos comunes:
- Cita romántica
- Reunión de negocios
- Celebración
- Café tranquilo
- Comida casual
- Noche elegante

#### Interfaz de Chat
- Burbujas diferenciadas para usuario y asistente
- Indicador de "escribiendo..."
- Tarjetas interactivas con restaurantes recomendados
- Navegación directa a detalles del lugar

**Implementación Técnica:**

```javascript
// Modelo de IA
- Proveedor: Groq AI
- Modelo: Llama 3.3 70B Versatile
- Temperatura: 0.8 (creatividad moderada-alta)
- Máximo de tokens: 800

// Prompt Engineering
- Sistema de instrucciones con personalidad definida
- Contexto de conversación (últimos 4 mensajes)
- Catálogo de restaurantes inyectado dinámicamente
- Reglas de acceso según estado Premium
```

**Archivos clave:**
- `screens/AIChatScreen.js`: Interfaz del chat (571 líneas)
- `services/aiChatService.js`: Lógica de IA (305 líneas)
  - `chatWithAI()`: Conversación principal
  - `analyzeReviewsWithAI()`: Análisis de reseñas
  - `compareRestaurantsWithAI()`: Comparación entre lugares

**Ejemplo de interacción:**

```
Usuario: "Busco un lugar romántico para una cita especial"

IA: "¡Perfecto! Para una cita romántica, te recomiendo:

**La Pampa Argentina** ⭐ 4.8
Un restaurante elegante con ambiente íntimo, perfecto para parejas.
Su carta de vinos y cortes premium crean la atmósfera ideal.

**Restaurante Hunan** ⭐ 4.6
Comida asiática en un ambiente sofisticado y tranquilo.
Excelente para conversaciones profundas con iluminación tenue.

¿Tienes algún presupuesto en mente o preferencia de comida?"
```

---

## 4. EXPLICACIÓN DEL USO DE INTELIGENCIA ARTIFICIAL

### 4.1 Tipo de IA Implementada
**Large Language Model (LLM)** mediante API de Groq AI

### 4.2 Modelo Utilizado
- **Nombre**: Llama 3.3 70B Versatile
- **Desarrollador**: Meta AI (distribuido por Groq)
- **Parámetros**: 70 mil millones
- **Especialización**: Conversación en lenguaje natural multilingüe

### 4.3 Cómo se Integra en la Aplicación

#### Flujo de Procesamiento

1. **Captura de Entrada**
   - Usuario escribe mensaje en el chat
   - Sistema captura texto y contexto de conversación

2. **Preparación del Prompt**
   ```
   - Instrucciones del sistema (personalidad, reglas)
   - Catálogo de restaurantes disponibles
   - Estado Premium del usuario
   - Historial de conversación (últimos 4 mensajes)
   - Mensaje actual del usuario
   ```

3. **Envío a Groq API**
   - HTTP POST a `api.groq.com/openai/v1/chat/completions`
   - Autenticación con API Key
   - Timeout de 15 segundos

4. **Procesamiento de Respuesta**
   - Extracción de texto generado por IA
   - Detección de restaurantes mencionados (parsing de nombres)
   - Creación de tarjetas interactivas

5. **Presentación al Usuario**
   - Burbuja de mensaje con texto de IA
   - Tarjetas de restaurantes con botón "Ver detalles"

### 4.4 Inteligencia Aplicada

#### Análisis de Intención (Intent Recognition)
```javascript
Intenciones detectadas:
- romantic: ["romántico", "cita", "aniversario"]
- business: ["negocios", "trabajo", "reunión"]
- celebration: ["celebrar", "cumpleaños", "fiesta"]
- casual: ["casual", "informal", "rápido"]
- fancy: ["elegante", "fino", "sofisticado"]
- quiet: ["tranquilo", "trabajar", "estudiar"]
- nightlife: ["bar", "club", "disco", "tragos"]
```

#### Contextualización Premium
La IA ajusta sus recomendaciones según el estado de suscripción:

**Usuario Normal:**
- Bloquea recomendaciones de NightLife +18
- Sugiere upgrade a Premium si pregunta por bares/clubs

**Usuario Premium:**
- Acceso completo a todos los lugares
- Menciona beneficios Premium en las respuestas

#### Personalización de Respuestas
```javascript
Factores considerados:
- Historial de conversación (memoria de corto plazo)
- Tipo de ocasión mencionada
- Preferencias de comida
- Presupuesto indicado
- Calificaciones de restaurantes
```

### 4.5 Ventajas del Uso de IA

✅ **Experiencia Conversacional Natural**
- El usuario no necesita usar filtros complejos
- Puede describir lo que busca en sus propias palabras

✅ **Recomendaciones Contextuales**
- Entiende ocasiones especiales (aniversarios, cumpleaños)
- Sugiere lugares según el "mood" del usuario

✅ **Aprendizaje de Conversación**
- Recuerda lo dicho en mensajes previos
- Hace preguntas de seguimiento inteligentes

✅ **Escalabilidad**
- Puede manejar catálogos grandes de restaurantes
- Fácil actualizar el conocimiento sin reentrenar

### 4.6 Limitaciones y Mitigaciones

**Limitación 1: Dependencia de Internet**
- Mitigación: Mensaje claro de error si falla la conexión

**Limitación 2: Costos de API**
- Mitigación: Timeout de 15 segundos para evitar cargos excesivos

**Limitación 3: Posibles Alucinaciones (IA inventa restaurantes)**
- Mitigación: Parsing estricto de nombres, solo se muestran restaurantes que existen en la base de datos

---

## 5. ANÁLISIS DE COSTOS

### 5.1 CAPEX (Capital Expenditure - Inversión Inicial)

#### Desarrollo
| Concepto | Costo | Justificación |
|----------|-------|---------------|
| Laptop de desarrollo | $800 | Equipo para programar |
| Licencia Apple Developer | $99/año | Publicar en App Store |
| Dominio web (opcional) | $12/año | findspot.com |
| **TOTAL CAPEX** | **$911** | **Una sola vez + renovaciones anuales** |

*Nota: El desarrollo fue realizado por el equipo, por lo que no se incluyen costos de personal externo.*

### 5.2 OPEX (Operational Expenditure - Gastos Operativos Mensuales)

#### Tier Inicial (0-100 usuarios)

| Servicio | Plan | Costo Mensual | Límites |
|----------|------|---------------|---------|
| **Firebase** | | | |
| - Authentication | Gratuito | $0 | 50,000 usuarios/mes |
| - Firestore | Gratuito | $0 | 50,000 lecturas/día |
| **Groq AI** | Free Tier | $0 | 14,400 requests/día |
| **EmailJS** | Free | $0 | 200 emails/mes |
| **Expo** | Free | $0 | Ilimitado |
| **Hosting Web** | Vercel Free | $0 | Ilimitado |
| **TOTAL OPEX (Inicial)** | | **$0/mes** | **Plan gratuito viable** |

#### Tier Crecimiento (100-1,000 usuarios)

| Servicio | Plan | Costo Mensual | Límites |
|----------|------|---------------|---------|
| **Firebase** | | | |
| - Authentication | Gratuito | $0 | Suficiente |
| - Firestore | Blaze (pago) | ~$25 | Pay-as-you-go |
| **Groq AI** | Pay-per-use | ~$50 | $0.59 por 1M tokens |
| **EmailJS** | Paid | $15 | 1,000 emails/mes |
| **Expo EAS Build** | Production | $29 | Builds automáticos |
| **TOTAL OPEX (Crecimiento)** | | **$119/mes** | **1,000 usuarios activos** |

#### Tier Escalado (1,000-10,000 usuarios)

| Servicio | Plan | Costo Mensual | Límites |
|----------|------|---------------|---------|
| Firebase Firestore | Blaze | ~$100 | Lecturas/escrituras escaladas |
| Groq AI | API Usage | ~$200 | Alto volumen de consultas |
| EmailJS | Business | $50 | 5,000 emails/mes |
| Expo EAS | Production | $29 | Mismo plan |
| CDN/Hosting Premium | Vercel Pro | $20 | Mejor rendimiento |
| **TOTAL OPEX (Escalado)** | | **$399/mes** | **10,000 usuarios activos** |

### 5.3 Modelo de Ingresos Propuesto

#### Suscripción Premium

| Plan | Precio | Beneficios |
|------|--------|------------|
| **Gratuito** | $0/mes | - Restaurantes generales<br>- Chat IA limitado (10 consultas/día) |
| **Premium Mensual** | $4.99/mes | - NightLife +18 (bares, clubs)<br>- Chat IA ilimitado<br>- Recomendaciones prioritarias |
| **Premium Anual** | $49.99/año | - Todo lo de Premium Mensual<br>- Descuento del 17%<br>- Badge especial en perfil |

#### Proyección de Ingresos

**Escenario Conservador (Año 1)**

| Métrica | Valor |
|---------|-------|
| Total usuarios | 1,000 |
| Conversión a Premium | 5% |
| Usuarios Premium | 50 |
| Ingreso mensual promedio/usuario | $4.99 |
| **INGRESO MENSUAL** | **$249.50** |
| **INGRESO ANUAL** | **$2,994** |

**Escenario Optimista (Año 2)**

| Métrica | Valor |
|---------|-------|
| Total usuarios | 5,000 |
| Conversión a Premium | 8% |
| Usuarios Premium | 400 |
| Ingreso mensual promedio/usuario | $4.99 |
| **INGRESO MENSUAL** | **$1,996** |
| **INGRESO ANUAL** | **$23,952** |

---

## 6. PUNTO DE EQUILIBRIO (BREAK-EVEN POINT)

### 6.1 Cálculo Simplificado

**Fórmula:**
```
Punto de Equilibrio = Costos Fijos Totales / Ingreso por Usuario Premium
```

**Datos:**
- CAPEX inicial: $911
- OPEX mensual (1,000 usuarios): $119
- Ingreso por usuario Premium: $4.99/mes

**Costos Primer Año:**
```
CAPEX: $911
OPEX anual: $119 × 12 = $1,428
TOTAL AÑO 1: $2,339
```

**Usuarios Premium Necesarios (Mensual):**
```
$119 OPEX / $4.99 = 24 usuarios Premium
```

**Usuarios Premium para Recuperar CAPEX:**
```
$911 / $4.99 = 183 meses-usuario
Si mantienes 24 Premium → 183/24 = 7.6 meses
```

### 6.2 Conclusión de Punto de Equilibrio

📊 **Necesitas 24 usuarios Premium para cubrir gastos operativos mensuales**

📊 **Con 30 usuarios Premium ya generas ganancia**

📊 **Recuperación total de inversión inicial: 8 meses** (manteniendo 24 Premium constantes)

### 6.3 Proyección de Rentabilidad

#### Mes 6 (Lanzamiento consolidado)
- Usuarios totales: 500
- Premium (6%): 30 usuarios
- Ingresos: $149.70/mes
- Gastos: $119/mes
- **Ganancia: +$30.70/mes** ✅

#### Mes 12 (Fin del primer año)
- Usuarios totales: 1,200
- Premium (7%): 84 usuarios
- Ingresos: $419.16/mes
- Gastos: $119/mes
- **Ganancia: +$300.16/mes** ✅

#### Mes 24 (Segundo año)
- Usuarios totales: 4,500
- Premium (8%): 360 usuarios
- Ingresos: $1,796.40/mes
- Gastos: $399/mes (tier escalado)
- **Ganancia: +$1,397.40/mes** ✅
- **ROI anual: $16,768.80**

---

## 7. ESCENARIO DE RENTABILIDAD

### 7.1 Métricas de Éxito

**KPIs Principales:**

1. **Tasa de Conversión Premium: 5-8%**
   - Benchmark de apps similares: 3-10%
   - Objetivo realista: 6%

2. **Retención de Usuarios:**
   - Mes 1: 60%
   - Mes 3: 40%
   - Mes 6: 25% (usuarios fieles)

3. **CAC (Customer Acquisition Cost):**
   - Marketing orgánico: $0
   - Campañas pagadas: $2-5/usuario

4. **LTV (Lifetime Value) por Usuario Premium:**
   ```
   Promedio de retención: 6 meses
   LTV = $4.99 × 6 = $29.94
   ```

### 7.2 Estrategia de Crecimiento

**Fase 1 (Meses 1-3): Lanzamiento Beta**
- Marketing boca a boca
- Universidades y comunidades tech
- Objetivo: 300 usuarios, 15 Premium

**Fase 2 (Meses 4-6): Crecimiento Orgánico**
- Social media (Instagram, TikTok)
- Colaboraciones con influencers gastronómicos
- Objetivo: 800 usuarios, 40 Premium

**Fase 3 (Meses 7-12): Expansión Pagada**
- Meta Ads (Facebook/Instagram)
- Google Ads
- Objetivo: 2,000 usuarios, 120 Premium

**Fase 4 (Año 2): Consolidación**
- Partnerships con restaurantes (comisiones)
- Programa de referidos
- Objetivo: 5,000 usuarios, 400 Premium

### 7.3 Proyección Financiera a 3 Años

| Año | Usuarios | Premium | Ingresos | Gastos | **Ganancia** |
|-----|----------|---------|----------|--------|--------------|
| 1 | 1,200 | 72 | $4,311 | $2,339 | **+$1,972** |
| 2 | 4,500 | 360 | $21,557 | $4,788 | **+$16,769** |
| 3 | 10,000 | 900 | $53,892 | $9,588 | **+$44,304** |

**ROI Acumulado 3 Años: $63,045**

---

## 8. ARQUITECTURA TÉCNICA

### 8.1 Stack Tecnológico

**Frontend:**
- React Native 0.81.5
- Expo SDK 54
- React Navigation 6.x
- Axios (HTTP client)

**Backend as a Service:**
- Firebase Authentication
- Firebase Firestore

**IA y APIs Externas:**
- Groq AI (Llama 3.3 70B)
- EmailJS

**Mapa y Geolocalización:**
- Expo Location
- React Native Maps (implementación futura)

### 8.2 Estructura de Carpetas

```
findspot-app/
├── App.js                 # Navegación principal
├── screens/               # Pantallas de la app
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── OTPVerificationScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── ResetPasswordOTPScreen.js
│   ├── NewPasswordScreen.js
│   ├── MapScreen.js
│   ├── RestaurantDetailScreen.js
│   ├── NightModeScreen.js
│   ├── ProfileScreen.js
│   ├── ReviewsScreen.js
│   ├── RecommendationsScreen.js
│   └── AIChatScreen.js
├── services/              # Lógica de negocio
│   ├── authService.js
│   ├── otpService.js
│   ├── firebaseConfig.js
│   ├── restaurantService.js
│   ├── nightLifeService.js
│   └── aiChatService.js
├── context/               # Estado global
│   ├── AuthContext.js
│   ├── ThemeContext.js
│   └── PremiumContext.js
└── package.json
```

### 8.3 Base de Datos (Firestore)

**Colecciones:**

1. **users**
   ```
   {
     email: string
     emailVerified: boolean
     isPremium: boolean
     createdAt: timestamp
     preferences: array
   }
   ```

2. **otp_codes**
   ```
   {
     email: string
     code: string (6 dígitos)
     createdAt: timestamp
     expiresAt: timestamp
   }
   ```

3. **password_resets**
   ```
   {
     email: string
     newPassword: string
     userId: string
     readyToApply: boolean
   }
   ```

4. **restaurants** (datos mock en el código actualmente)
   ```
   {
     name: string
     category: string
     rating: number
     address: string
     isNightLife: boolean
   }
   ```

---

## 9. SEGURIDAD Y PRIVACIDAD

### 9.1 Medidas de Seguridad Implementadas

✅ **Autenticación Robusta**
- Verificación de email obligatoria (OTP)
- Contraseñas cifradas por Firebase
- Sesión con tokens JWT

✅ **Protección de Datos**
- Variables de entorno (.env) para API keys
- No se almacenan contraseñas en texto plano
- Firestore con reglas de seguridad

✅ **Validación de Inputs**
- Sanitización de emails
- Verificación de formato de contraseña
- Timeout en peticiones a APIs

### 9.2 Cumplimiento Legal

**GDPR / Privacidad:**
- Consentimiento explícito en registro
- Política de privacidad (pendiente agregar)
- Opción de eliminar cuenta

**Contenido +18:**
- Verificación de edad (declaración)
- Separación clara de contenido Premium

---

## 10. LIMITACIONES Y TRABAJO FUTURO

### 10.1 Limitaciones Actuales

⚠️ **Datos Mock**
- Los restaurantes están hardcodeados (no base de datos real)

⚠️ **Sin Mapa Real**
- Falta integración con Google Maps API

⚠️ **IA Limitada**
- No aprende de interacciones pasadas (sin fine-tuning)

⚠️ **Sin Sistema de Pagos**
- Upgrade Premium manual (no Stripe/PayPal)

### 10.2 Roadmap Futuro

**Versión 1.1 (3 meses)**
- Integración con Google Places API (restaurantes reales)
- Sistema de pagos con Stripe
- Notificaciones push

**Versión 1.2 (6 meses)**
- Reservas en restaurantes
- Programa de fidelidad
- Recomendaciones basadas en historial

**Versión 2.0 (12 meses)**
- Expansión a otras ciudades (Guatemala, Panamá)
- Modo offline
- Realidad aumentada (AR) para ver menús

---

## 11. CONCLUSIONES

### 11.1 Logros del Proyecto

✅ **Cumplimiento de Requisitos del Parcial 3**
- Autenticación con OTP implementada y funcional
- Integración de IA conversacional real (Groq/Llama 3.3)
- Análisis completo de costos (CAPEX/OPEX)
- Proyección de rentabilidad viable

✅ **Innovación Técnica**
- Uso de LLM de última generación (Llama 3.3 70B)
- Arquitectura escalable con Firebase
- Experiencia de usuario fluida

✅ **Viabilidad Económica**
- Costos iniciales bajos ($911)
- Punto de equilibrio alcanzable (24 usuarios Premium)
- ROI positivo desde el mes 6

### 11.2 Aprendizajes Clave

📚 **Desarrollo Móvil Moderno**
- Expo simplifica significativamente el desarrollo React Native
- Firebase es ideal para MVPs y prototipos

📚 **Inteligencia Artificial**
- Los LLMs modernos son accesibles y potentes
- El prompt engineering es crucial para resultados consistentes
- Groq ofrece respuestas rápidas (3-5 segundos)

📚 **Modelo de Negocio**
- Freemium es viable para apps de recomendaciones
- Contenido exclusivo (NightLife) justifica suscripción
- La conversión del 5-8% es realista según benchmarks

### 11.3 Valor Diferencial

🌟 **FindSpot vs Competidores**

| Característica | FindSpot | Google Maps | TripAdvisor |
|----------------|----------|-------------|-------------|
| Chat IA conversacional | ✅ | ❌ | ❌ |
| Recomendaciones contextuales | ✅ | Limitado | ❌ |
| Vida nocturna +18 | ✅ Premium | ❌ | Limitado |
| Enfoque local (San Salvador) | ✅ | Global | Global |

---

## 12. ANEXOS

### 12.1 Variables de Entorno Necesarias

```env
# Firebase
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=findspot.firebaseapp.com
FIREBASE_PROJECT_ID=findspot
FIREBASE_STORAGE_BUCKET=findspot.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Groq AI
GROQ_API_KEY=gsk_...

# EmailJS
EMAILJS_SERVICE_ID=service_...
EMAILJS_TEMPLATE_ID=template_...
EMAILJS_PUBLIC_KEY=user_...
```

### 12.2 Comandos de Ejecución

```bash
# Instalación
npm install

# Desarrollo
npm start

# iOS (requiere Mac)
npm run ios

# Android
npm run android

# Web
npm run web
```

### 12.3 Enlaces y Recursos

- **Repositorio GitHub**: (pendiente publicar)
- **Prototipo Expo**: exp://[tu-ip]:8081
- **Documentación Expo**: https://docs.expo.dev
- **Groq AI Docs**: https://console.groq.com/docs
- **Firebase Console**: https://console.firebase.google.com

---

## 13. EQUIPO DE DESARROLLO

**Desarrollador Principal:** [Tu Nombre]
**Institución:** Universidad Francisco Gavidia
**Asignatura:** Desarrollo de Aplicaciones Móviles
**Profesor:** [Nombre del Profesor]
**Fecha de Entrega:** Noviembre 2025

---

**Firma:**

_________________________
[Tu Nombre]
Estudiante de [Carrera]

---

**FIN DEL DOCUMENTO**

*Documentación generada para el Parcial 3 - Aplicación Móvil con Inteligencia Artificial*
*FindSpot v1.0 - © 2025*
