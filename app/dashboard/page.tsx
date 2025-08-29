import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Users, Truck, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // الحصول على بيانات الملف الشخصي
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  const getUserTypeInfo = (userType: string) => {
    switch (userType) {
      case "customer":
        return {
          title: "لوحة تحكم العميل",
          description: "إدارة طلباتك وملفك الشخصي",
          icon: <Users className="h-8 w-8 text-blue-600" />,
          color: "blue",
          dashboardPath: "/customer",
        }
      case "restaurant":
        return {
          title: "لوحة تحكم المطعم",
          description: "إدارة مطعمك وقائمة الطعام والطلبات",
          icon: <Utensils className="h-8 w-8 text-restaurant-primary" />,
          color: "orange",
          dashboardPath: "/restaurant",
        }
      case "delivery":
        return {
          title: "لوحة تحكم الموصل",
          description: "إدارة طلبات التوصيل ومتابعة المهام",
          icon: <Truck className="h-8 w-8 text-green-600" />,
          color: "green",
          dashboardPath: "/delivery",
        }
      default:
        return {
          title: "لوحة التحكم",
          description: "مرحباً بك في منصة طعامي",
          icon: <Users className="h-8 w-8 text-gray-600" />,
          color: "gray",
          dashboardPath: "/customer",
        }
    }
  }

  const userTypeInfo = getUserTypeInfo(profile?.user_type || "customer")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">مرحباً، {profile?.full_name || user.email}</span>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">{userTypeInfo.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{userTypeInfo.title}</h2>
            <p className="text-gray-600">{userTypeInfo.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {userTypeInfo.icon}
                  الانتقال إلى لوحة التحكم
                </CardTitle>
                <CardDescription>الوصول إلى جميع الميزات المتاحة لحسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={userTypeInfo.dashboardPath}>
                  <Button className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90">
                    فتح لوحة التحكم
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  الإعدادات
                </CardTitle>
                <CardDescription>إدارة ملفك الشخصي والإعدادات</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button variant="outline" className="w-full bg-transparent">
                    تعديل الملف الشخصي
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {profile?.user_type === "customer" && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-6 w-6" />
                    المطاعم
                  </CardTitle>
                  <CardDescription>تصفح المطاعم واطلب طعامك المفضل</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/restaurants">
                    <Button variant="outline" className="w-full bg-transparent">
                      تصفح المطاعم
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>تفاصيل حسابك الحالي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">الاسم</label>
                  <p className="text-gray-900">{profile?.full_name || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                  <p className="text-gray-900">{profile?.phone || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">نوع الحساب</label>
                  <p className="text-gray-900">
                    {profile?.user_type === "customer"
                      ? "عميل"
                      : profile?.user_type === "restaurant"
                        ? "مطعم"
                        : profile?.user_type === "delivery"
                          ? "موصل"
                          : "غير محدد"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
