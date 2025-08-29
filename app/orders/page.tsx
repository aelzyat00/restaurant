import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Utensils, Clock, Package, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function OrdersPage() {
  const supabase = await createClient()

  // التحقق من تسجيل الدخول
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // الحصول على طلبات المستخدم
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      restaurants (name, image_url),
      order_items (
        *,
        food_items (name, price)
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
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
        return "قيد المراجعة"
      case "confirmed":
        return "تم التأكيد"
      case "preparing":
        return "قيد التحضير"
      case "ready":
        return "جاهز للاستلام"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
      case "preparing":
        return <Package className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/customer" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">طلباتي</h2>
            <p className="text-gray-600">تتبع جميع طلباتك السابقة والحالية</p>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد طلبات بعد</h3>
              <p className="text-gray-600 mb-8">ابدأ بطلب طعامك المفضل من المطاعم المتاحة</p>
              <Link href="/restaurants">
                <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">تصفح المطاعم</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                          <Image
                            src={order.restaurants?.image_url || "/placeholder.svg?height=48&width=48&query=restaurant"}
                            alt={order.restaurants?.name || "مطعم"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.restaurants?.name}</h3>
                          <p className="text-sm text-gray-600">طلب #{order.order_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("ar-SA")} -{" "}
                            {new Date(order.created_at).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.order_items.length} عنصر - {order.total_amount} ر.س
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.order_items.slice(0, 3).map((item: any) => (
                          <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.food_items.name} × {item.quantity}
                          </span>
                        ))}
                        {order.order_items.length > 3 && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            +{order.order_items.length - 3} المزيد
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}/tracking`}>
                        <Button size="sm" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                          تتبع الطلب
                        </Button>
                      </Link>
                      <Link href={`/orders/${order.id}/confirmation`}>
                        <Button variant="outline" size="sm">
                          التفاصيل
                        </Button>
                      </Link>
                      {order.status === "delivered" && (
                        <Link href={`/restaurants/${order.restaurant_id}`}>
                          <Button variant="outline" size="sm">
                            إعادة الطلب
                          </Button>
                        </Link>
                      )}
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
