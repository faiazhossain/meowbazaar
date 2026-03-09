"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Plus, Edit2, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { allProducts, categories } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">পণ্য ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">মোট {allProducts.length} পণ্য</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            নতুন পণ্য যোগ করুন
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="ক্যাটাগরি ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">পণ্য</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">ক্যাটাগরি</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">মূল্য</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">স্টক</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">রেটিং</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <Badge variant="secondary">
                      {categories.find((c) => c.id === product.category)?.name || product.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">৳{product.price.toLocaleString("bn-BD")}</p>
                      {product.mrp && product.mrp > product.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          ৳{product.mrp.toLocaleString("bn-BD")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                      product.inStock ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {product.inStock ? "স্টকে আছে" : "স্টক শেষ"}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-foreground">{product.rating}</span>
                      <span className="text-muted-foreground">({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          এডিট করুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          দেখুন
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          ডিলিট করুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  )
}
