import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://mkhhdmypfiawfxlvupza.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raGhkbXlwZmlhd2Z4bHZ1cHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDY2OTcsImV4cCI6MjA2ODIyMjY5N30.8H35FQafmj2OVjgavPCUWYZv-GwANCQxN_5df9RVCQY"

// Crear cliente con configuración optimizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
})

// Test de conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("products").select("count").limit(1)
    if (error) {
      console.error("Connection test failed:", error)
      return false
    }
    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.error("Connection test error:", error)
    return false
  }
}
