"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Package, MapPin, Phone, Clock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  total_amount: number
  delivery_address: string
  customer_phone: string
  status: string
  created_at: string
  restaurants: {
    name: string
    address: string
  }
  profiles: {
    full_name: string
  }
}

export default function DeliveryHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, dateFilter])

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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // جلب جميع طلبات الموصل
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurants (name, address),
          profiles!orders_customer_id_fkey (full_name)
        `)
        .eq("delivery_person_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(ordersData || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.restaurants.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // فلترة بالحالة
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // فلترة بالتاريخ
    if (dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter((order) => new Date(order.created_at) >= startDate)
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
              <Calendar className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">سجل التوصيلات</h1>
            </div>
            <Link href="/delivery" className="text-sm text-gray-600 hover:text-restaurant-primary">
              ← العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>البحث والفلترة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث برقم الطلب أو اسم المطعم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="picked_up">تم الاستلام</SelectItem>
                    <SelectItem value="out_for_delivery">في الطريق</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة بالتاريخ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التواريخ</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              عرض {filteredOrders.length} من أصل {orders.length} طلب
            </p>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات</h3>
              <p className="text-gray-600">لا توجد طلبات تطابق معايير البحث المحددة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">طلب #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString("ar-SA")} -{" "}
                          {new Date(order.created_at).toLocaleTimeString("ar-SA")}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Restaurant Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">المطعم</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{order.restaurants.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{order.restaurants.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">العميل</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{order.profiles.full_name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{order.customer_phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">التوصيل</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {Math.round((new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60))}{" "}
                              دقيقة مضت
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{order.total_amount} ر.س</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${order.customer_phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            اتصال
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
