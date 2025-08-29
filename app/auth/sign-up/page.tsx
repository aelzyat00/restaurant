"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Utensils, Loader2, Users, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    userType: "customer",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type && ["customer", "restaurant", "delivery"].includes(type)) {
      setFormData((prev) => ({ ...prev, userType: type }))
    }
  }, [searchParams.get("type")]) // استخدام القيمة المحددة بدلاً من searchParams كاملاً

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setIsLoading(false)
      return
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            user_type: formData.userType,
          },
        },
      })
      if (error) throw error

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب")
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTypeInfo = (type: string) => {
    switch (type) {
      case "customer":
        return {
          title: "حساب عميل",
          description: "للطلب من المطاعم",
          icon: <Users className="h-5 w-5" />,
        }
      case "restaurant":
        return {
          title: "حساب مطعم",
          description: "لإدارة مطعمك وقبول الطلبات",
          icon: <Utensils className="h-5 w-5" />,
        }
      case "delivery":
        return {
          title: "حساب موصل",
          description: "لتوصيل الطلبات للعملاء",
          icon: <Truck className="h-5 w-5" />,
        }
      default:
        return {
          title: "حساب عميل",
          description: "للطلب من المطاعم",
          icon: <Users className="h-5 w-5" />,
        }
    }
  }

  const currentUserType = getUserTypeInfo(formData.userType)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="h-8 w-8 text-restaurant-primary" />
            <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
          </div>
          <p className="text-gray-600">انضم إلى منصتنا اليوم</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>املأ البيانات التالية لإنشاء حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* نوع المستخدم */}
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        عميل
                      </div>
                    </SelectItem>
                    <SelectItem value="restaurant">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        مطعم
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        موصل
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {currentUserType.icon}
                  <span>
                    <strong>{currentUserType.title}:</strong> {currentUserType.description}
                  </span>
                </div>
              </div>

              {/* الاسم الكامل */}
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل {formData.userType === "restaurant" && "(اسم المطعم)"}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={formData.userType === "restaurant" ? "اسم المطعم" : "الاسم الكامل"}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              {/* كلمة المرور */}
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء الحساب"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/auth/login" className="text-restaurant-primary hover:underline font-medium">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-restaurant-primary">
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
