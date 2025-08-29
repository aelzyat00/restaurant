import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, ShoppingBag, Clock, Star, MapPin } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/auth/user-menu"

export default async function CustomerDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // التحقق من نوع المستخدم
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "customer") {
    redirect("/dashboard")
  }

  // الحصول على آخر الطلبات
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      restaurants (name, image_url)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // الحصول على المطاعم المفضلة (مؤقتاً نأخذ أحدث المطاعم)
  const { data: favoriteRestaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">مرحباً، {profile?.full_name || "عزيزي العميل"}</h2>
            <p className="text-gray-600">ماذا تريد أن تطلب اليوم؟</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link href="/restaurants">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-restaurant-primary/10 p-2 rounded-lg">
                    <Utensils className="h-6 w-6 text-restaurant-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">تصفح المطاعم</h3>
                    <p className="text-sm text-gray-600">اكتشف مطاعم جديدة</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">طلباتي</h3>
                    <p className="text-sm text-gray-600">تتبع طلباتك</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer/favorites">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Star className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">المفضلة</h3>
                    <p className="text-sm text-gray-600">مطاعمك المفضلة</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer/addresses">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">العناوين</h3>
                    <p className="text-sm text-gray-600">إدارة عناوينك</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  آخر الطلبات
                </CardTitle>
                <CardDescription>طلباتك الأخيرة</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Utensils className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{order.restaurants?.name}</p>
                            <p className="text-sm text-gray-600">طلب #{order.order_number}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{order.total_amount} ر.س</p>
                          <p className="text-sm text-gray-600">{order.status}</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/customer/orders">
                      <Button variant="outline" className="w-full bg-transparent">
                        عرض جميع الطلبات
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">لم تقم بأي طلبات بعد</p>
                    <Link href="/restaurants">
                      <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">اطلب الآن</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  مطاعم مقترحة
                </CardTitle>
                <CardDescription>اكتشف مطاعم جديدة</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteRestaurants && favoriteRestaurants.length > 0 ? (
                  <div className="space-y-4">
                    {favoriteRestaurants.slice(0, 3).map((restaurant) => (
                      <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Utensils className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{restaurant.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{restaurant.description}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-600">رسوم التوصيل</p>
                            <p className="font-semibold">{restaurant.delivery_fee} ر.س</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link href="/restaurants">
                      <Button variant="outline" className="w-full bg-transparent">
                        عرض جميع المطاعم
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد مطاعم متاحة حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
