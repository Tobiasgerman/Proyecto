# Multi Wordle - API-Based Game Platform

Una plataforma moderna de juegos de adivinanza estilo Wordle con múltiples categorías, completamente renovada para usar APIs reales en lugar de bases de datos locales.

## 🎮 Juegos Disponibles

### ✅ **Mundle** - Juego de Países
- Adivina países basándote en la distancia y dirección
- Cálculos reales de distancia usando coordenadas geográficas
- Sin dependencias de base de datos

### ✅ **Footble** - Jugadores de Fútbol  
- Adivina jugadores de fútbol por sus características
- Datos de jugadores usando sistema de mock data
- Comparación de nacionalidad, posición, fecha de nacimiento

### ✅ **Basketle** - Jugadores de Basketball
- Similar a Footble pero para basketball
- Mock data de jugadores populares de NBA

### ✅ **F1dle** - Pilotos de Fórmula 1
- Adivina pilotos de F1 por equipo, nacionalidad, etc.
- Incluye información de equipos actuales

### 🔧 **Gamedle** - Videojuegos
- Adivina videojuegos por sus características
- Requiere configuración de API de IGDB (ver configuración)

## 🚀 Mejoras Implementadas

### ✨ **Interfaz Moderna**
- Diseño completamente renovado con CSS moderno
- Responsive design para móviles y desktop
- Animaciones suaves y efectos hover
- Tipografía moderna con Google Fonts (Poppins)
- Sistema de colores consistente

### ⚡ **Arquitectura API-First**
- Eliminación completa de dependencias de MySQL/Sequelize
- Servidor unificado con endpoints RESTful
- Socket.IO para autocompletado en tiempo real
- Manejo de errores robusto

### 🎯 **Funcionalidades**
- Autocompletado inteligente para nombres
- Sistema de puntuación con intentos limitados
- Navegación fluida entre juegos
- Indicadores visuales de aciertos (Verde/Amarillo/Rojo)
- Flechas direccionales para números y fechas

## 🛠 Instalación y Configuración

### Prerequisitos
- Node.js (v14 o superior)
- npm

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Proyecto
```

2. **Instalar dependencias del backend**
```bash
cd Back
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# IGDB API (Para Gamedle - Opcional)
IGDB_CLIENT_ID=tu_client_id
IGDB_ACCESS_TOKEN=tu_access_token

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

4. **Ejecutar el servidor**
```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

5. **Abrir en navegador**
```
http://localhost:3000
```

## 🔑 Configuración de APIs

### IGDB API (Para Gamedle)
1. Ir a [IGDB API](https://api.igdb.com/)
2. Crear una cuenta y obtener credenciales
3. Agregar `IGDB_CLIENT_ID` y `IGDB_ACCESS_TOKEN` al archivo `.env`

**Nota:** Los otros juegos funcionan sin APIs externas usando mock data.

## 🎨 Capturas de Pantalla

### Menú Principal
![Main Menu](https://github.com/user-attachments/assets/c0f40ecf-9e1f-4cfe-ae58-97f35def6514)

### Mundle - Juego de Países
![Mundle Game](https://github.com/user-attachments/assets/99232291-c8af-4b53-afb5-834f6f675e40)

### Footble - Jugadores de Fútbol
![Footble Game](https://github.com/user-attachments/assets/c8f65b89-fe5e-4673-962d-b3ccf0a7a597)

## 📁 Estructura del Proyecto

```
Proyecto/
├── Back/                      # Servidor API
│   ├── api-server.js         # Servidor principal unificado
│   ├── package.json          # Dependencias del backend
│   ├── .env.example          # Plantilla de variables de entorno
│   └── .env                  # Variables de entorno (no versionado)
├── Front/                    # Frontend
│   ├── index.html           # Página principal
│   ├── styles/
│   │   └── main.css         # Estilos modernos
│   └── scripts/
│       └── main.js          # Lógica del frontend
└── README.md                # Este archivo
```

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm start      # Ejecutar servidor de producción
npm run dev    # Ejecutar con nodemon para desarrollo
```

### Tecnologías Utilizadas

**Backend:**
- Node.js + Express
- Socket.IO para tiempo real
- Axios para llamadas a APIs
- Geolib para cálculos geográficos
- dotenv para variables de entorno

**Frontend:**
- HTML5 moderno
- CSS3 con variables personalizadas
- JavaScript ES6+ vanilla
- Socket.IO client

## 🎯 Funcionalidades Técnicas

### Sistema de Comparación
- **Verde**: Coincidencia exacta
- **Amarillo**: Coincidencia parcial (para arrays/listas)
- **Rojo**: No coincide
- **Flechas**: ⬆ (mayor) / ⬇ (menor) para fechas y números

### APIs y Datos
- **Mundle**: Cálculos de distancia en tiempo real
- **Deportes**: Mock data estructurado
- **Gamedle**: IGDB API (requiere configuración)

### Socket.IO
- Autocompletado en tiempo real
- Manejo de desconexiones
- Sugerencias por tipo de juego

## 🚀 Deploy

El proyecto está listo para deploy en cualquier plataforma que soporte Node.js:

1. **Heroku**: `git push heroku main`
2. **Vercel**: Conectar repositorio
3. **Railway**: Importar desde GitHub
4. **DigitalOcean**: Docker container

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisar la sección de configuración
2. Verificar que todas las dependencias estén instaladas
3. Comprobar los logs del servidor en la consola
4. Abrir un issue en GitHub

---

**¡Disfruta jugando Multi Wordle! 🎮**