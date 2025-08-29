import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RestaurantHeader } from "@/components/restaurants/restaurant-header"
import { MenuSection } from "@/components/restaurants/menu-section"
import { CartButton } from "@/components/cart/cart-button"
import { Utensils } from "lucide-react"
import Link from "next/link"

export default async function RestaurantPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // الحصول على بيانات المطعم
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (restaurantError || !restaurant) {
    notFound()
  }

  // الحصول على فئات الطعام مع العناصر
  const { data: categories, error: categoriesError } = await supabase
    .from("food_categories")
    .select(`
      *,
      food_items (*)
    `)
    .eq("restaurant_id", params.id)
    .eq("is_active", true)
    .order("display_order")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/restaurants" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/restaurants" className="text-sm text-gray-600 hover:text-restaurant-primary">
                ← العودة للمطاعم
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Header */}
      <RestaurantHeader restaurant={restaurant} />

      {/* Menu */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">قائمة الطعام</h2>

          {categories && categories.length > 0 ? (
            <div className="space-y-8">
              {categories.map((category) => (
                <MenuSection key={category.id} category={category} restaurantId={restaurant.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عناصر في القائمة</h3>
              <p className="text-gray-600">هذا المطعم لم يضف عناصر إلى قائمته بعد</p>
            </div>
          )}
        </div>
      </main>

      <CartButton />
    </div>
  )
}
