# 📱 Mardify APP - Aplicación de Escritorio

## 🚀 Instalación y Ejecución

### Requisitos previos:
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos para ejecutar:

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm start
```

3. **Compilar para producción:**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
Mardify APP/
├── package.json          # Configuración del proyecto
├── main.js               # Proceso principal de Electron
├── preload.js            # Script de preload para seguridad
├── renderer.js           # Lógica compartida del renderizador
├── styles.css            # Estilos y animaciones globales
├── assets/               # Recursos (iconos, imágenes)
│   └── icon.png
├── pages/
│   ├── index.html        # Página de Login
│   ├── register.html     # Página de Registro
│   └── main.html         # Pantalla Principal (Dashboard)
└── README.md
```

## 🎨 Características

### ✨ Animaciones Incluidas:
- **Login/Register:** Efectos de partículas, gradientes animados, transiciones suaves
- **Dashboard:** Animaciones de entrada, efectos de hover, búsqueda con feedback visual
- **Loader:** Animación de carga personalizada
- **Glassmorphism:** Diseño moderno con efecto vidrio

### 🔐 API Endpoints:
- **Login:** `basededatos.gokucomdohd.pro/login`
- **Register:** `basededatos.gokucomdohd.pro/register`
- **Buscar Usuarios:** `basededatos.gokucomdohd.pro/api/user/`

### 🛠️ Tecnologías:
- **Electron:** Framework de escritorio
- **CSS3:** Animaciones y efectos visuales
- **JavaScript:** Lógica de aplicación
- **Axios:** Peticiones HTTP

## 📦 Scripts Disponibles

```bash
npm start          # Ejecutar en desarrollo
npm run build      # Compilar para producción
npm run rebuild    # Rebuild de Electron
```

## 🎯 Funcionalidades

1. **Login Seguro:** Autenticación con servidor remoto
2. **Registro de Usuarios:** Creación de nuevas cuentas
3. **Búsqueda de Usuarios:** Búsqueda en tiempo real con resultados animados
4. **Interfaz Moderna:** Diseño responsive con animaciones fluidas
5. **Persistencia:** Guardado de sesión

## 🔧 Configuración

La aplicación se conecta automáticamente a:
- **Servidor:** basededatos.gokucomdohd.pro
- **Puerto:** 443 (HTTPS)

## 📝 Notas

- La aplicación requiere conexión a internet para funcionar
- El servidor debe estar ejecutándose para autenticación
- Las animaciones pueden ajustarse en `styles.css`

---

Desarrollado con ❤️ por Mardify Team

