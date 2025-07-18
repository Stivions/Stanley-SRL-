# Stanley SRL - E-commerce Platform

Una plataforma de e-commerce moderna y minimalista desarrollada por **Stivion** para Stanley SRL.

## 🚀 Características

- **Diseño Minimalista**: Interfaz limpia y profesional con animaciones suaves
- **Productos sin Precio**: Sistema de solicitud de información en lugar de compra directa
- **Panel de Administración**: Gestión completa de productos, tickets y usuarios
- **Integración con Stripe**: Sistema de pagos completamente funcional
- **Responsive Design**: Optimizado para todos los dispositivos
- **Integración con Supabase**: Base de datos y autenticación
- **SEO Optimizado**: Metadatos y estructura optimizada para buscadores

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: Supabase
- **Pagos**: Stripe
- **Deployment**: Netlify
- **Icons**: Lucide React

## 📦 Instalación

1. Clona el repositorio:
\`\`\`bash
git clone https://github.com/Stivions/stanley-srl.git
cd stanley-srl
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configura Supabase:
- Crea un proyecto en [Supabase](https://supabase.com)
- Ejecuta el SQL de los archivos en `/scripts/`
- Agrega las credenciales a `.env.local`

5. Configura Stripe:
- Obtén tus claves de [Stripe Dashboard](https://dashboard.stripe.com)
- Agrega las claves a `.env.local`

6. Ejecuta el proyecto:
\`\`\`bash
npm run dev
\`\`\`

## 🔧 Configuración

### Variables de Entorno Requeridas:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
\`\`\`

## 🚀 Deployment en Netlify

1. Conecta tu repositorio de GitHub a Netlify
2. Configura las variables de entorno en Netlify
3. El archivo `netlify.toml` ya está configurado
4. Deploy automático en cada push

## 👨‍💻 Desarrollado por Stivion

- **YouTube**: [https://www.youtube.com/@sstivion](https://www.youtube.com/@sstivion)
- **GitHub**: [https://github.com/Stivions](https://github.com/Stivions)
- **Discord**: [https://discord.com/invite/qeE8hCGVgb](https://discord.com/invite/qeE8hCGVgb)

## 📝 Funcionalidades

### Para Usuarios:
- ✅ Navegación de productos
- ✅ Solicitud de información de productos
- ✅ Sistema de pagos con Stripe
- ✅ Formularios de contacto
- ✅ Enlaces a redes sociales
- ✅ Diseño responsive

### Para Administradores:
- ✅ Panel de administración seguro
- ✅ Gestión de productos (CRUD)
- ✅ Integración automática con Stripe
- ✅ Sistema de tickets
- ✅ Gestión de solicitudes
- ✅ Control de acceso

## 🔐 Seguridad

- Autenticación segura para administradores
- Políticas de seguridad en base de datos (RLS)
- Validación de datos en frontend y backend
- Integración segura con Stripe

## 📄 Licencia

© 2024 Stanley SRL. Desarrollado por Stivion.
