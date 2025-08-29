"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface RestaurantFiltersProps {
  currentSort?: string
}

export function RestaurantFilters({ currentSort }: RestaurantFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "default") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }

    router.push(`/restaurants?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("sort")
    params.delete("category")
    router.push(`/restaurants?${params.toString()}`)
  }

  const hasFilters = currentSort

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">ترتيب حسب:</span>
          <Select value={currentSort || "default"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الأحدث</SelectItem>
              <SelectItem value="name">الاسم</SelectItem>
              <SelectItem value="delivery_fee">رسوم التوصيل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          مسح الفلاتر
        </Button>
      )}
    </div>
  )
}
