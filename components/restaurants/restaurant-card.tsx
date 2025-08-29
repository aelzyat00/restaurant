import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const isOpen = () => {
    // منطق بسيط للتحقق من ساعات العمل
    const now = new Date()
    const currentDay = now.toLocaleDateString("en-US", { weekday: "lowercase" })
    const currentTime = now.toTimeString().slice(0, 5)

    if (restaurant.opening_hours && restaurant.opening_hours[currentDay]) {
      const { open, close } = restaurant.opening_hours[currentDay]
      return currentTime >= open && currentTime <= close
    }

    return true // افتراض أن المطعم مفتوح إذا لم تكن ساعات العمل محددة
  }

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.image_url || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={isOpen() ? "default" : "secondary"} className="bg-white text-gray-900">
              {isOpen() ? "مفتوح" : "مغلق"}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-xl">{restaurant.name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">{restaurant.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{restaurant.phone}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Truck className="h-4 w-4" />
              <span>رسوم التوصيل: {restaurant.delivery_fee} ر.س</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>الحد الأدنى للطلب: {restaurant.minimum_order} ر.س</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
