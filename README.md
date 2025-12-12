# Regalitos con la Rory 🎁

Aplicación web para organizar amigos secretos de forma fácil y divertida.

## 🚀 Despliegue

### Variables de Entorno
El proyecto requiere la siguiente variable de entorno:

```env
DATABASE_URL=mysql://root:WxphSUUGbTrgRuNSjDKShvNLMiBJHtPb@yamabiko.proxy.rlwy.net:27579/railway
```

### Comandos de Build
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Node Version:** 20

### Base de Datos
La aplicación utiliza **MySQL en Railway** para almacenar todos los datos de forma persistente:
- ✅ Datos persistentes permanentemente
- ✅ Compartidos entre todos los usuarios
- ✅ Sin pérdida de información en redeployments
- ✅ Inicialización automática de tablas

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
