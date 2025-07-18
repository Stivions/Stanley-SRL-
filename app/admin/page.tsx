"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Package,
  TicketIcon,
  Shield,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ImageIcon,
  Upload,
  X,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductRequests,
  getTickets,
  updateTicketStatus,
  uploadImage,
  getCategories,
  authenticateAdmin,
  testStorageConnection,
  type Product,
  type Ticket,
} from "@/lib/database"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    featured: false,
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Requests state
  const [requests, setRequests] = useState<any[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      initializeAdmin()
    }
  }, [isAuthenticated])

  const initializeAdmin = async () => {
    console.log("🚀 Inicializando panel de admin...")

    // Test storage connection
    const storageOk = await testStorageConnection()
    if (!storageOk) {
      toast({
        title: "⚠️ Advertencia de Storage",
        description: "Puede haber problemas con la subida de imágenes",
        variant: "destructive",
      })
    }

    await loadAllData()
  }

  const loadAllData = async () => {
    await Promise.all([loadProducts(), loadRequests(), loadTickets(), loadCategories()])
  }

  const loadProducts = async () => {
    setProductsLoading(true)
    const data = await getProducts()
    setProducts(data)
    setProductsLoading(false)
  }

  const loadRequests = async () => {
    setRequestsLoading(true)
    const data = await getProductRequests()
    setRequests(data)
    setRequestsLoading(false)
  }

  const loadTickets = async () => {
    setTicketsLoading(true)
    const data = await getTickets()
    setTickets(data)
    setTicketsLoading(false)
  }

  const loadCategories = async () => {
    const data = await getCategories()
    setCategories(data)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const isValid = await authenticateAdmin(loginForm.email, loginForm.password)

      if (isValid) {
        setIsAuthenticated(true)
        toast({
          title: "✅ ¡Acceso concedido!",
          description: "Bienvenido al panel de administración de Stanley SRL.",
        })
      } else {
        toast({
          title: "❌ Error de autenticación",
          description: "Credenciales incorrectas. Verifica tu email y contraseña.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "💥 Error del sistema",
        description: "No se pudo verificar las credenciales. Intenta nuevamente.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)

    try {
      console.log("📤 Subiendo imagen:", file.name)

      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        setProductForm({ ...productForm, image: imageUrl })
        toast({
          title: "✅ ¡Imagen subida!",
          description: "La imagen se ha subido correctamente.",
        })
        console.log("✅ Imagen subida exitosamente:", imageUrl)
      } else {
        throw new Error("No se pudo obtener URL de la imagen")
      }
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error)
      toast({
        title: "❌ Error al subir imagen",
        description: "No se pudo subir la imagen. Verifica el archivo e intenta nuevamente.",
        variant: "destructive",
      })
    }

    setImageUploading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("📁 Archivo seleccionado:", file.name, file.type, file.size)
      setImageFile(file)
      handleImageUpload(file)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!productForm.name.trim() || !productForm.description.trim() || !productForm.category) {
        throw new Error("Todos los campos obligatorios deben estar completos")
      }

      const result = await createProduct({
        name: productForm.name,
        description: productForm.description,
        image: productForm.image || null,
        category: productForm.category,
        featured: productForm.featured,
        active: true,
        currency: "USD",
      } as any)

      if (result) {
        setProducts([result, ...products])
        resetForm()
        setDialogOpen(false)
        toast({
          title: "✅ ¡Producto agregado!",
          description: "El producto se ha agregado exitosamente a la tienda.",
        })
      } else {
        throw new Error("No se pudo crear el producto")
      }
    } catch (error: any) {
      console.error("❌ Error agregando producto:", error)
      toast({
        title: "❌ Error al agregar producto",
        description: error.message || "No se pudo agregar el producto. Intenta nuevamente.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setLoading(true)

    try {
      if (!productForm.name.trim() || !productForm.description.trim() || !productForm.category) {
        throw new Error("Todos los campos obligatorios deben estar completos")
      }

      const result = await updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        image: productForm.image || null,
        category: productForm.category,
        featured: productForm.featured,
      })

      if (result) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? result : p)))
        resetForm()
        setDialogOpen(false)
        toast({
          title: "✅ ¡Producto actualizado!",
          description: "Los cambios se han guardado exitosamente.",
        })
      } else {
        throw new Error("No se pudo actualizar el producto")
      }
    } catch (error: any) {
      console.error("❌ Error actualizando producto:", error)
      toast({
        title: "❌ Error al actualizar",
        description: error.message || "No se pudo actualizar el producto.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    const success = await deleteProduct(id)

    if (success) {
      setProducts(products.filter((p) => p.id !== id))
      toast({
        title: "✅ Producto eliminado",
        description: "El producto se ha eliminado exitosamente.",
      })
    } else {
      toast({
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    console.log("✏️ Editando producto:", product.name)
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      image: product.image || "",
      category: product.category,
      featured: product.featured,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setProductForm({ name: "", description: "", image: "", category: "", featured: false })
    setImageFile(null)
  }

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    const success = await updateTicketStatus(ticketId, newStatus)

    if (success) {
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t)))
      toast({
        title: "✅ Estado actualizado",
        description: "El estado del ticket se ha actualizado.",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 animate-pulse"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-md animate-scale-in shadow-2xl bg-white/80 backdrop-blur-md border-0 relative z-10">
          <CardHeader className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-float shadow-lg">
                <Shield className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-ping"></div>
            </div>
            <CardTitle className="text-2xl animate-slide-up bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Panel de Administración
            </CardTitle>
            <CardDescription className="animate-slide-up animation-delay-200">
              Stanley SRL - Acceso restringido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="animate-slide-up animation-delay-300">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <span>Email</span>
                  <Sparkles className="w-3 h-3 text-blue-500" />
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@stanley.com"
                  required
                  disabled={loading}
                  className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                />
              </div>
              <div className="animate-slide-up animation-delay-400">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <span>Contraseña</span>
                  <Zap className="w-3 h-3 text-purple-500" />
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full animate-slide-up animation-delay-500 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-slate-600 animate-fade-in animation-delay-200">Stanley SRL - Gestión completa</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.open("/", "_blank")}
              className="hover:scale-105 transition-all duration-300 hover:shadow-lg group bg-white/80 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Ver Sitio
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              className="hover:scale-105 transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-up animation-delay-300">
            <TabsTrigger
              value="products"
              className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              <span>Productos ({products.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <TicketIcon className="w-4 h-4" />
              <span>Solicitudes ({requests.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span>Tickets ({tickets.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="animate-slide-up animation-delay-400 bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Gestión de Productos</span>
                </CardTitle>
                <CardDescription>Agregar, editar o eliminar productos de la tienda</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      onClick={() => resetForm()}
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in bg-white/95 backdrop-blur-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        {editingProduct ? (
                          <Edit className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-5 text-green-600" />
                        )}
                        <span>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</span>
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct
                          ? "Modifica la información del producto"
                          : "Completa la información del nuevo producto"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                      <div className="animate-slide-up">
                        <Label htmlFor="name">Nombre del producto *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          disabled={loading}
                          placeholder="Nombre del producto"
                          className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                        />
                      </div>

                      <div className="animate-slide-up animation-delay-100">
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          required
                          disabled={loading}
                          rows={3}
                          placeholder="Descripción detallada del producto"
                          className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                        />
                      </div>

                      <div className="animate-slide-up animation-delay-200">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                          disabled={loading}
                        >
                          <SelectTrigger className="transition-all duration-300 focus:scale-105 focus:shadow-lg">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category} className="hover:bg-blue-50">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="animate-slide-up animation-delay-300">
                        <Label htmlFor="image">Imagen del producto</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              disabled={loading || imageUploading}
                              className="flex-1 transition-all duration-300 focus:scale-105"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={loading || imageUploading}
                              onClick={() => document.getElementById("image")?.click()}
                              className="hover:scale-110 transition-transform duration-200"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>

                          {imageUploading && (
                            <div className="flex items-center space-x-2 text-blue-600 animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Subiendo imagen...</span>
                            </div>
                          )}

                          {productForm.image && !imageUploading && (
                            <div className="flex items-center space-x-2 animate-fade-in">
                              <div className="flex items-center space-x-2 text-green-600">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-sm">Imagen cargada correctamente</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setProductForm({ ...productForm, image: "" })}
                                className="hover:scale-110 transition-transform duration-200"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {productForm.image && (
                            <div className="mt-2 animate-scale-in">
                              <img
                                src={productForm.image || "/placeholder.svg"}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded border shadow-lg hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  console.error("Error cargando preview de imagen")
                                  setProductForm({ ...productForm, image: "" })
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 animate-slide-up animation-delay-400">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          disabled={loading}
                          className="transition-transform duration-200 hover:scale-110"
                        />
                        <Label htmlFor="featured" className="flex items-center space-x-1">
                          <span>Producto destacado</span>
                          <Star className="w-3 h-3 text-yellow-500" />
                        </Label>
                      </div>

                      <div className="flex space-x-2 animate-slide-up animation-delay-500">
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                          disabled={loading || imageUploading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {editingProduct ? "Actualizando..." : "Agregando..."}
                            </>
                          ) : editingProduct ? (
                            <>
                              <Edit className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                              Actualizar Producto
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                              Agregar Producto
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetForm()
                            setDialogOpen(false)
                          }}
                          disabled={loading}
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {productsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <div className="absolute inset-0 w-8 h-8 border-4 border-blue-200 rounded-full animate-ping"></div>
                    </div>
                    <span className="ml-4 text-slate-600 animate-pulse">Cargando productos...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <Card
                        key={product.id}
                        className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up bg-white/80 backdrop-blur-sm border-0 shadow-lg group overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <CardContent className="p-4 relative z-10">
                          <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                            <img
                              src={product.image || "/images/test-product.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=200&width=200"
                              }}
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 hover:bg-white"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>

                            {product.featured && (
                              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                                <Star className="w-3 h-3 mr-1 animate-spin" />
                                Destacado
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors duration-300">
                            {product.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors duration-300">
                            {product.description}
                          </p>

                          <div className="flex items-center space-x-2 mb-3">
                            <Badge
                              variant="secondary"
                              className="group-hover:bg-blue-100 transition-colors duration-300"
                            >
                              {product.category}
                            </Badge>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent hover:bg-blue-50 transition-all duration-300 hover:scale-105 group/button"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-3 h-3 mr-1 group-hover/button:animate-bounce" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="hover:scale-110 transition-transform duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="animate-slide-up animation-delay-400 bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TicketIcon className="w-5 h-5 text-green-600" />
                  <span>Solicitudes de Productos</span>
                </CardTitle>
                <CardDescription>Gestionar solicitudes de información de clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      <div className="absolute inset-0 w-8 h-8 border-4 border-green-200 rounded-full animate-ping"></div>
                    </div>
                    <span className="ml-4 text-slate-600 animate-pulse">Cargando solicitudes...</span>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <TicketIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request, index) => (
                      <Card
                        key={request.id}
                        className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up bg-white/80 backdrop-blur-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold hover:text-blue-600 transition-colors duration-300">
                              {request.customer_name}
                            </h4>
                            <Badge variant="outline" className="animate-pulse">
                              {new Date(request.created_at || "").toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>Email:</strong> {request.customer_email}
                              </p>
                              <p>
                                <strong>Teléfono:</strong> {request.customer_phone}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Producto:</strong> {request.products?.name || "N/A"}
                              </p>
                              <p>
                                <strong>Categoría:</strong> {request.products?.category || "N/A"}
                              </p>
                            </div>
                          </div>
                          {request.message && (
                            <div className="mt-3 p-3 bg-slate-50 rounded animate-fade-in">
                              <p className="text-sm">
                                <strong>Mensaje:</strong>
                              </p>
                              <p className="text-sm text-slate-600">{request.message}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="animate-slide-up animation-delay-400 bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Sistema de Tickets</span>
                </CardTitle>
                <CardDescription>Gestionar tickets de soporte y consultas</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      <div className="absolute inset-0 w-8 h-8 border-4 border-purple-200 rounded-full animate-ping"></div>
                    </div>
                    <span className="ml-4 text-slate-600 animate-pulse">Cargando tickets...</span>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No hay tickets disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket, index) => (
                      <Card
                        key={ticket.id}
                        className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up bg-white/80 backdrop-blur-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold hover:text-purple-600 transition-colors duration-300">
                              {ticket.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span className="text-sm capitalize">{ticket.status}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                              {new Date(ticket.created_at || "").toLocaleString()}
                            </span>
                            <div className="flex space-x-2">
                              {ticket.status !== "closed" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateTicketStatus(ticket.id!, "in-progress")}
                                    className="hover:scale-105 transition-transform duration-200"
                                  >
                                    En Progreso
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleUpdateTicketStatus(ticket.id!, "closed")}
                                    className="hover:scale-105 transition-transform duration-200"
                                  >
                                    Cerrar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
