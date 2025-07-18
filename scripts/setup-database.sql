-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  category VARCHAR(100),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product requests table
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for admin access)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for public access to products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Policies for admin access to products
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for product requests
CREATE POLICY "Anyone can create product requests" ON product_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all requests" ON product_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for tickets
CREATE POLICY "Admin can manage tickets" ON tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@stanley.com', '$2b$10$rOzJqZxQxGjQqGjQqGjQqO', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, image, category, featured) VALUES
('Producto Premium Deluxe', 'Nuestro producto más exclusivo con características premium y acabados de lujo. Perfecto para clientes exigentes que buscan la máxima calidad.', '/placeholder.svg?height=400&width=400', 'Premium', true),
('Producto Estándar Pro', 'Excelente relación calidad-precio con todas las funcionalidades esenciales. Ideal para uso diario con garantía de durabilidad.', '/placeholder.svg?height=400&width=400', 'Estándar', false),
('Edición Limitada Gold', 'Producto exclusivo de edición limitada con detalles dorados y numeración única. Solo disponible por tiempo limitado.', '/placeholder.svg?height=400&width=400', 'Especial', true),
('Producto Eco-Friendly', 'Fabricado con materiales sostenibles y procesos ecológicos. Para clientes conscientes del medio ambiente.', '/placeholder.svg?height=400&width=400', 'Eco', false),
('Kit Profesional', 'Set completo para profesionales con todos los accesorios necesarios. Incluye estuche de transporte premium.', '/placeholder.svg?height=400&width=400', 'Profesional', true),
('Producto Básico', 'Opción económica sin comprometer la calidad. Perfecto para iniciarse en nuestra línea de productos.', '/placeholder.svg?height=400&width=400', 'Básico', false)
ON CONFLICT DO NOTHING;
