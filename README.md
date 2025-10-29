# FindSpot - Restaurant Discovery App 🍽️

Aplicación móvil para descubrir restaurantes y lugares de vida nocturna en San Salvador con recomendaciones de IA.

## 🚀 Características

- 🔍 **Búsqueda de Restaurantes**: Encuentra lugares según tus preferencias
- 🤖 **Asistente IA**: Chat inteligente con recomendaciones personalizadas
- ⭐ **Sistema de Reseñas**: Lee y escribe reseñas de restaurantes
- 🌙 **NightLife +18**: Acceso Premium a bares, clubs y lounges
- 📍 **Mapas Interactivos**: Visualiza restaurantes en el mapa
- 🔐 **Autenticación Segura**: Registro con verificación OTP por email
- 💳 **Sistema Premium**: Funcionalidades exclusivas para miembros

## 🛠️ Tecnologías

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth + Firestore)
- **IA**: Groq AI con Llama 3.3
- **Email**: Resend API
- **Mapas**: React Native Maps

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPO]
   cd [NOMBRE_DEL_REPO]
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Copia el archivo `.env.example` a `.env`
   - Completa todas las variables con tus credenciales:
     ```
     FIREBASE_API_KEY=tu_api_key
     FIREBASE_AUTH_DOMAIN=tu_dominio
     FIREBASE_PROJECT_ID=tu_proyecto
     FIREBASE_STORAGE_BUCKET=tu_bucket
     FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
     FIREBASE_APP_ID=tu_app_id
     GROQ_API_KEY=tu_groq_key
     RESEND_API_KEY=tu_resend_key
     RESEND_EMAIL_DOMAIN=tu_dominio.com
     ```

4. **Iniciar la aplicación**
   ```bash
   npx expo start
   ```

## 🔑 Configuración de Servicios

### Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Copia las credenciales al archivo `.env`

### Groq AI
1. Crea una cuenta en [Groq](https://console.groq.com/)
2. Genera una API Key
3. Agrégala al archivo `.env`

### Resend
1. Crea una cuenta en [Resend](https://resend.com/)
2. Verifica tu dominio personalizado
3. Genera una API Key
4. Agrégala al archivo `.env`

## 📱 Uso

1. **Registro**: Crea una cuenta con tu email
2. **Verificación**: Ingresa el código OTP de 6 dígitos enviado a tu email
3. **Explorar**: Busca restaurantes en el mapa
4. **Chat IA**: Usa el asistente para recomendaciones personalizadas
5. **Premium**: Actualiza para acceder a lugares NightLife +18

## 🔒 Seguridad

- ✅ Variables de entorno protegidas
- ✅ API Keys no expuestas en el código
- ✅ Autenticación con Firebase
- ✅ Verificación de email con OTP

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👤 Autor

[Tu Nombre]

---

⚠️ **Nota**: Nunca subas el archivo `.env` a GitHub. Todas las credenciales están protegidas.
