import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Package, Calendar, Truck } from "lucide-react"
import Link from "next/link"

export default async function DeliveryStats() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // التحقق من نوع المستخدم
  const { data: profile } = await supabase.from("profiles").select("user_type, full_name").eq("id", user.id).single()

  if (!profile || profile.user_type !== "delivery") {
    redirect("/dashboard")
  }

  // إحصائيات مختلفة
  const today = new Date().toISOString().split("T")[0]
  const startOfWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // طلبات اليوم
  const { data: todayOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_person_id", user.id)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)

  // طلبات الأسبوع
  const { data: weeklyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_person_id", user.id)
    .gte("created_at", startOfWeek)

  // طلبات الشهر
  const { data: monthlyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_person_id", user.id)
    .gte("created_at", startOfMonth)

  // الطلبات المكتملة
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_person_id", user.id)
    .eq("status", "delivered")
    .gte("created_at", startOfMonth)

  // حساب الإحصائيات
  const todayDeliveries = todayOrders?.filter((order) => order.status === "delivered").length || 0
  const weeklyDeliveries = weeklyOrders?.filter((order) => order.status === "delivered").length || 0
  const monthlyDeliveries = completedOrders?.length || 0

  // تقدير الأرباح (افتراض 5 ر.س لكل توصيل)
  const deliveryFee = 5
  const todayEarnings = todayDeliveries * deliveryFee
  const weeklyEarnings = weeklyDeliveries * deliveryFee
  const monthlyEarnings = monthlyDeliveries * deliveryFee

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-restaurant-primary" />
              <div>
                <h1 className="text-2xl font-bold text-restaurant-primary">إحصائيات التوصيل</h1>
                <p className="text-sm text-gray-600">{profile.full_name}</p>
              </div>
            </div>
            <Link href="/delivery" className="text-sm text-gray-600 hover:text-restaurant-primary">
              ← العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Earnings Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">أرباح اليوم</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayEarnings} ر.س</div>
                <p className="text-xs text-muted-foreground">{todayDeliveries} توصيل اليوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">أرباح الأسبوع</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyEarnings} ر.س</div>
                <p className="text-xs text-muted-foreground">{weeklyDeliveries} توصيل هذا الأسبوع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">أرباح الشهر</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyEarnings} ر.س</div>
                <p className="text-xs text-muted-foreground">{monthlyDeliveries} توصيل هذا الشهر</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط التوصيل</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliveryFee} ر.س</div>
                <p className="text-xs text-muted-foreground">لكل توصيل</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الأداء الشهري</CardTitle>
                <CardDescription>إحصائيات التوصيل لهذا الشهر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">إجمالي الطلبات</span>
                  <span className="font-semibold">{monthlyOrders?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">مكتملة</span>
                  <span className="font-semibold text-green-600">{monthlyDeliveries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">معدل الإكمال</span>
                  <span className="font-semibold">
                    {monthlyOrders?.length ? Math.round((monthlyDeliveries / monthlyOrders.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">متوسط يومي</span>
                  <span className="font-semibold">{Math.round(monthlyDeliveries / new Date().getDate())} توصيل</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الطلبات</CardTitle>
                <CardDescription>نظرة عامة على حالات طلباتك</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyOrders && monthlyOrders.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      monthlyOrders.reduce((acc: any, order: any) => {
                        acc[order.status] = (acc[order.status] || 0) + 1
                        return acc
                      }, {}),
                    ).map(([status, count]: any) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm">
                          {status === "picked_up"
                            ? "تم الاستلام"
                            : status === "out_for_delivery"
                              ? "في الطريق"
                              : status === "delivered"
                                ? "تم التوصيل"
                                : status}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-restaurant-primary h-2 rounded-full"
                              style={{ width: `${(count / monthlyOrders.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات هذا الشهر</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
              <CardDescription>آخر التوصيلات المكتملة</CardDescription>
            </CardHeader>
            <CardContent>
              {completedOrders && completedOrders.length > 0 ? (
                <div className="space-y-4">
                  {completedOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">طلب #{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString("ar-SA")} -{" "}
                          {new Date(order.created_at).toLocaleTimeString("ar-SA")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total_amount} ر.س</p>
                        <Badge className="bg-green-100 text-green-800">تم التوصيل</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد توصيلات مكتملة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
