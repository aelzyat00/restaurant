import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Star, Users, Utensils, Truck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="outline">تسجيل الدخول</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            اطلب طعامك المفضل
            <span className="text-restaurant-primary"> بسهولة</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            منصة شاملة تربط بين العملاء والمطاعم وخدمات التوصيل لتجربة طلب طعام مميزة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up?type=customer">
              <Button size="lg" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                <Users className="mr-2 h-5 w-5" />
                للعملاء - اطلب الآن
              </Button>
            </Link>
            <Link href="/auth/sign-up?type=restaurant">
              <Button
                size="lg"
                variant="outline"
                className="border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary hover:text-white bg-transparent"
              >
                <Utensils className="mr-2 h-5 w-5" />
                للمطاعم - انضم إلينا
              </Button>
            </Link>
            <Link href="/auth/sign-up?type=delivery">
              <Button
                size="lg"
                variant="outline"
                className="border-restaurant-secondary text-restaurant-secondary hover:bg-restaurant-secondary hover:text-white bg-transparent"
              >
                <Truck className="mr-2 h-5 w-5" />
                للتوصيل - ابدأ العمل
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">لماذا تختار منصتنا؟</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-restaurant-primary mx-auto mb-4" />
                <CardTitle>توصيل سريع</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  تتبع طلبك لحظة بلحظة مع تحديثات فورية عن حالة التوصيل
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-restaurant-accent mx-auto mb-4" />
                <CardTitle>جودة مضمونة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  مطاعم مختارة بعناية مع نظام تقييم شامل لضمان أفضل تجربة
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-restaurant-secondary mx-auto mb-4" />
                <CardTitle>تغطية واسعة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  نخدم جميع أنحاء المدينة مع شبكة واسعة من المطاعم والموصلين
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">كيف يعمل النظام؟</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-restaurant-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">اختر مطعمك</h4>
              <p className="text-gray-600">تصفح المطاعم المتاحة واختر ما يناسب ذوقك</p>
            </div>
            <div className="text-center">
              <div className="bg-restaurant-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">اطلب طعامك</h4>
              <p className="text-gray-600">أضف الأطباق المفضلة إلى سلتك وأكمل الطلب</p>
            </div>
            <div className="text-center">
              <div className="bg-restaurant-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">تتبع التوصيل</h4>
              <p className="text-gray-600">راقب طلبك من التحضير حتى الوصول إلى بابك</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-restaurant-primary text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">مطعم شريك</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">عميل راضي</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-lg opacity-90">طلب مكتمل</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15</div>
              <div className="text-lg opacity-90">دقيقة متوسط التوصيل</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-restaurant-primary to-restaurant-accent text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">جاهز لتبدأ؟</h3>
          <p className="text-xl mb-8 opacity-90">انضم إلى آلاف العملاء الذين يستمتعون بتجربة طلب طعام مميزة</p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="bg-white text-restaurant-primary hover:bg-gray-100">
              ابدأ الآن مجاناً
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="h-6 w-6 text-restaurant-primary" />
                <h4 className="text-xl font-bold">طعامي</h4>
              </div>
              <p className="text-gray-400">منصة شاملة لطلب وتوصيل الطعام من أفضل المطاعم المحلية</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">للعملاء</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/restaurants" className="hover:text-white">
                    المطاعم
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    طلباتي
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white">
                    الملف الشخصي
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">للشركاء</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/restaurant-dashboard" className="hover:text-white">
                    لوحة المطعم
                  </Link>
                </li>
                <li>
                  <Link href="/delivery-dashboard" className="hover:text-white">
                    لوحة التوصيل
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    الدعم
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">تواصل معنا</h5>
              <ul className="space-y-2 text-gray-400">
                <li>البريد: info@ta3ami.com</li>
                <li>الهاتف: 123-456-7890</li>
                <li>العنوان: الرياض، السعودية</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 طعامي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
