import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, full_name, phone")
      .eq("id", user.id)
      .single()

    if (!profile || profile.user_type !== "delivery") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    // تخصيص الطلب للموصل
    const { error: assignError } = await supabase
      .from("orders")
      .update({
        delivery_person_id: user.id,
        status: "picked_up",
        estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .eq("id", params.id)
      .eq("status", "ready")
      .is("delivery_person_id", null)

    if (assignError) throw assignError

    // إضافة سجل تتبع
    const { error: trackingError } = await supabase.from("order_tracking").insert({
      order_id: params.id,
      status: "picked_up",
      message: `تم استلام الطلب من قبل الموصل ${profile.full_name}`,
      updated_by: user.id,
    })

    if (trackingError) throw trackingError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error assigning order:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تخصيص الطلب" }, { status: 500 })
  }
}