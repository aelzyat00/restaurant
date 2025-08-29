import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Package, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default async function RestaurantReports() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // التحقق من نوع المستخدم
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "restaurant") {
    redirect("/dashboard")
  }

  // الحصول على بيانات المطعم
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("owner_id", user.id).single()

  if (!restaurant) {
    redirect("/restaurant/setup")
  }

  // إحصائيات مختلفة
  const today = new Date().toISOString().split("T")[0]
  const startOfWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // طلبات اليوم
  const { data: todayOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)

  // طلبات الأسبوع
  const { data: weeklyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", startOfWeek)

  // طلبات الشهر
  const { data: monthlyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", startOfMonth)

  // أكثر العناصر طلباً
  const { data: popularItems } = await supabase
    .from("order_items")
    .select(`
      quantity,
      food_items (name)
    `)
    .eq("food_items.restaurant_id", restaurant.id)
    .gte("created_at", startOfMonth)

  // حساب الإحصائيات
  const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const weeklyRevenue = weeklyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const monthlyRevenue = monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  const avgOrderValue = monthlyOrders?.length ? monthlyRevenue / monthlyOrders.length : 0

  // تجميع العناصر الأكثر طلباً
  const itemCounts =
    popularItems?.reduce((acc: any, item: any) => {
      const name = item.food_items?.name
      if (name) {
        acc[name] = (acc[name] || 0) + item.quantity
      }
      return acc
    }, {}) || {}

  const topItems = Object.entries(itemCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">التقارير والإحصائيات</h1>
            </div>
            <Link href="/restaurant" className="text-sm text-gray-600 hover:text-restaurant-primary">
              ← العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إيرادات اليوم</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayRevenue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground">{todayOrders?.length || 0} طلب اليوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إيرادات الأسبوع</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyRevenue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground">{weeklyOrders?.length || 0} طلب هذا الأسبوع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyRevenue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground">{monthlyOrders?.length || 0} طلب هذا الشهر</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgOrderValue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground">للطلب الواحد</p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر العناصر طلباً هذا الشهر</CardTitle>
              <CardDescription>العناصر الأكثر شعبية في قائمتك</CardDescription>
            </CardHeader>
            <CardContent>
              {topItems.length > 0 ? (
                <div className="space-y-4">
                  {topItems.map(([name, count]: any, index: number) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-restaurant-primary text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{name}</span>
                      </div>
                      <Badge variant="secondary">{count} مرة</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد بيانات كافية لعرض العناصر الأكثر طلباً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الطلبات (هذا الشهر)</CardTitle>
                <CardDescription>نظرة عامة على حالات الطلبات</CardDescription>
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
                          {status === "pending"
                            ? "جديد"
                            : status === "confirmed"
                              ? "مؤكد"
                              : status === "preparing"
                                ? "قيد التحضير"
                                : status === "ready"
                                  ? "جاهز"
                                  : status === "delivered"
                                    ? "تم التوصيل"
                                    : status === "cancelled"
                                      ? "ملغي"
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
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات هذا الشهر</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات المطعم</CardTitle>
                <CardDescription>تفاصيل حسابك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">اسم المطعم</span>
                  <span className="font-medium">{restaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">الحالة</span>
                  <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                    {restaurant.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">رسوم التوصيل</span>
                  <span className="font-medium">{restaurant.delivery_fee} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">الحد الأدنى للطلب</span>
                  <span className="font-medium">{restaurant.minimum_order} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">تاريخ التسجيل</span>
                  <span className="font-medium">{new Date(restaurant.created_at).toLocaleDateString("ar-SA")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
