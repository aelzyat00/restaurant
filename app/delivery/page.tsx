"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Package, MapPin, Phone, Clock, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface Order {
  id: string
  order_number: string
  total_amount: number
  delivery_address: string
  customer_phone: string
  estimated_delivery_time: string
  status: string
  created_at: string
  restaurants: {
    name: string
    address: string
    phone: string
    image_url: string
  }
  profiles: {
    full_name: string
    phone: string
  }
}

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null)
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

    if (!profile || profile.user_type !== "delivery") {
      router.push("/dashboard")
      return
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)

      // جلب الطلبات المتاحة
      const availableResponse = await fetch("/api/delivery/orders?status=ready")
      const availableData = await availableResponse.json()

      // جلب الطلبات المخصصة
      const assignedResponse = await fetch("/api/delivery/orders?status=assigned")
      const assignedData = await assignedResponse.json()

      if (availableResponse.ok) {
        setAvailableOrders(availableData.orders || [])
      }

      if (assignedResponse.ok) {
        setAssignedOrders(assignedData.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("حدث خطأ أثناء جلب الطلبات")
    } finally {
      setLoading(false)
    }
  }

  const assignOrder = async (orderId: string) => {
    try {
      setAssigningOrder(orderId)
      setError(null)

      const response = await fetch(`/api/delivery/orders/${orderId}/assign`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchOrders() // إعادة جلب الطلبات
      } else {
        const data = await response.json()
        setError(data.error || "حدث خطأ أثناء تخصيص الطلب")
      }
    } catch (error) {
      console.error("Error assigning order:", error)
      setError("حدث خطأ أثناء تخصيص الطلب")
    } finally {
      setAssigningOrder(null)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
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
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-blue-100 text-blue-800"
      case "picked_up":
        return "bg-orange-100 text-orange-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "جاهز للاستلام"
      case "picked_up":
        return "تم الاستلام"
      case "out_for_delivery":
        return "في الطريق"
      case "delivered":
        return "تم التوصيل"
      default:
        return status
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
              <Truck className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">لوحة تحكم الموصل</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/delivery/stats" className="text-sm text-gray-600 hover:text-restaurant-primary">
                الإحصائيات
              </Link>
              <Link href="/delivery/history" className="text-sm text-gray-600 hover:text-restaurant-primary">
                السجل
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-restaurant-primary">
                الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">طلبات متاحة</p>
                    <p className="text-2xl font-bold text-blue-600">{availableOrders.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">طلباتي النشطة</p>
                    <p className="text-2xl font-bold text-orange-600">{assignedOrders.length}</p>
                  </div>
                  <Truck className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">في الطريق</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {assignedOrders.filter((order) => order.status === "out_for_delivery").length}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مكتملة اليوم</p>
                    <p className="text-2xl font-bold text-green-600">
                      {assignedOrders.filter((order) => order.status === "delivered").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                الطلبات المتاحة ({availableOrders.length})
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                طلباتي ({assignedOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Available Orders */}
            <TabsContent value="available" className="space-y-4">
              {availableOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات متاحة</h3>
                  <p className="text-gray-600">لا توجد طلبات جاهزة للتوصيل في الوقت الحالي</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">طلب #{order.order_number}</CardTitle>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Restaurant Info */}
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                            <Image
                              src={
                                order.restaurants.image_url || "/placeholder.svg?height=40&width=40&query=restaurant"
                              }
                              alt={order.restaurants.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{order.restaurants.name}</h4>
                            <p className="text-xs text-gray-600">{order.restaurants.address}</p>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{order.profiles.full_name}</span>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">المبلغ:</span>
                          <span className="font-semibold">{order.total_amount} ر.س</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>منذ {new Date(order.created_at).toLocaleTimeString("ar-SA")}</span>
                        </div>

                        <Button
                          onClick={() => assignOrder(order.id)}
                          disabled={assigningOrder === order.id}
                          className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                        >
                          {assigningOrder === order.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              جاري التخصيص...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4 mr-2" />
                              استلام الطلب
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Assigned Orders */}
            <TabsContent value="assigned" className="space-y-4">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Truck className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات مخصصة</h3>
                  <p className="text-gray-600">لم تقم بتخصيص أي طلبات للتوصيل بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">طلب #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">من {order.restaurants.name}</p>
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

                          {/* Restaurant Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">معلومات المطعم</h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{order.restaurants.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{order.restaurants.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">المبلغ الإجمالي:</span>
                          <span className="font-semibold">{order.total_amount} ر.س</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {order.status === "picked_up" && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                              className="flex-1 bg-restaurant-primary hover:bg-restaurant-primary/90"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              في الطريق للعميل
                            </Button>
                          )}
                          {order.status === "out_for_delivery" && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, "delivered")}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              تم التوصيل
                            </Button>
                          )}
                          <Link href={`tel:${order.customer_phone}`}>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              اتصال
                            </Button>
                          </Link>
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
