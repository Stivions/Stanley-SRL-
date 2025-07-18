"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Users, TicketIcon, TrendingUp, Clock } from "lucide-react"
import { getDashboardStats } from "@/lib/database"

interface DashboardStatsProps {
  className?: string
}

export default function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const data = await getDashboardStats()
    setStats(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Cargando estadísticas...</span>
      </div>
    )
  }

  if (!stats) {
    return <div className={`text-center py-8 text-slate-500 ${className}`}>No se pudieron cargar las estadísticas</div>
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_products || 0}</div>
          <p className="text-xs text-muted-foreground">{stats.featured_products || 0} destacados</p>
        </CardContent>
      </Card>

      {/* Total Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_requests || 0}</div>
          <p className="text-xs text-muted-foreground">{stats.pending_requests || 0} pendientes</p>
        </CardContent>
      </Card>

      {/* Total Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets</CardTitle>
          <TicketIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_tickets || 0}</div>
          <p className="text-xs text-muted-foreground">{stats.open_tickets || 0} abiertos</p>
        </CardContent>
      </Card>

      {/* Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12%</div>
          <p className="text-xs text-muted-foreground">vs mes anterior</p>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      {stats.recent_requests && stats.recent_requests.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Solicitudes Recientes</CardTitle>
            <CardDescription>Últimas solicitudes de productos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_requests.slice(0, 5).map((request: any, index: number) => (
                <div key={request.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">{request.customer_name}</p>
                      <p className="text-xs text-slate-600">{request.product_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
