"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Star, Clock, AlertCircle, Eye, Download } from "lucide-react"
import DashboardStats from "@/components/dashboard-stats"
import { getProductsWithStats, getProductRequests, getTickets } from "@/lib/database"

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [productsData, requestsData, ticketsData] = await Promise.all([
        getProductsWithStats(),
        getProductRequests(),
        getTickets(),
      ])

      setProducts(productsData)
      setRequests(requestsData)
      setTickets(ticketsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
    setLoading(false)
  }

  // Prepare chart data
  const categoryData = products.reduce((acc: any, product: any) => {
    const category = product.category
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count,
  }))

  const statusData = [
    { name: "Pendientes", value: requests.filter((r: any) => r.status === "pending").length, color: "#f59e0b" },
    { name: "En Proceso", value: requests.filter((r: any) => r.status === "in-progress").length, color: "#3b82f6" },
    { name: "Completadas", value: requests.filter((r: any) => r.status === "completed").length, color: "#10b981" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Stanley SRL - Panel de Control</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.open("/", "_blank")}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Sitio
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats className="mb-8" />

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Productos por Categoría</CardTitle>
              <CardDescription>Distribución de productos por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Request Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Solicitudes</CardTitle>
              <CardDescription>Distribución por estado de solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Solicitudes Recientes</TabsTrigger>
            <TabsTrigger value="products">Productos Populares</TabsTrigger>
            <TabsTrigger value="tickets">Tickets Activos</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>Últimas solicitudes de productos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 10).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{request.customer_name}</p>
                          <p className="text-sm text-slate-600">{request.customer_email}</p>
                          <p className="text-xs text-slate-500">{request.products?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "destructive"
                              : request.status === "in-progress"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Solicitados</CardTitle>
                <CardDescription>Productos con mayor número de solicitudes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products
                    .sort((a: any, b: any) => (b.request_count || 0) - (a.request_count || 0))
                    .slice(0, 5)
                    .map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image || "/placeholder.svg?height=50&width=50"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-600">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{product.request_count || 0} solicitudes</Badge>
                          {product.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Tickets Activos</CardTitle>
                <CardDescription>Tickets que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets
                    .filter((ticket: any) => ticket.status !== "closed")
                    .slice(0, 10)
                    .map((ticket: any) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {ticket.status === "open" ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-slate-600">{ticket.customer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              ticket.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : ticket.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }
                          >
                            {ticket.priority}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
