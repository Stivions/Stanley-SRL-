"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PaymentFormProps {
  product: {
    id: string
    name: string
    description: string
    price?: number
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PaymentForm({ product, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: product.price || 100, // Default amount if no price set
          currency: "usd",
          productInfo: product,
          customerInfo,
        }),
      })

      const { clientSecret, customerId } = await response.json()

      if (clientSecret) {
        // Here you would integrate with Stripe Elements for card processing
        // For now, we'll simulate success
        toast({
          title: "¡Pago procesado!",
          description: "Tu solicitud ha sido procesada exitosamente.",
        })

        onSuccess?.()
      }
    } catch (error) {
      toast({
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Información de Pago
        </CardTitle>
        <CardDescription>Completa tus datos para procesar la solicitud de: {product.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold">${product.price ? product.price.toFixed(2) : "Consultar"}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Procesar Solicitud"
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
