import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, MapPin, Phone, Utensils } from "lucide-react"
import Link from "next/link"

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // التحقق من تسجيل الدخول
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // الحصول على بيانات الطلب
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      restaurants (name, phone, address),
      order_items (
        *,
        food_items (name, price)
      )
    `)
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .single()

  if (orderError || !order) {
    notFound()
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
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">تم إنشاء طلبك بنجاح!</h2>
            <p className="text-gray-600">شكراً لك، سيتم التواصل معك قريباً</p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>طلب #{order.order_number}</CardTitle>
                  <CardDescription>
                    تم الإنشاء في {new Date(order.created_at).toLocaleDateString("ar-SA")} الساعة{" "}
                    {new Date(order.created_at).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Restaurant Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Utensils className="h-8 w-8 text-restaurant-primary" />
                <div>
                  <h3 className="font-semibold">{order.restaurants?.name}</h3>
                  <p className="text-sm text-gray-600">{order.restaurants?.address}</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>عنوان التوصيل: {order.delivery_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>رقم الهاتف: {order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>الوقت المتوقع للتوصيل: 30-45 دقيقة</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>ملاحظات:</strong> {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.food_items.name}</span>
                      <span className="text-gray-600 text-sm"> × {item.quantity}</span>
                      {item.special_instructions && (
                        <p className="text-xs text-gray-500 mt-1">ملاحظة: {item.special_instructions}</p>
                      )}
                    </div>
                    <span className="font-semibold">{item.total_price} ر.س</span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{(order.total_amount - order.delivery_fee).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>رسوم التوصيل</span>
                    <span>{order.delivery_fee} ر.س</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>المجموع الكلي</span>
                    <span>{order.total_amount} ر.س</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/orders/${order.id}/tracking`} className="flex-1">
              <Button className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90">تتبع الطلب</Button>
            </Link>
            <Link href="/restaurants" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                طلب جديد
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>هل تحتاج مساعدة؟</p>
            <p>
              اتصل بالمطعم: <span className="font-medium">{order.restaurants?.phone}</span>
            </p>
            <p>أو تواصل معنا: 123-456-7890</p>
          </div>
        </div>
      </main>
    </div>
  )
}
