"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    image_url: string
    quantity: number
    special_instructions?: string
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, updateInstructions } = useCart()

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      {/* Item Image */}
      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image_url || "/placeholder.svg?height=80&width=80&query=food"}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
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
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Special Instructions */}
        <Textarea
          placeholder="ملاحظات خاصة (اختياري)"
          value={item.special_instructions || ""}
          onChange={(e) => updateInstructions(item.id, e.target.value)}
          className="text-sm resize-none"
          rows={2}
        />
      </div>
    </div>
  )
}
