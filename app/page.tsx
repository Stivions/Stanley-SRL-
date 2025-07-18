"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Star,
  ArrowRight,
  Youtube,
  Github,
  MessageCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  Heart,
  Package,
  HelpCircle,
  Send,
  LifeBuoy,
  MessageSquare,
  Menu,
  X,
  Settings,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getProducts, createProductRequest, testDatabaseConnection, createTicket, type Product } from "@/lib/database"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    customer_name: "",
    customer_email: "",
    product_id: "",
  })

  useEffect(() => {
    initializeApp()
  }, [])

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  const initializeApp = async () => {
    console.log("Initializing app...")

    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      setConnectionError(true)
      setLoading(false)
      return
    }

    await loadProducts()
  }

  const loadProducts = async () => {
    setLoading(true)
    setConnectionError(false)

    try {
      const data = await getProducts()
      console.log("Loaded products:", data.length)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
      setConnectionError(true)
    }

    setLoading(false)
  }

  const handleRequestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedProduct) return

      setSubmitting(true)

      try {
        const request = {
          product_id: selectedProduct.id,
          customer_name: requestForm.name.trim(),
          customer_email: requestForm.email.trim(),
          customer_phone: requestForm.phone.trim(),
          message: requestForm.message.trim() || null,
        }

        const result = await createProductRequest(request)

        if (result) {
          toast({
            title: "¡Solicitud enviada!",
            description: "Te contactaremos pronto.",
          })
          setRequestForm({ name: "", email: "", phone: "", message: "" })
          setSelectedProduct(null)
          setDialogOpen(false)
        } else {
          throw new Error("Failed to create request")
        }
      } catch (error) {
        console.error("Error submitting request:", error)
        toast({
          title: "Error al enviar",
          description: "Intenta nuevamente.",
          variant: "destructive",
        })
      }

      setSubmitting(false)
    },
    [selectedProduct, requestForm],
  )

  const handleTicketSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)

      try {
        const ticket = {
          title: ticketForm.title.trim(),
          description: ticketForm.description.trim(),
          priority: ticketForm.priority as "low" | "medium" | "high",
          customer_name: ticketForm.customer_name.trim(),
          customer_email: ticketForm.customer_email.trim(),
          status: "open" as const,
        }

        const result = await createTicket(ticket)

        if (result) {
          toast({
            title: "¡Ticket creado!",
            description: "Te contactaremos pronto.",
          })
          setTicketForm({
            title: "",
            description: "",
            priority: "medium",
            customer_name: "",
            customer_email: "",
            product_id: "",
          })
          setTicketDialogOpen(false)
        } else {
          throw new Error("Failed to create ticket")
        }
      } catch (error) {
        console.error("Error submitting ticket:", error)
        toast({
          title: "Error al crear ticket",
          description: "Intenta nuevamente.",
          variant: "destructive",
        })
      }

      setSubmitting(false)
    },
    [ticketForm],
  )

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }, [])

  const handleHelpWithProduct = useCallback((product: Product) => {
    setTicketForm((prev) => ({
      ...prev,
      title: `Ayuda con: ${product.name}`,
      product_id: product.id,
    }))
    setTicketDialogOpen(true)
  }, [])

  const toggleLike = useCallback((productId: string) => {
    setLikedProducts((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(productId)) {
        newLiked.delete(productId)
      } else {
        newLiked.add(productId)
      }
      return newLiked
    })
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMobileMenuOpen(false)
  }, [])

  const navigateToAdmin = useCallback(() => {
    window.location.href = "/admin"
    setMobileMenuOpen(false)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Error de Conexión</CardTitle>
            <CardDescription>No se pudo conectar con la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={initializeApp} className="w-full min-h-[48px] text-base" size="lg">
              <Loader2 className="w-4 h-4 mr-2" />
              Reintentar Conexión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative">
      {/* Header Optimizado para Móviles */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Stanley SRL
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection("productos")}
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-blue-50"
              >
                Productos
              </button>
              <button
                onClick={() => scrollToSection("ayuda")}
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-blue-50"
              >
                Ayuda
              </button>
              <button
                onClick={navigateToAdmin}
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-blue-50"
              >
                Admin
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={closeMobileMenu} />

              {/* Menu */}
              <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 md:hidden">
                <nav className="container mx-auto px-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => scrollToSection("productos")}
                      className="flex items-center space-x-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200 min-h-[48px] text-left"
                    >
                      <Package className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">Productos</span>
                    </button>
                    <button
                      onClick={() => scrollToSection("ayuda")}
                      className="flex items-center space-x-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200 min-h-[48px] text-left"
                    >
                      <HelpCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">Ayuda</span>
                    </button>
                    <button
                      onClick={navigateToAdmin}
                      className="flex items-center space-x-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200 min-h-[48px] text-left"
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">Admin</span>
                    </button>
                    <div className="pt-2 border-t border-slate-200">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[48px] text-base"
                        onClick={() => {
                          setTicketDialogOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <LifeBuoy className="w-4 h-4 mr-2" />
                        Crear Ticket
                      </Button>
                    </div>
                  </div>
                </nav>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 sm:mb-6">
              Productos
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Exclusivos
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 px-2">
              Descubre nuestra colección cuidadosamente seleccionada de productos premium.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-full min-h-[48px] text-base sm:text-lg"
              onClick={() => scrollToSection("productos")}
            >
              <span className="mr-2">Explorar Productos</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-4">Nuestra Colección</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-4" />
              <span className="text-slate-600 text-sm sm:text-base">Cargando productos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4 text-sm sm:text-base">No hay productos disponibles en este momento.</p>
              <Button onClick={loadProducts} variant="outline" className="min-h-[48px] text-base bg-transparent">
                Recargar Productos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden"
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.image || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=400&width=400"
                        }}
                      />

                      {/* Featured badge */}
                      {product.featured && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Destacado
                        </Badge>
                      )}

                      {/* Category badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 bg-white/90 text-slate-700 backdrop-blur-sm text-xs"
                      >
                        {product.category}
                      </Badge>

                      {/* Mobile Action Buttons */}
                      <div className="absolute bottom-2 right-2 flex space-x-1 sm:hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(product.id)
                          }}
                          className="p-2 bg-white/90 rounded-full shadow-md min-w-[40px] min-h-[40px] flex items-center justify-center"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              likedProducts.has(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHelpWithProduct(product)
                          }}
                          className="p-2 bg-white/90 rounded-full shadow-md min-w-[40px] min-h-[40px] flex items-center justify-center"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg md:text-xl mb-2 text-slate-800 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600 mb-4 line-clamp-3 text-sm">
                      {product.description}
                    </CardDescription>

                    <div className="flex flex-col space-y-2">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-h-[48px] text-base"
                        onClick={() => handleProductSelect(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        <span>Solicitar Información</span>
                      </Button>

                      {/* Desktop Action Buttons */}
                      <div className="hidden sm:flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-h-[40px] bg-transparent"
                          onClick={() => toggleLike(product.id)}
                        >
                          <Heart
                            className={`w-4 h-4 mr-1 ${
                              likedProducts.has(product.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                          Me gusta
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-h-[40px] bg-transparent"
                          onClick={() => handleHelpWithProduct(product)}
                        >
                          <HelpCircle className="w-4 h-4 mr-1" />
                          Ayuda
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Request Dialog - Optimizado para Móviles */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Solicitar: {selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-sm">Completa el formulario y te contactaremos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo *
              </Label>
              <Input
                id="name"
                value={requestForm.name}
                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                required
                disabled={submitting}
                placeholder="Tu nombre completo"
                className="mt-1 min-h-[48px] text-base"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={requestForm.email}
                onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                required
                disabled={submitting}
                placeholder="tu@email.com"
                className="mt-1 min-h-[48px] text-base"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={requestForm.phone}
                onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                required
                disabled={submitting}
                placeholder="+1234567890"
                className="mt-1 min-h-[48px] text-base"
                autoComplete="tel"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Mensaje adicional
              </Label>
              <Textarea
                id="message"
                value={requestForm.message}
                onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                placeholder="Cuéntanos más sobre tu interés..."
                disabled={submitting}
                rows={3}
                className="mt-1 text-base resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[48px] text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="min-h-[48px] text-base"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Ticket Dialog - Optimizado para Móviles */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              <LifeBuoy className="w-5 h-5 inline mr-2 text-green-600" />
              Solicitar Ayuda
            </DialogTitle>
            <DialogDescription className="text-sm">Crea un ticket y te asistiremos lo antes posible.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ticket-title" className="text-sm font-medium">
                Título del problema *
              </Label>
              <Input
                id="ticket-title"
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                required
                disabled={submitting}
                placeholder="Describe brevemente tu problema"
                className="mt-1 min-h-[48px] text-base"
              />
            </div>
            <div>
              <Label htmlFor="ticket-description" className="text-sm font-medium">
                Descripción detallada *
              </Label>
              <Textarea
                id="ticket-description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                required
                disabled={submitting}
                rows={4}
                placeholder="Explica detalladamente tu problema..."
                className="mt-1 text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket-name" className="text-sm font-medium">
                  Tu nombre *
                </Label>
                <Input
                  id="ticket-name"
                  value={ticketForm.customer_name}
                  onChange={(e) => setTicketForm({ ...ticketForm, customer_name: e.target.value })}
                  required
                  disabled={submitting}
                  placeholder="Tu nombre completo"
                  className="mt-1 min-h-[48px] text-base"
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="ticket-email" className="text-sm font-medium">
                  Tu email *
                </Label>
                <Input
                  id="ticket-email"
                  type="email"
                  value={ticketForm.customer_email}
                  onChange={(e) => setTicketForm({ ...ticketForm, customer_email: e.target.value })}
                  required
                  disabled={submitting}
                  placeholder="tu@email.com"
                  className="mt-1 min-h-[48px] text-base"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ticket-priority" className="text-sm font-medium">
                Prioridad
              </Label>
              <Select
                value={ticketForm.priority}
                onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                disabled={submitting}
              >
                <SelectTrigger className="mt-1 min-h-[48px] text-base">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Baja - No es urgente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Media - Moderadamente importante</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Alta - Urgente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 min-h-[48px] text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Crear Ticket
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTicketDialogOpen(false)}
                disabled={submitting}
                className="min-h-[48px] text-base"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <section id="ayuda" className="py-8 sm:py-12 md:py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-4">¿Necesitas Ayuda?</h3>
            <p className="text-slate-600 px-2 text-sm sm:text-base">
              Estamos aquí para asistirte con cualquier consulta
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-blue-600 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: MessageSquare,
                title: "Consulta General",
                description: "Preguntas sobre productos y precios",
                action: "Crear Consulta",
                priority: "medium",
                color: "blue",
              },
              {
                icon: AlertCircle,
                title: "Problema Técnico",
                description: "Reportar problemas con productos",
                action: "Reportar Problema",
                priority: "high",
                color: "red",
              },
              {
                icon: HelpCircle,
                title: "Soporte Personalizado",
                description: "Ayuda específica con configuración",
                action: "Solicitar Soporte",
                priority: "medium",
                color: "green",
              },
            ].map((help, index) => (
              <Card
                key={help.title}
                className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg"
              >
                <div className="mb-4">
                  <help.icon
                    className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto ${
                      help.color === "blue" ? "text-blue-600" : help.color === "red" ? "text-red-600" : "text-green-600"
                    }`}
                  />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">{help.title}</h4>
                <p className="text-slate-600 mb-4 text-sm sm:text-base">{help.description}</p>
                <Button
                  variant="outline"
                  className="w-full min-h-[48px] text-base bg-transparent"
                  onClick={() => {
                    setTicketForm((prev) => ({
                      ...prev,
                      title: help.title,
                      priority: help.priority,
                    }))
                    setTicketDialogOpen(true)
                  }}
                >
                  <help.icon className="w-4 h-4 mr-2" />
                  {help.action}
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-8 sm:mt-12">
            <p className="text-slate-600 mb-4 px-2 text-sm sm:text-base">¿Tienes una consulta específica?</p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 rounded-full min-h-[48px] text-base sm:text-lg"
              onClick={() => setTicketDialogOpen(true)}
            >
              <LifeBuoy className="w-5 h-5 mr-2" />
              <span>Crear Ticket de Ayuda</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 sm:py-8 md:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Stanley SRL</h2>
              </div>
              <p className="text-slate-400 mb-4 text-sm sm:text-base">
                Productos exclusivos con la mejor calidad y servicio personalizado.
              </p>
            </div>

            {/* Social Links */}
            <div className="text-center md:text-right">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex justify-center md:justify-end space-x-4">
                {[
                  { icon: Youtube, url: "https://www.youtube.com/@sstivion", color: "text-red-400", name: "YouTube" },
                  { icon: Github, url: "https://github.com/Stivions", color: "text-slate-400", name: "GitHub" },
                  {
                    icon: MessageCircle,
                    url: "https://discord.com/invite/qeE8hCGVgb",
                    color: "text-indigo-400",
                    name: "Discord",
                  },
                ].map((social, index) => (
                  <button
                    key={index}
                    className="p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    onClick={() => window.open(social.url, "_blank")}
                    aria-label={social.name}
                  >
                    <social.icon className={`w-5 h-5 ${social.color}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Desarrollado con ❤️ por{" "}
              <a
                href="https://github.com/Stivions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200"
              >
                Stivion
              </a>{" "}
              | © 2024 Stanley SRL. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
