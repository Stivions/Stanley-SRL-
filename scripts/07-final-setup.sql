-- =====================================================
-- CONFIGURACIÓN FINAL Y VERIFICACIONES
-- =====================================================

-- Verificar que todas las tablas fueron creadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('products', 'product_requests', 'users', 'tickets', 'admin_logs', 'site_settings');
    
    IF table_count = 6 THEN
        RAISE NOTICE 'SUCCESS: Todas las tablas fueron creadas correctamente';
    ELSE
        RAISE EXCEPTION 'ERROR: Faltan tablas por crear. Se encontraron % de 6', table_count;
    END IF;
END $$;

-- Verificar que los índices fueron creados
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'Se crearon % índices para optimización', index_count;
END $$;

-- Verificar que las políticas RLS están activas
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND c.relname IN ('products', 'product_requests', 'users', 'tickets', 'admin_logs', 'site_settings')
    AND c.relrowsecurity = true;
    
    IF rls_count = 6 THEN
        RAISE NOTICE 'SUCCESS: RLS habilitado en todas las tablas';
    ELSE
        RAISE NOTICE 'WARNING: RLS no está habilitado en todas las tablas';
    END IF;
END $$;

-- Mostrar estadísticas finales
SELECT 
    'STANLEY SRL DATABASE SETUP COMPLETED' as status,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM site_settings) as site_settings;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '
    =====================================================
    🎉 STANLEY SRL DATABASE SETUP COMPLETADO
    =====================================================
    
    ✅ Tablas creadas: products, product_requests, users, tickets, admin_logs, site_settings
    ✅ Índices optimizados para performance
    ✅ Row Level Security (RLS) habilitado
    ✅ Funciones y triggers configurados
    ✅ Datos iniciales insertados
    ✅ Vistas para reportes creadas
    
    🔐 CREDENCIALES DE ADMIN:
    - Email: admin@stanley.com
    - Email Dev: stivion@stanley.com
    
    ⚠️  IMPORTANTE:
    - Cambiar las contraseñas por hashes reales
    - Configurar webhooks de Stripe
    - Revisar configuraciones en site_settings
    
    👨‍💻 Desarrollado por: Stivion
    🌐 GitHub: https://github.com/Stivions
    
    =====================================================
    ';
END $$;
