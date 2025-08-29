import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Utensils } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="h-8 w-8 text-restaurant-primary" />
            <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
          </div>
        </div>

        <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">تم إنشاء الحساب بنجاح!</CardTitle>
            <CardDescription className="text-base">مرحباً بك في منصة طعامي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">تحقق من بريدك الإلكتروني</h3>
              </div>
              <p className="text-sm text-blue-700">
                لقد أرسلنا لك رسالة تأكيد على بريدك الإلكتروني. يرجى النقر على الرابط الموجود في الرسالة لتفعيل حسابك.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">بعد تفعيل حسابك، ستتمكن من:</p>
              <ul className="text-sm text-gray-600 space-y-1 text-right">
                <li>• الوصول إلى لوحة التحكم الخاصة بك</li>
                <li>• إدارة ملفك الشخصي</li>
                <li>• البدء في استخدام جميع ميزات المنصة</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link href="/auth/login">
                <Button className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90">تسجيل الدخول</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  العودة إلى الصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            لم تستلم رسالة التأكيد؟{" "}
            <Link href="/auth/resend-confirmation" className="text-restaurant-primary hover:underline">
              إعادة الإرسال
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
