-- Add Stripe integration columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add status column to product_requests if not exists
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update admin users with secure credentials
DELETE FROM users WHERE email IN ('admin@stanley.com', 'stivion@stanley.com');

INSERT INTO users (email, password_hash, role) VALUES
('admin@stanley.com', '$2b$12$encrypted_hash_here', 'admin'),
('stivion@stanley.com', '$2b$12$encrypted_hash_here', 'admin')
ON CONFLICT (email) DO UPDATE SET
password_hash = EXCLUDED.password_hash,
role = EXCLUDED.role;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_created_at ON product_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.role = 'admin'
    )
  );

-- Add policy for product requests management
CREATE POLICY "Admin can manage requests" ON product_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.role = 'admin'
    )
  );
