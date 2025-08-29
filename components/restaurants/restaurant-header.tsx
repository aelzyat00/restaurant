import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Star, Truck } from "lucide-react"
import Image from "next/image"

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  phone: string
  image_url: string
  delivery_fee: number
  minimum_order: number
  opening_hours: any
}

interface RestaurantHeaderProps {
  restaurant: Restaurant
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const isOpen = () => {
    // منطق بسيط للتحقق من ساعات العمل
    const now = new Date()
    const currentDay = now.toLocaleDateString("en-US", { weekday: "lowercase" })
    const currentTime = now.toTimeString().slice(0, 5)

    if (restaurant.opening_hours && restaurant.opening_hours[currentDay]) {
      const { open, close } = restaurant.opening_hours[currentDay]
      return currentTime >= open && currentTime <= close
    }

    return true
  }

  const formatOpeningHours = () => {
    if (!restaurant.opening_hours) return "غير محدد"

    const days = {
      saturday: "السبت",
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "lowercase" })
    const todayHours = restaurant.opening_hours[today]

    if (todayHours) {
      return `اليوم: ${todayHours.open} - ${todayHours.close}`
    }

    return "غير محدد"
  }

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Restaurant Image */}
          <div className="relative h-64 lg:h-48 lg:w-80 rounded-lg overflow-hidden">
            <Image
              src={restaurant.image_url || "/placeholder.svg"}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Restaurant Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 text-lg">{restaurant.description}</p>
              </div>
              <Badge variant={isOpen() ? "default" : "secondary"} className="text-sm">
                {isOpen() ? "مفتوح الآن" : "مغلق"}
              </Badge>
            </div>

            {/* Restaurant Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.address}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{restaurant.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <span>رسوم التوصيل: {restaurant.delivery_fee} ر.س</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>الحد الأدنى: {restaurant.minimum_order} ر.س</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Star className="h-4 w-4" />
                <span>4.5 (120+ تقييم)</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatOpeningHours()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
