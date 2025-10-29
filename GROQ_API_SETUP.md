# 🤖 Configuración de Groq AI - Recomendaciones Inteligentes

## ¿Qué es Groq?

**Groq** es una plataforma de IA GRATUITA y SUPER RÁPIDA que usamos para generar recomendaciones personalizadas con Inteligencia Artificial.

### ⚡ Ventajas de Groq:
- ✅ **100% GRATIS**: 14,400 requests por día
- ✅ **SUPER RÁPIDO**: 100+ tokens/segundo (más rápido que ChatGPT)
- ✅ **Modelos Potentes**: Llama 3.1, Mixtral, Gemma
- ✅ **Sin tarjeta de crédito**: Solo email para registrarse

---

## 📝 Cómo Obtener tu API Key GRATIS

### Paso 1: Crear Cuenta en Groq

1. Ve a: **https://console.groq.com**
2. Click en "Sign Up" (Registrarse)
3. Usa tu email (Gmail, Outlook, etc.)
4. Verifica tu email

### Paso 2: Obtener API Key

1. Una vez dentro, ve a la sección **"API Keys"** en el menú izquierdo
2. Click en **"Create API Key"**
3. Dale un nombre (ej: "FindSpot App")
4. Click en **"Submit"**
5. **COPIA LA KEY** - Solo se muestra una vez!
   - Se ve así: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 3: Configurar en la App

1. Abre el archivo: `services/aiService.js`
2. Busca la línea 5:
   ```javascript
   const GROQ_API_KEY = "TU_API_KEY_AQUI"
   ```
3. Reemplaza `"TU_API_KEY_AQUI"` con tu key real:
   ```javascript
   const GROQ_API_KEY = "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
4. Guarda el archivo
5. ¡Listo! Ya tienes IA funcionando 🚀

---

## 🧪 Probar que Funciona

1. Abre la app
2. Ve a la pestaña **"Recomendaciones"**
3. Click en **"Generar Nuevas Recomendaciones con IA"**
4. Espera 2-3 segundos
5. Verás 5 recomendaciones personalizadas generadas por IA

### Modo NightLife +18:
1. En la pantalla de Recomendaciones
2. Click en el botón **"NightLife +18"**
3. Si eres Premium, verás recomendaciones de bares/clubs generadas por IA especializada

---

## 🔍 Detalles Técnicos

### Modelos que usamos:
- **llama-3.1-70b-versatile**: Para recomendaciones (más inteligente)
- **llama-3.1-8b-instant**: Para descripciones (más rápido)

### Límites Gratis:
- **14,400 requests/día** = 600 requests/hora
- **Suficiente para**: Miles de recomendaciones diarias
- **No requiere tarjeta** de crédito

### Sistema de Fallback:
Si la API falla o no está configurada, la app usa recomendaciones mock (sin IA).

---

## 🎯 Ejemplos de Prompts

### Para Restaurantes:
```
Del siguiente listado de restaurantes, recomienda los TOP 5 mejores
para alguien con preferencia por: Italiana, Japonesa, Mexicana.

Da razones enfocadas en: sabor, calidad, experiencia gastronómica.
```

### Para NightLife +18:
```
Del siguiente listado de lugares nocturnos, recomienda los TOP 5 mejores
para alguien interesado en: Clubs, Bares, Lounges.

Da razones enfocadas en: ambiente, música, tragos, vibra nocturna.
```

---

## ❓ Preguntas Frecuentes

### ¿Es realmente gratis?
Sí, Groq ofrece 14,400 requests/día completamente gratis sin tarjeta.

### ¿Qué pasa si se acaban los requests?
El sistema automáticamente usa recomendaciones mock hasta el día siguiente.

### ¿Puedo usar otro servicio de IA?
Sí, puedes modificar `aiService.js` para usar OpenAI, Anthropic, Cohere, etc.

### ¿Cuánto tarda cada recomendación?
Entre 1-3 segundos gracias a la velocidad de Groq.

### ¿Funciona offline?
No, necesita internet. Sin conexión usa recomendaciones mock.

---

## 🚀 Alternativas a Groq (si prefieres)

### 1. **Google Gemini** (Gratis)
- URL: https://ai.google.dev
- Límite: 60 requests/minuto
- Modelo: Gemini 1.5 Flash

### 2. **Cohere** (Gratis)
- URL: https://cohere.com
- Límite: 1000 requests/mes
- Modelo: Command

### 3. **OpenAI** (De pago)
- URL: https://platform.openai.com
- Precio: $0.002 por request aprox.
- Modelo: GPT-4, GPT-3.5

---

## 📊 Monitoreo de Uso

Para ver cuántos requests has usado:
1. Ve a: https://console.groq.com
2. Click en "Usage" en el menú
3. Verás tu uso diario/mensual

---

## 💡 Tips

1. **Guarda tu API key de forma segura** - No la compartas públicamente
2. **Si publicas en GitHub**, usa variables de entorno
3. **La key empieza con `gsk_`** - Si no, copiaste mal
4. **Prueba primero con mock** antes de configurar la IA
5. **Lee la consola** para ver mensajes de debug de la IA

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que la API key esté bien copiada
2. Revisa la consola para ver errores
3. Prueba la API key en: https://console.groq.com/playground
4. Lee la documentación: https://console.groq.com/docs

---

¡Disfruta de las recomendaciones inteligentes! 🎉🤖
