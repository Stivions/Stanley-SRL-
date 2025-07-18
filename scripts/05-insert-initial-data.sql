-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar usuario administrador principal
INSERT INTO users (
    email, 
    password_hash, 
    role, 
    full_name, 
    active
) VALUES (
    'admin@stanley.com',
    '$2b$12$encrypted_hash_placeholder', -- Cambiar por hash real
    'admin',
    'Administrador Stanley SRL',
    true
) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active;

-- Insertar usuario desarrollador
INSERT INTO users (
    email, 
    password_hash, 
    role, 
    full_name, 
    active
) VALUES (
    'stivion@stanley.com',
    '$2b$12$encrypted_hash_placeholder', -- Cambiar por hash real
    'admin',
    'Stivion - Desarrollador',
    true
) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active;

-- =====================================================
-- PRODUCTOS DE EJEMPLO
-- =====================================================

INSERT INTO products (name, description, image, category, featured, active) VALUES
(
    'Producto Premium Deluxe',
    'Nuestro producto más exclusivo con características premium y acabados de lujo. Diseñado para clientes exigentes que buscan la máxima calidad y rendimiento. Incluye garantía extendida y soporte personalizado.',
    '/placeholder.svg?height=400&width=400',
    'Premium',
    true,
    true
),
(
    'Producto Estándar Pro',
    'Excelente relación calidad-precio con todas las funcionalidades esenciales. Ideal para uso diario con garantía de durabilidad y confiabilidad. Perfecto para usuarios que buscan eficiencia sin comprometer la calidad.',
    '/placeholder.svg?height=400&width=400',
    'Estándar',
    false,
    true
),
(
    'Edición Limitada Gold',
    'Producto exclusivo de edición limitada con detalles dorados y numeración única. Solo disponible por tiempo limitado para coleccionistas y entusiastas. Incluye certificado de autenticidad.',
    '/placeholder.svg?height=400&width=400',
    'Especial',
    true,
    true
),
(
    'Producto Eco-Friendly',
    'Fabricado con materiales sostenibles y procesos ecológicos. Para clientes conscientes del medio ambiente que no quieren comprometer la calidad. Certificado por organizaciones ambientales internacionales.',
    '/placeholder.svg?height=400&width=400',
    'Eco',
    false,
    true
),
(
    'Kit Profesional Completo',
    'Set completo para profesionales con todos los accesorios necesarios. Incluye estuche de transporte premium, herramientas especializadas y manual técnico detallado. Ideal para uso comercial.',
    '/placeholder.svg?height=400&width=400',
    'Profesional',
    true,
    true
),
(
    'Producto Básico Essential',
    'Opción económica sin comprometer la calidad esencial. Perfecto para iniciarse en nuestra línea de productos. Incluye las funcionalidades básicas con la confiabilidad Stanley SRL.',
    '/placeholder.svg?height=400&width=400',
    'Básico',
    false,
    true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONFIGURACIONES INICIALES DEL SITIO
-- =====================================================

INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'Stanley SRL', 'Nombre del sitio web'),
('site_description', 'Productos exclusivos con la mejor calidad y servicio personalizado', 'Descripción del sitio'),
('contact_email', 'info@stanley.com', 'Email de contacto principal'),
('contact_phone', '+1-234-567-8900', 'Teléfono de contacto'),
('business_hours', 'Lunes a Viernes: 9:00 AM - 6:00 PM', 'Horarios de atención'),
('stripe_webhook_secret', '', 'Secret para webhooks de Stripe'),
('email_notifications', 'true', 'Habilitar notificaciones por email'),
('maintenance_mode', 'false', 'Modo de mantenimiento')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- =====================================================
-- TICKETS DE EJEMPLO (OPCIONAL)
-- =====================================================

INSERT INTO tickets (title, description, status, priority, customer_email, customer_name) VALUES
(
    'Consulta sobre Producto Premium',
    'Cliente interesado en conocer más detalles sobre las características del Producto Premium Deluxe y opciones de personalización disponibles.',
    'open',
    'medium',
    'cliente@email.com',
    'Juan Pérez'
),
(
    'Solicitud de Cotización Empresarial',
    'Empresa solicita cotización para compra al por mayor de productos de la línea profesional. Requieren facturación empresarial.',
    'in-progress',
    'high',
    'compras@empresa.com',
    'María González'
)
ON CONFLICT DO NOTHING;
