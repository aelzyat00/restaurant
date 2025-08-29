"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, AlertCircle } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import Image from "next/image"

interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  preparation_time: number
  ingredients: string[]
  allergens: string[]
}

interface Category {
  id: string
  name: string
  description: string
  food_items: FoodItem[]
}

interface MenuSectionProps {
  category: Category
  restaurantId: string
}

export function MenuSection({ category, restaurantId }: MenuSectionProps) {
  const { addItem, canAddItem, state } = useCart()
  const [showRestaurantWarning, setShowRestaurantWarning] = useState(false)

  if (!category.food_items || category.food_items.length === 0) {
    return null
  }

  const handleAddToCart = (item: FoodItem) => {
    if (!canAddItem(restaurantId)) {
      setShowRestaurantWarning(true)
      setTimeout(() => setShowRestaurantWarning(false), 5000)
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      restaurant_id: restaurantId,
      restaurant_name: state.restaurant_name || "المطعم", // سيتم تحديثه لاحقاً
    })
  }

  return (
    <div className="space-y-4">
      {showRestaurantWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لا يمكنك إضافة عناصر من مطاعم مختلفة في نفس الطلب. يرجى إفراغ السلة أولاً أو إكمال الطلب الحالي.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
        {category.description && <p className="text-gray-600 text-sm mt-1">{category.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.food_items.map((item) => (
          <Card key={item.id} className={`${!item.is_available ? "opacity-60" : ""}`}>
            <div className="flex">
              {/* Item Image */}
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-r-lg overflow-hidden">
                <Image src={item.image_url || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">غير متاح</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">{item.name}</h4>
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mt-1">{item.description}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-restaurant-primary text-sm md:text-base">{item.price} ر.س</p>
                  </div>
                </div>

                {/* Item Meta */}
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.preparation_time} دقيقة</span>
                  </div>
                  {item.allergens && item.allergens.length > 0 && item.allergens[0] !== "لا يوجد" && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>يحتوي على مسببات حساسية</span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  size="sm"
                  className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                  disabled={!item.is_available}
                  onClick={() => handleAddToCart(item)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {item.is_available ? "إضافة للسلة" : "غير متاح"}
                </Button>
              </div>
            </div>

            {/* Ingredients and Allergens */}
            {(item.ingredients?.length > 0 || (item.allergens?.length > 0 && item.allergens[0] !== "لا يوجد")) && (
              <CardContent className="pt-0 pb-3">
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">المكونات:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ingredients.slice(0, 4).map((ingredient, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {item.ingredients.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.ingredients.length - 4} أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {item.allergens && item.allergens.length > 0 && item.allergens[0] !== "لا يوجد" && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">مسببات الحساسية:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
