"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Utensils, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  preparation_time: number
}

interface Category {
  id: string
  name: string
  description: string
  display_order: number
  is_active: boolean
  food_items: FoodItem[]
}

export default function RestaurantMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchMenu()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      router.push("/auth/login")
      return
    }

    // التحقق من نوع المستخدم
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (!profile || profile.user_type !== "restaurant") {
      router.push("/dashboard")
      return
    }
  }

  const fetchMenu = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // الحصول على المطعم
      const { data: restaurant } = await supabase.from("restaurants").select("id").eq("owner_id", user.id).single()

      if (!restaurant) return

      // جلب الفئات والعناصر
      const { data: categoriesData, error } = await supabase
        .from("food_categories")
        .select(`
          *,
          food_items (*)
        `)
        .eq("restaurant_id", restaurant.id)
        .order("display_order")

      if (error) throw error

      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Error fetching menu:", error)
      setError("حدث خطأ أثناء جلب القائمة")
    } finally {
      setLoading(false)
    }
  }

  const toggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("food_items").update({ is_available: !currentStatus }).eq("id", itemId)

      if (error) throw error

      await fetchMenu()
    } catch (error) {
      console.error("Error updating item availability:", error)
      setError("حدث خطأ أثناء تحديث حالة العنصر")
    }
  }

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("food_categories")
        .update({ is_active: !currentStatus })
        .eq("id", categoryId)

      if (error) throw error

      await fetchMenu()
    } catch (error) {
      console.error("Error updating category status:", error)
      setError("حدث خطأ أثناء تحديث حالة الفئة")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-restaurant-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">إدارة القائمة</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                إضافة فئة جديدة
              </Button>
              <Link href="/restaurant" className="text-sm text-gray-600 hover:text-restaurant-primary">
                ← العودة للوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <Utensils className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">لا توجد فئات في القائمة</h3>
              <p className="text-gray-600 mb-8">ابدأ بإضافة فئات وعناصر لقائمة طعامك</p>
              <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                إضافة فئة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {category.name}
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </CardTitle>
                        {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                        >
                          {category.is_active ? "إلغاء التفعيل" : "تفعيل"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          تعديل
                        </Button>
                        <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة عنصر
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.food_items && category.food_items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.food_items.map((item) => (
                          <Card key={item.id} className={`${!item.is_available ? "opacity-60" : ""}`}>
                            <div className="relative h-32 w-full">
                              <Image
                                src={item.image_url || "/placeholder.svg?height=128&width=200&query=food"}
                                alt={item.name}
                                fill
                                className="object-cover rounded-t-lg"
                              />
                              {!item.is_available && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                                  <span className="text-white text-sm font-medium">غير متاح</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <span className="font-bold text-restaurant-primary text-sm">{item.price} ر.س</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{item.preparation_time} دقيقة</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleItemAvailability(item.id, item.is_available)}
                                    className="text-xs px-2 py-1 h-auto"
                                  >
                                    {item.is_available ? "إخفاء" : "إظهار"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 h-auto bg-transparent"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 h-auto text-red-600 bg-transparent"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">لا توجد عناصر في هذه الفئة</p>
                        <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة عنصر جديد
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
