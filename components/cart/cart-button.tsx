"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export function CartButton() {
  const { state } = useCart()

  if (state.itemCount === 0) {
    return null
  }

  return (
    <Link href="/cart">
      <Button className="fixed bottom-4 left-4 z-50 bg-restaurant-primary hover:bg-restaurant-primary/90 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {state.itemCount}
            </Badge>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium">السلة</span>
            <div className="text-xs opacity-90">{state.total.toFixed(2)} ر.س</div>
          </div>
        </div>
      </Button>
    </Link>
  )
}
