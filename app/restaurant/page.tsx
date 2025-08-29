import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, Package, TrendingUp, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function RestaurantDashboard() {
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

  // إحصائيات اليوم
  const today = new Date().toISOString().split("T")[0]

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)

  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .in("status", ["pending", "confirmed"])

  const { data: preparingOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "preparing")

  // إحصائيات الشهر
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data: monthlyOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", startOfMonth)

  const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const monthlyRevenue = monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <div>
                <h1 className="text-2xl font-bold text-restaurant-primary">لوحة تحكم المطعم</h1>
                <p className="text-sm text-gray-600">{restaurant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "مفتوح" : "مغلق"}
              </Badge>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-restaurant-primary">
                الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات اليوم</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayOrders?.length || 0}</div>
                <p className="text-xs text-muted-foreground">{pendingOrders?.length || 0} في الانتظار</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إيرادات اليوم</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayRevenue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground">
                  متوسط الطلب: {todayOrders?.length ? (todayRevenue / todayOrders.length).toFixed(2) : 0} ر.س
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد التحضير</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{preparingOrders?.length || 0}</div>
                <p className="text-xs text-muted-foreground">يحتاج انتباه فوري</p>
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
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  إدارة الطلبات
                </CardTitle>
                <CardDescription>عرض وإدارة الطلبات الواردة وتحديث حالتها</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/restaurant/orders">
                  <div className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90 text-white px-4 py-2 rounded-md text-center transition-colors">
                    عرض الطلبات ({pendingOrders?.length || 0} جديد)
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  إدارة القائمة
                </CardTitle>
                <CardDescription>إضافة وتعديل عناصر قائمة الطعام والفئات</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/restaurant/menu">
                  <div className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-center transition-colors">
                    إدارة القائمة
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  التقارير
                </CardTitle>
                <CardDescription>عرض الإحصائيات والتقارير التفصيلية</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/restaurant/reports">
                  <div className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-center transition-colors">
                    عرض التقارير
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>الطلبات الأخيرة</CardTitle>
              <CardDescription>آخر الطلبات الواردة اليوم</CardDescription>
            </CardHeader>
            <CardContent>
              {todayOrders && todayOrders.length > 0 ? (
                <div className="space-y-4">
                  {todayOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">طلب #{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleTimeString("ar-SA")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total_amount} ر.س</p>
                        <Badge
                          variant={
                            order.status === "pending"
                              ? "secondary"
                              : order.status === "confirmed"
                                ? "default"
                                : order.status === "preparing"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {order.status === "pending"
                            ? "جديد"
                            : order.status === "confirmed"
                              ? "مؤكد"
                              : order.status === "preparing"
                                ? "قيد التحضير"
                                : order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد طلبات اليوم</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
