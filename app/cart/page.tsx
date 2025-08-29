"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Utensils, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { state, updateQuantity, removeItem, updateInstructions, clearCart } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/restaurants" className="flex items-center gap-2">
                <Utensils className="h-8 w-8 text-restaurant-primary" />
                <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
              </Link>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">السلة فارغة</h2>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي عناصر إلى سلتك بعد</p>
            <Link href="/restaurants">
              <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">تصفح المطاعم</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/restaurants" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
            <Button variant="outline" onClick={clearCart} size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              إفراغ السلة
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">سلة التسوق</h2>
            <p className="text-gray-600">من {state.restaurant_name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-restaurant-primary font-semibold mb-3">{item.price} ر.س</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Special Instructions */}
                        <Textarea
                          placeholder="ملاحظات خاصة (اختياري)"
                          value={item.special_instructions || ""}
                          onChange={(e) => updateInstructions(item.id, e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي</span>
                      <span>{state.total.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>رسوم التوصيل</span>
                      <span>15.00 ر.س</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>المجموع الكلي</span>
                      <span>{(state.total + 15).toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      {state.itemCount} عنصر في السلة
                    </Badge>
                    <p className="text-xs text-gray-600 text-center">وقت التحضير المتوقع: 25-35 دقيقة</p>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90">
                      إتمام الطلب
                      <ArrowRight className="h-4 w-4 mr-2" />
                    </Button>
                  </Link>

                  <Link href={`/restaurants/${state.restaurant_id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      إضافة المزيد من العناصر
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
