import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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

    // التحقق من أن المستخدم موصل
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (!profile || profile.user_type !== "delivery") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "ready"

    // الحصول على الطلبات المتاحة للتوصيل
    let query = supabase
      .from("orders")
      .select(`
        *,
        restaurants (name, address, phone, image_url),
        profiles!orders_customer_id_fkey (full_name, phone)
      `)
      .order("created_at", { ascending: true })

    if (status === "ready") {
      // الطلبات الجاهزة للاستلام
      query = query.eq("status", "ready").is("delivery_person_id", null)
    } else if (status === "assigned") {
      // الطلبات المخصصة للموصل
      query = query.eq("delivery_person_id", user.id).in("status", ["picked_up", "out_for_delivery"])
    }

    const { data: orders, error } = await query

    if (error) throw error

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching delivery orders:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
