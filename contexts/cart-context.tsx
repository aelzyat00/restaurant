"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  restaurant_id: string
  restaurant_name: string
  quantity: number
  special_instructions?: string
}

interface CartState {
  items: CartItem[]
  restaurant_id: string | null
  restaurant_name: string | null
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_INSTRUCTIONS"; payload: { id: string; instructions: string } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

const initialState: CartState = {
  items: [],
  restaurant_id: null,
  restaurant_name: null,
  total: 0,
  itemCount: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { quantity = 1, ...item } = action.payload

      // التحقق من أن العنصر من نفس المطعم
      if (state.restaurant_id && state.restaurant_id !== item.restaurant_id) {
        // يمكن إضافة تحذير هنا
        return state
      }

      const existingItemIndex = state.items.findIndex((cartItem) => cartItem.id === item.id)

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // تحديث الكمية للعنصر الموجود
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem,
        )
      } else {
        // إضافة عنصر جديد
        newItems = [...state.items, { ...item, quantity }]
      }

      const total = newItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0)
      const itemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

      return {
        ...state,
        items: newItems,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurant_name,
        total,
        itemCount,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        restaurant_id: newItems.length > 0 ? state.restaurant_id : null,
        restaurant_name: newItems.length > 0 ? state.restaurant_name : null,
        total,
        itemCount,
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0)

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        restaurant_id: newItems.length > 0 ? state.restaurant_id : null,
        restaurant_name: newItems.length > 0 ? state.restaurant_name : null,
        total,
        itemCount,
      }
    }

    case "UPDATE_INSTRUCTIONS": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, special_instructions: action.payload.instructions } : item,
      )

      return {
        ...state,
        items: newItems,
      }
    }

    case "CLEAR_CART":
      return initialState

    case "LOAD_CART":
      return action.payload

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateInstructions: (id: string, instructions: string) => void
  clearCart: () => void
  canAddItem: (restaurantId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // تحميل السلة من localStorage عند بدء التطبيق
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // حفظ السلة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state))
  }, [state])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const updateInstructions = (id: string, instructions: string) => {
    dispatch({ type: "UPDATE_INSTRUCTIONS", payload: { id, instructions } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const canAddItem = (restaurantId: string) => {
    return !state.restaurant_id || state.restaurant_id === restaurantId
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        canAddItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
