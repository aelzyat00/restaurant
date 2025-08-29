"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Package, Truck, Phone, User } from "lucide-react"

interface DeliveryTrackerProps {
  orderId: string
  currentStatus: string
  estimatedDeliveryTime?: string
  deliveryPersonInfo?: {
    name: string
    phone: string
  }
}

export function DeliveryTracker({
  orderId,
  currentStatus,
  estimatedDeliveryTime,
  deliveryPersonInfo,
}: DeliveryTrackerProps) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  const deliverySteps = [
    { key: "confirmed", label: "تم تأكيد الطلب", icon: CheckCircle },
    { key: "preparing", label: "قيد التحضير", icon: Package },
    { key: "ready", label: "جاهز للاستلام", icon: CheckCircle },
    { key: "picked_up", label: "تم الاستلام", icon: Truck },
    { key: "out_for_delivery", label: "في الطريق إليك", icon: Truck },
    { key: "delivered", label: "تم التوصيل", icon: CheckCircle },
  ]

  useEffect(() => {
    const currentStepIndex = deliverySteps.findIndex((step) => step.key === currentStatus)
    const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / deliverySteps.length) * 100 : 0
    setProgress(progressPercentage)
  }, [currentStatus])

  useEffect(() => {
    if (!estimatedDeliveryTime) return

    const updateTimeRemaining = () => {
      const now = new Date().getTime()
      const estimated = new Date(estimatedDeliveryTime).getTime()
      const difference = estimated - now

      if (difference > 0) {
        const minutes = Math.floor(difference / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      } else {
        setTimeRemaining("وصل الآن")
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [estimatedDeliveryTime])

  const getCurrentStepIndex = () => {
    return deliverySteps.findIndex((step) => step.key === currentStatus)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          تتبع التوصيل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>تقدم التوصيل</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Estimated Time */}
        {estimatedDeliveryTime && timeRemaining && (
          <div className="flex items-center justify-between p-3 bg-restaurant-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-restaurant-primary" />
              <span className="text-sm font-medium">الوقت المتوقع للوصول</span>
            </div>
            <Badge variant="secondary" className="bg-restaurant-primary/20 text-restaurant-primary">
              {timeRemaining}
            </Badge>
          </div>
        )}

        {/* Delivery Person Info */}
        {deliveryPersonInfo && currentStatus !== "delivered" && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-restaurant-primary/10 rounded-full">
                <User className="h-5 w-5 text-restaurant-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">الموصل</p>
                <p className="text-sm text-gray-600">{deliveryPersonInfo.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${deliveryPersonInfo.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                اتصال
              </a>
            </Button>
          </div>
        )}

        {/* Delivery Steps */}
        <div className="space-y-4">
          {deliverySteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? "bg-restaurant-primary text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      isCurrent ? "text-restaurant-primary" : isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {isCurrent && (
                  <Badge className="bg-restaurant-primary/10 text-restaurant-primary text-xs">جاري التنفيذ</Badge>
                )}
                {isCompleted && !isCurrent && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
              </div>
            )
          })}
        </div>

        {/* Live Updates */}
        <div className="text-center">
          <p className="text-xs text-gray-500">يتم تحديث المعلومات تلقائياً</p>
        </div>
      </CardContent>
    </Card>
  )
}
