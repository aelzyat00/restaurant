"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface SearchBarProps {
  initialValue?: string
}

export function SearchBar({ initialValue = "" }: SearchBarProps) {
  const [search, setSearch] = useState(initialValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setSearch(initialValue)
  }, [initialValue])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }

    router.push(`/restaurants?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    router.push(`/restaurants?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="ابحث عن المطاعم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 text-right"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="bg-restaurant-primary hover:bg-restaurant-primary/90">
        بحث
      </Button>
    </form>
  )
}
