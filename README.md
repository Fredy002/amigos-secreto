# Regalitos con la Rory 🎁

Aplicación web para organizar amigos secretos de forma fácil y divertida.

## 🚀 Despliegue en Netlify

### Configuración Automática
El proyecto incluye `netlify.toml` con la configuración necesaria.

### Variables de Entorno
No se requieren variables de entorno para la versión básica.

### Comandos de Build
- **Build Command:** `npm run build`
- **Publish Directory:** `.next`
- **Node Version:** 20

### Nota sobre Persistencia de Datos
⚠️ **Importante:** En la versión actual, los datos se almacenan en memoria del servidor. Esto significa que:
- Los datos persisten durante la sesión del servidor
- Se reinician cuando Netlify redeplega la aplicación
- Son compartidos por todos los usuarios

### Soluciones de Persistencia Recomendadas para Producción:
1. **MongoDB Atlas** (Gratis hasta 512MB)
2. **Vercel KV** (Base de datos Redis)
3. **Supabase** (PostgreSQL gratis)
4. **PlanetScale** (MySQL serverless)

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📱 Características

- ✅ Gestión de participantes
- ✅ Listas de regalos personalizadas
- ✅ Asignación aleatoria de amigos secretos
- ✅ Protección con contraseña
- ✅ Responsive design
- ✅ Animaciones sutiles

## 🔧 Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes UI
- **Lucide React** - Iconos
