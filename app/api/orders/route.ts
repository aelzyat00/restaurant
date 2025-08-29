import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // التحقق من تسجيل الدخول
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { restaurant_id, items, delivery_address, customer_phone, notes, payment_method } = body

    // حساب المجموع
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const delivery_fee = 15.0
    const total_amount = subtotal + delivery_fee

    // إنشاء الطلب
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        restaurant_id,
        total_amount,
        delivery_fee,
        delivery_address,
        customer_phone,
        notes,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // إضافة عناصر الطلب
    const orderItems = items.map((item: any) => ({
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

    return NextResponse.json({ success: true, order_id: order.id })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // التحقق من تسجيل الدخول
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    // الحصول على طلبات المستخدم
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        restaurants (name, image_url),
        order_items (
          *,
          food_items (name, price)
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
