import { createClient } from "@/lib/supabase/server"
import { RestaurantGrid } from "@/components/restaurants/restaurant-grid"
import { RestaurantFilters } from "@/components/restaurants/restaurant-filters"
import { SearchBar } from "@/components/restaurants/search-bar"
import { Utensils } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  search?: string
  category?: string
  sort?: string
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  // بناء الاستعلام الأساسي
  let query = supabase.from("restaurants").select("*").eq("is_active", true)

  // إضافة البحث إذا كان موجوداً
  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`)
  }

  // إضافة الترتيب
  switch (searchParams.sort) {
    case "name":
      query = query.order("name")
      break
    case "delivery_fee":
      query = query.order("delivery_fee")
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: restaurants, error } = await query

  if (error) {
    console.error("Error fetching restaurants:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-restaurant-primary">
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">المطاعم المتاحة</h2>
          <p className="text-gray-600">اكتشف أفضل المطاعم واطلب طعامك المفضل</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar initialValue={searchParams.search} />
          <RestaurantFilters currentSort={searchParams.sort} />
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {restaurants?.length || 0} مطعم متاح
            {searchParams.search && ` للبحث عن "${searchParams.search}"`}
          </p>
        </div>

        {/* Restaurant Grid */}
        <RestaurantGrid restaurants={restaurants || []} />
      </main>
    </div>
  )
}
