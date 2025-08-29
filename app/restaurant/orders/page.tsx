"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Clock, CheckCircle, X, Phone, MapPin, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  total_amount: number
  delivery_address: string
  customer_phone: string
  notes: string
  status: string
  created_at: string
  profiles: {
    full_name: string
    phone: string
  }
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    special_instructions: string
    food_items: {
      name: string
      price: number
    }
  }>
}

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      router.push("/auth/login")
      return
    }

    // التحقق من نوع المستخدم
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (!profile || profile.user_type !== "restaurant") {
      router.push("/dashboard")
      return
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // الحصول على المطعم
      const { data: restaurant } = await supabase.from("restaurants").select("id").eq("owner_id", user.id).single()

      if (!restaurant) return

      // جلب الطلبات
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!orders_customer_id_fkey (full_name, phone),
          order_items (
            *,
            food_items (name, price)
          )
        `)
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(ordersData || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("حدث خطأ أثناء جلب الطلبات")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrder(orderId)
      setError(null)

      const response = await fetch(`/api/orders/${orderId}/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchOrders()
      } else {
        const data = await response.json()
        setError(data.error || "حدث خطأ أثناء تحديث حالة الطلب")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      setError("حدث خطأ أثناء تحديث حالة الطلب")
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "picked_up":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "جديد"
      case "confirmed":
        return "مؤكد"
      case "preparing":
        return "قيد التحضير"
      case "ready":
        return "جاهز"
      case "picked_up":
        return "تم الاستلام"
      case "delivered":
        return "تم التوصيل"
      case "cancelled":
        return "ملغي"
      default:
        return status
    }
  }

  const filterOrdersByStatus = (status: string) => {
    switch (status) {
      case "new":
        return orders.filter((order) => order.status === "pending")
      case "active":
        return orders.filter((order) => ["confirmed", "preparing", "ready"].includes(order.status))
      case "completed":
        return orders.filter((order) => ["delivered", "cancelled"].includes(order.status))
      default:
        return orders
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-restaurant-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">إدارة الطلبات</h1>
            </div>
            <Link href="/restaurant" className="text-sm text-gray-600 hover:text-restaurant-primary">
              ← العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="new" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                طلبات جديدة ({filterOrdersByStatus("new").length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                قيد التنفيذ ({filterOrdersByStatus("active").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                مكتملة ({filterOrdersByStatus("completed").length})
              </TabsTrigger>
            </TabsList>

            {/* New Orders */}
            <TabsContent value="new" className="space-y-4">
              {filterOrdersByStatus("new").length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات جديدة</h3>
                  <p className="text-gray-600">جميع الطلبات تم التعامل معها</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterOrdersByStatus("new").map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">طلب #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("ar-SA")}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Customer Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">معلومات العميل</h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{order.delivery_address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{order.customer_phone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">عناصر الطلب</h4>
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="text-sm text-gray-600">
                                  {item.food_items.name} × {item.quantity}
                                  {item.special_instructions && (
                                    <p className="text-xs text-gray-500 mr-4">ملاحظة: {item.special_instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm">
                              <strong>ملاحظات العميل:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">{order.total_amount} ر.س</span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              disabled={updatingOrder === order.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingOrder === order.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              قبول الطلب
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              disabled={updatingOrder === order.id}
                            >
                              <X className="h-4 w-4 mr-2" />
                              رفض
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Active Orders */}
            <TabsContent value="active" className="space-y-4">
              {filterOrdersByStatus("active").length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات قيد التنفيذ</h3>
                  <p className="text-gray-600">جميع الطلبات مكتملة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterOrdersByStatus("active").map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">طلب #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("ar-SA")}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Order Items */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">عناصر الطلب</h4>
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="text-sm text-gray-600">
                                  {item.food_items.name} × {item.quantity}
                                  {item.special_instructions && (
                                    <p className="text-xs text-gray-500 mr-4">ملاحظة: {item.special_instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">معلومات التوصيل</h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{order.delivery_address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{order.customer_phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">{order.total_amount} ر.س</span>
                          <div className="flex gap-2">
                            {order.status === "confirmed" && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, "preparing")}
                                disabled={updatingOrder === order.id}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                {updatingOrder === order.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Clock className="h-4 w-4 mr-2" />
                                )}
                                بدء التحضير
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, "ready")}
                                disabled={updatingOrder === order.id}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {updatingOrder === order.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                جاهز للاستلام
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Orders */}
            <TabsContent value="completed" className="space-y-4">
              {filterOrdersByStatus("completed").length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات مكتملة</h3>
                  <p className="text-gray-600">لم يتم إكمال أي طلبات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterOrdersByStatus("completed").map((order) => (
                    <Card
                      key={order.id}
                      className={`border-l-4 ${order.status === "delivered" ? "border-l-green-500" : "border-l-red-500"}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">طلب #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("ar-SA")}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">{order.order_items.length} عنصر</div>
                          <span className="font-semibold text-lg">{order.total_amount} ر.س</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
