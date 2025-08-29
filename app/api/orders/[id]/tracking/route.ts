import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // الحصول على تتبع الطلب
    const { data: tracking, error } = await supabase
      .from("order_tracking")
      .select(`
        *,
        orders!inner (
          *,
          restaurants (name, phone, address)
        )
      `)
      .eq("order_id", params.id)
      .eq("orders.customer_id", user.id)
      .order("created_at", { ascending: true })

    if (error) throw error

    if (!tracking || tracking.length === 0) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ tracking })
  } catch (error) {
    console.error("Error fetching order tracking:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب تتبع الطلب" }, { status: 500 })
  }
}
