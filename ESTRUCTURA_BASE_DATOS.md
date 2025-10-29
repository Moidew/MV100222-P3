# Estructura de Base de Datos - App de Restaurantes

## 📋 Descripción General

Esta plantilla de Google Sheets contiene toda la estructura de datos necesaria para tu aplicación de recomendación de restaurantes con IA. Está diseñada para integrarse perfectamente con Glide.

---

## 📊 Tablas Principales

### 1. **USUARIOS**
Almacena la información de los usuarios registrados en la app.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Número | ID único del usuario |
| email | Texto | Email para login |
| nombre | Texto | Nombre completo |
| telefono | Texto | Teléfono de contacto |
| fecha_registro | Fecha | Cuándo se registró |
| preferencias_culinarias | Texto | Tipos de cocina favoritos (separados por ;) |
| rango_presupuesto | Texto | Bajo/Medio/Alto |
| ubicacion_lat | Número | Latitud de ubicación actual |
| ubicacion_lng | Número | Longitud de ubicación actual |
| foto_perfil | URL | Link a foto de perfil |
| estado | Texto | activo/inactivo |

**Ejemplo de uso en IA:**
- Filtrar restaurantes según preferencias culinarias
- Recomendar basado en rango de presupuesto
- Personalizar recomendaciones por ubicación

---

### 2. **RESTAURANTES**
Información completa de cada restaurante.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Número | ID único del restaurante |
| nombre | Texto | Nombre del restaurante |
| categoria | Texto | Tipo de cocina principal |
| direccion | Texto | Dirección completa |
| ciudad | Texto | Ciudad |
| latitud | Número | Coordenada GPS |
| longitud | Número | Coordenada GPS |
| telefono | Texto | Teléfono de contacto |
| email | Texto | Email de contacto |
| sitio_web | URL | Página web |
| horario_apertura | Hora | Hora de apertura (HH:MM) |
| horario_cierre | Hora | Hora de cierre (HH:MM) |
| precio_promedio | Número | Precio medio por persona (€) |
| calificacion_promedio | Número | Promedio de calificaciones (1-5) |
| numero_resenas | Número | Total de reseñas |
| descripcion | Texto | Descripción breve |
| imagen_principal | URL | Foto principal |
| tipo_cocina | Texto | Tipo de cocina (puede ser múltiple) |
| capacidad | Número | Número de mesas/personas |
| tiene_wifi | Sí/No | ¿Tiene WiFi? |
| tiene_estacionamiento | Sí/No | ¿Tiene estacionamiento? |
| acepta_reservas | Sí/No | ¿Acepta reservas? |
| metodos_pago | Texto | Métodos aceptados (separados por ;) |
| estado | Texto | activo/inactivo |

**Ejemplo de uso en IA:**
- Filtrar por tipo de cocina, precio, ubicación
- Recomendar basado en calificación
- Verificar disponibilidad de horarios

---

### 3. **RESEÑAS**
Calificaciones y comentarios de usuarios sobre restaurantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Número | ID único de la reseña |
| usuario_id | Número | ID del usuario que reseña |
| restaurante_id | Número | ID del restaurante reseñado |
| calificacion | Número | Puntuación 1-5 |
| titulo | Texto | Título de la reseña |
| comentario | Texto | Comentario detallado |
| fecha_resena | Fecha | Cuándo se escribió |
| numero_visitas | Número | Cuántas veces ha visitado |
| recomendaria | Sí/No | ¿Lo recomendaría? |
| fotos_resena | URL | Fotos de la comida/lugar |
| respuesta_restaurante | Texto | Respuesta del restaurante |
| fecha_respuesta | Fecha | Cuándo respondió |
| estado | Texto | publicada/pendiente/rechazada |

**Ejemplo de uso en IA:**
- Analizar sentimiento de reseñas
- Extraer palabras clave (comida, servicio, ambiente)
- Generar resumen de opiniones

---

### 4. **HISTORIAL_INTERACCIONES**
Registro de todas las acciones del usuario en la app.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Número | ID único |
| usuario_id | Número | ID del usuario |
| restaurante_id | Número | ID del restaurante |
| tipo_interaccion | Texto | visita/favorito/busqueda/click |
| fecha_interaccion | Fecha | Cuándo ocurrió |
| duracion_visita_minutos | Número | Cuánto tiempo estuvo |
| gasto_aproximado | Número | Cuánto gastó (€) |
| metodo_pago | Texto | Cómo pagó |
| notas | Texto | Notas adicionales |

**Ejemplo de uso en IA:**
- Aprender preferencias del usuario
- Mejorar recomendaciones con cada interacción
- Detectar patrones de comportamiento

---

## 🚀 Cómo Configurar en Google Sheets

### Paso 1: Crear el Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo documento llamado "LocalMatch - Base de Datos"

### Paso 2: Crear las Hojas
1. Renombra la primera hoja a "usuarios"
2. Crea nuevas hojas: "restaurantes", "resenas", "historial_interacciones"

### Paso 3: Importar Datos
Para cada hoja:
1. Abre la hoja
2. Ve a **Archivo > Importar datos > Subir**
3. Selecciona el archivo CSV correspondiente
4. Elige "Reemplazar datos en la hoja actual"

### Paso 4: Configurar Permisos
1. Haz clic en **Compartir** (arriba a la derecha)
2. Cambia a "Cualquiera con el enlace"
3. Selecciona "Editor"
4. Copia el enlace (lo necesitarás para Glide)

---

## 🔗 Integración con Glide

### En Glide:
1. Ve a **Data > Google Sheets**
2. Selecciona tu Google Sheet
3. Glide importará automáticamente todas las hojas como tablas
4. Cada columna se convertirá en un campo editable

---

## 💡 Notas Importantes

- **IDs únicos**: Asegúrate de que cada ID sea único en su tabla
- **Relaciones**: usuario_id y restaurante_id conectan las tablas
- **Fechas**: Usa formato YYYY-MM-DD
- **URLs**: Asegúrate de que las URLs sean válidas
- **Datos de ejemplo**: Los datos incluidos son solo ejemplos. Reemplázalos con datos reales

---

## 📈 Próximos Pasos

1. ✅ Crear el Google Sheet con esta estructura
2. ⏭️ Conectar a Glide
3. ⏭️ Configurar autenticación OTP
4. ⏭️ Crear pantallas en Glide
5. ⏭️ Integrar IA para recomendaciones

---

## 📞 Soporte

Si tienes dudas sobre la estructura, consulta la documentación de Glide:
- [Glide Data Documentation](https://docs.glideapps.com/all/reference/data)
- [Google Sheets Integration](https://docs.glideapps.com/all/reference/data/google-sheets)
