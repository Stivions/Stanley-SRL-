import { supabase } from "./supabase"

// Types
export interface Product {
  id: string
  name: string
  description: string
  image: string | null
  category: string
  featured: boolean
  stripe_product_id?: string | null
  price?: number | null
  currency: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductRequest {
  id?: string
  product_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  message?: string | null
  status?: string
  created_at?: string
}

export interface Ticket {
  id?: string
  title: string
  description: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  customer_email?: string | null
  customer_name?: string | null
  created_at?: string
  updated_at?: string
}

// =====================================================
// UPLOAD DE IMÁGENES - COMPLETAMENTE ARREGLADO
// =====================================================

export async function uploadImage(file: File): Promise<string | null> {
  try {
    console.log("🔄 Iniciando subida de imagen:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validaciones mejoradas
    if (!file.type.startsWith("image/")) {
      console.error("❌ El archivo no es una imagen")
      throw new Error("El archivo debe ser una imagen")
    }

    if (file.size > 50 * 1024 * 1024) {
      console.error("❌ Archivo muy grande")
      throw new Error("El archivo debe ser menor a 50MB")
    }

    // Generar nombre único
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    console.log("📁 Subiendo a:", filePath)

    // Subir archivo con configuración optimizada
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      console.error("❌ Error en upload:", error)
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    console.log("✅ Upload exitoso:", data)

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl
    console.log("🌐 URL pública generada:", publicUrl)

    return publicUrl
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return null
  }
}

// =====================================================
// TEST DE STORAGE
// =====================================================

export async function testStorageConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("❌ Error al listar buckets:", error)
      return false
    }

    const bucket = data.find((b) => b.id === "product-images")
    if (!bucket) {
      console.error("❌ Bucket 'product-images' no encontrado")
      return false
    }

    console.log("✅ Storage conectado correctamente")
    return true
  } catch (error) {
    console.error("💥 Error de conexión storage:", error)
    return false
  }
}

// =====================================================
// CATEGORÍAS
// =====================================================

export async function getCategories(): Promise<string[]> {
  const defaultCategories = [
    "Premium",
    "Estándar",
    "Especial",
    "Eco",
    "Profesional",
    "Básico",
    "Tecnología",
    "Hogar",
    "Deportes",
    "Salud",
  ]

  try {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "categories").single()

    if (error || !data) {
      console.log("📋 Usando categorías por defecto")
      return defaultCategories
    }

    return JSON.parse(data.value)
  } catch (error) {
    console.log("⚠️ Error obteniendo categorías:", error)
    return defaultCategories
  }
}

// =====================================================
// PRODUCTS FUNCTIONS - MEJORADAS
// =====================================================

export async function getProducts(): Promise<Product[]> {
  try {
    console.log("📦 Obteniendo productos...")

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error obteniendo productos:", error)
      return []
    }

    console.log(`✅ ${data?.length || 0} productos obtenidos`)
    return data || []
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return []
  }
}

export async function getProductsWithStats(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_requests(count)
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error obteniendo productos con stats:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return []
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    console.log("➕ Creando producto:", product.name)

    const productData = {
      name: product.name.trim(),
      description: product.description.trim(),
      image: product.image,
      category: product.category,
      featured: product.featured,
      active: true,
      currency: "USD",
    }

    const { data, error } = await supabase.from("products").insert([productData]).select().single()

    if (error) {
      console.error("❌ Error creando producto:", error)
      throw new Error(`Error al crear producto: ${error.message}`)
    }

    console.log("✅ Producto creado:", data.id)
    return data
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return null
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    console.log("✏️ Actualizando producto:", id)

    // Limpiar datos de actualización
    const cleanUpdates: any = {}
    if (updates.name) cleanUpdates.name = updates.name.trim()
    if (updates.description) cleanUpdates.description = updates.description.trim()
    if (updates.image !== undefined) cleanUpdates.image = updates.image
    if (updates.category) cleanUpdates.category = updates.category
    if (updates.featured !== undefined) cleanUpdates.featured = updates.featured

    const { data, error } = await supabase.from("products").update(cleanUpdates).eq("id", id).select().single()

    if (error) {
      console.error("❌ Error actualizando producto:", error)
      throw new Error(`Error al actualizar producto: ${error.message}`)
    }

    console.log("✅ Producto actualizado:", data.id)
    return data
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    console.log("🗑️ Eliminando producto:", id)

    const { error } = await supabase.from("products").update({ active: false }).eq("id", id)

    if (error) {
      console.error("❌ Error eliminando producto:", error)
      return false
    }

    console.log("✅ Producto eliminado")
    return true
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return false
  }
}

// =====================================================
// PRODUCT REQUESTS FUNCTIONS
// =====================================================

export async function createProductRequest(
  request: Omit<ProductRequest, "id" | "created_at">,
): Promise<ProductRequest | null> {
  try {
    console.log("📝 Creando solicitud para producto:", request.product_id)

    const requestData = {
      product_id: request.product_id,
      customer_name: request.customer_name.trim(),
      customer_email: request.customer_email.trim(),
      customer_phone: request.customer_phone.trim(),
      message: request.message?.trim() || null,
      status: "pending",
    }

    const { data, error } = await supabase.from("product_requests").insert([requestData]).select().single()

    if (error) {
      console.error("❌ Error creando solicitud:", error)
      throw new Error(`Error al crear solicitud: ${error.message}`)
    }

    console.log("✅ Solicitud creada:", data.id)
    return data
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return null
  }
}

export async function getProductRequests(): Promise<any[]> {
  try {
    console.log("📋 Obteniendo solicitudes...")

    const { data, error } = await supabase
      .from("product_requests")
      .select(`
        *,
        products (
          name,
          category,
          image
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error obteniendo solicitudes:", error)
      return []
    }

    console.log(`✅ ${data?.length || 0} solicitudes obtenidas`)
    return data || []
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return []
  }
}

// =====================================================
// TICKETS FUNCTIONS - NUEVAS
// =====================================================

export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket | null> {
  try {
    console.log("🎫 Creando ticket:", ticket.title)

    const ticketData = {
      title: ticket.title.trim(),
      description: ticket.description.trim(),
      status: ticket.status || "open",
      priority: ticket.priority || "medium",
      customer_name: ticket.customer_name?.trim() || null,
      customer_email: ticket.customer_email?.trim() || null,
    }

    const { data, error } = await supabase.from("tickets").insert([ticketData]).select().single()

    if (error) {
      console.error("❌ Error creando ticket:", error)
      throw new Error(`Error al crear ticket: ${error.message}`)
    }

    console.log("✅ Ticket creado:", data.id)
    return data
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return null
  }
}

export async function getTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error obteniendo tickets:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return []
  }
}

export async function updateTicketStatus(id: string, status: string): Promise<boolean> {
  try {
    const updateData: any = { status }
    if (status === "closed") {
      updateData.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase.from("tickets").update(updateData).eq("id", id)

    if (error) {
      console.error("❌ Error actualizando ticket:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("💥 Error inesperado:", error)
    return false
  }
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export async function getDashboardStats(): Promise<any> {
  try {
    const [productsResult, requestsResult, ticketsResult] = await Promise.all([
      supabase.from("products").select("id, featured").eq("active", true),
      supabase.from("product_requests").select("id, status, created_at, customer_name, products(name)"),
      supabase.from("tickets").select("id, status"),
    ])

    const products = productsResult.data || []
    const requests = requestsResult.data || []
    const tickets = ticketsResult.data || []

    return {
      total_products: products.length,
      featured_products: products.filter((p) => p.featured).length,
      total_requests: requests.length,
      pending_requests: requests.filter((r) => r.status === "pending").length,
      total_tickets: tickets.length,
      open_tickets: tickets.filter((t) => t.status === "open").length,
      recent_requests: requests.slice(0, 5),
    }
  } catch (error) {
    console.error("💥 Error obteniendo estadísticas:", error)
    return {
      total_products: 0,
      featured_products: 0,
      total_requests: 0,
      pending_requests: 0,
      total_tickets: 0,
      open_tickets: 0,
      recent_requests: [],
    }
  }
}

// =====================================================
// AUTHENTICATION
// =====================================================

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  const validCredentials = [
    { email: "admin@stanley.com", password: "StanleySRL2024!" },
    { email: "stivion@stanley.com", password: "Dev2024Stanley!" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}

// =====================================================
// TEST FUNCTIONS
// =====================================================

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("products").select("count").limit(1)
    if (error) {
      console.error("❌ Test de base de datos falló:", error)
      return false
    }
    console.log("✅ Conexión a base de datos exitosa")
    return true
  } catch (error) {
    console.error("💥 Error en test de conexión:", error)
    return false
  }
}
