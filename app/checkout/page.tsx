"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Utensils, MapPin, CreditCard, Wallet, Loader2, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [orderData, setOrderData] = useState({
    delivery_address: "",
    customer_phone: "",
    notes: "",
    payment_method: "cash",
  })

  const supabase = createClient()

  if (state.items.length === 0) {
    router.push("/cart")
    return null
  }

  const deliveryFee = 15.0
  const totalAmount = state.total + deliveryFee

  const handleInputChange = (field: string, value: string) => {
    setOrderData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // التحقق من تسجيل الدخول
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          restaurant_id: state.restaurant_id,
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          delivery_address: orderData.delivery_address,
          customer_phone: orderData.customer_phone,
          notes: orderData.notes,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // إضافة عناصر الطلب
      const orderItems = state.items.map((item) => ({
        order_id: order.id,
        food_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_instructions: item.special_instructions || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // إضافة تتبع أولي للطلب
      const { error: trackingError } = await supabase.from("order_tracking").insert({
        order_id: order.id,
        status: "pending",
        message: "تم استلام طلبك وهو قيد المراجعة",
      })

      if (trackingError) throw trackingError

      // مسح السلة
      clearCart()

      // التوجيه إلى صفحة تأكيد الطلب
      router.push(`/orders/${order.id}/confirmation`)
    } catch (error: unknown) {
      console.error("Error creating order:", error)
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-restaurant-primary" />
              <h1 className="text-2xl font-bold text-restaurant-primary">طعامي</h1>
            </Link>
            <Link href="/cart" className="text-sm text-gray-600 hover:text-restaurant-primary">
              ← العودة للسلة
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إتمام الطلب</h2>
            <p className="text-gray-600">من {state.restaurant_name}</p>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      معلومات التوصيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">عنوان التوصيل *</Label>
                      <Textarea
                        id="address"
                        placeholder="أدخل عنوان التوصيل الكامل..."
                        value={orderData.delivery_address}
                        onChange={(e) => handleInputChange("delivery_address", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={orderData.customer_phone}
                        onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">ملاحظات إضافية</Label>
                      <Textarea
                        id="notes"
                        placeholder="أي ملاحظات خاصة للمطعم أو الموصل..."
                        value={orderData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      طريقة الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={orderData.payment_method}
                      onValueChange={(value) => handleInputChange("payment_method", value)}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                          <Wallet className="h-4 w-4" />
                          الدفع عند الاستلام (نقداً)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-not-allowed">
                          <CreditCard className="h-4 w-4" />
                          الدفع الإلكتروني (قريباً)
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {state.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>{(item.price * item.quantity).toFixed(2)} ر.س</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المجموع الفرعي</span>
                        <span>{state.total.toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>رسوم التوصيل</span>
                        <span>{deliveryFee.toFixed(2)} ر.س</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>المجموع الكلي</span>
                        <span>{totalAmount.toFixed(2)} ر.س</span>
                      </div>
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
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          جاري إنشاء الطلب...
                        </>
                      ) : (
                        <>
                          تأكيد الطلب
                          <ArrowRight className="h-4 w-4 mr-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-600 text-center">
                      بالنقر على "تأكيد الطلب" فإنك توافق على شروط وأحكام الخدمة
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
