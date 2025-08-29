import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Package, Truck, MapPin, Phone, Utensils } from "lucide-react"
import Link from "next/link"
import { DeliveryTracker } from "@/components/delivery/delivery-tracker"

export default async function OrderTrackingPage({
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

  // الحصول على تتبع الطلب
  const { data: tracking, error } = await supabase
    .from("order_tracking")
    .select(`
      *,
      orders!inner (
        *,
        restaurants (name, phone, address, image_url),
        profiles!orders_delivery_person_id_fkey (full_name, phone)
      )
    `)
    .eq("order_id", params.id)
    .eq("orders.customer_id", user.id)
    .order("created_at", { ascending: true })

  if (error || !tracking || tracking.length === 0) {
    notFound()
  }

  const order = tracking[0].orders
  const currentStatus = tracking[tracking.length - 1].status
  const deliveryPersonInfo = order.profiles
    ? {
        name: order.profiles.full_name,
        phone: order.profiles.phone,
      }
    : undefined

  const getStatusIcon = (status: string, isActive: boolean) => {
    const className = `h-6 w-6 ${isActive ? "text-restaurant-primary" : "text-gray-400"}`

    switch (status) {
      case "pending":
        return <Clock className={className} />
      case "confirmed":
        return <CheckCircle className={className} />
      case "preparing":
        return <Package className={className} />
      case "ready":
        return <CheckCircle className={className} />
      case "picked_up":
        return <Truck className={className} />
      case "delivered":
        return <CheckCircle className={className} />
      default:
        return <Clock className={className} />
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

  const statusSteps = [
    { key: "pending", label: "تم استلام الطلب" },
    { key: "confirmed", label: "تم تأكيد الطلب" },
    { key: "preparing", label: "قيد التحضير" },
    { key: "ready", label: "جاهز للاستلام" },
    { key: "picked_up", label: "تم الاستلام" },
    { key: "delivered", label: "تم التوصيل" },
  ]

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === currentStatus)
  }

  const currentStepIndex = getCurrentStepIndex()

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
            <Link
              href={`/orders/${params.id}/confirmation`}
              className="text-sm text-gray-600 hover:text-restaurant-primary"
            >
              تفاصيل الطلب
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تتبع الطلب #{order.order_number}</h2>
            <p className="text-gray-600">من {order.restaurants?.name}</p>
          </div>

          {/* Current Status */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-restaurant-primary/10 rounded-full mb-4">
                  {getStatusIcon(currentStatus, true)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{getStatusText(currentStatus)}</h3>
                <p className="text-gray-600">{tracking[tracking.length - 1].message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  آخر تحديث: {new Date(tracking[tracking.length - 1].created_at).toLocaleString("ar-SA")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>مراحل الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-restaurant-primary text-white" : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isCurrent ? "text-restaurant-primary" : isCompleted ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {isCurrent && (
                        <Badge className="bg-restaurant-primary/10 text-restaurant-primary">الحالة الحالية</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Utensils className="h-8 w-8 text-restaurant-primary" />
                <div>
                  <h3 className="font-semibold">{order.restaurants?.name}</h3>
                  <p className="text-sm text-gray-600">{order.restaurants?.address}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>عنوان التوصيل: {order.delivery_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>رقم الهاتف: {order.customer_phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Tracker */}
          <div className="mb-6">
            <DeliveryTracker
              orderId={params.id}
              currentStatus={currentStatus}
              estimatedDeliveryTime={order.estimated_delivery_time}
              deliveryPersonInfo={deliveryPersonInfo}
            />
          </div>

          {/* Tracking History */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>سجل التتبع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.reverse().map((item: any, index: number) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-shrink-0">{getStatusIcon(item.status, true)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{getStatusText(item.status)}</p>
                      <p className="text-sm text-gray-600">{item.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.created_at).toLocaleString("ar-SA")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/customer" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                العودة للرئيسية
              </Button>
            </Link>
            <Link href="/restaurants" className="flex-1">
              <Button className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90">طلب جديد</Button>
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
