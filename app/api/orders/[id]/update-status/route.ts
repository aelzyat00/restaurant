import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, message, delivery_person_id, estimated_delivery_time } = body

    // التحقق من صلاحية المستخدم (مطعم أو موصل)
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (!profile || !["restaurant", "delivery"].includes(profile.user_type)) {
      return NextResponse.json({ error: "غير مصرح لتحديث حالة الطلب" }, { status: 403 })
    }

    // تحديث حالة الطلب
    const updateData: any = { status }
    if (delivery_person_id) updateData.delivery_person_id = delivery_person_id
    if (estimated_delivery_time) updateData.estimated_delivery_time = estimated_delivery_time

    const { error: orderError } = await supabase.from("orders").update(updateData).eq("id", params.id)

    if (orderError) throw orderError

    // إضافة سجل تتبع جديد
    const { error: trackingError } = await supabase.from("order_tracking").insert({
      order_id: params.id,
      status,
      message: message || getDefaultMessage(status),
      updated_by: user.id,
    })

    if (trackingError) throw trackingError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث حالة الطلب" }, { status: 500 })
  }
}

function getDefaultMessage(status: string): string {
  switch (status) {
    case "confirmed":
      return "تم تأكيد طلبك من المطعم"
    case "preparing":
      return "المطعم يحضر طلبك الآن"
    case "ready":
      return "طلبك جاهز وفي انتظار الموصل"
    case "picked_up":
      return "تم استلام طلبك من المطعم وهو في الطريق إليك"
    case "out_for_delivery":
      return "الموصل في طريقه إليك"
    case "delivered":
      return "تم توصيل طلبك بنجاح"
    case "cancelled":
      return "تم إلغاء الطلب"
    default:
      return "تم تحديث حالة الطلب"
  }
}
