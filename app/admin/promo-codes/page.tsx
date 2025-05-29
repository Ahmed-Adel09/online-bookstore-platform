"use client"

import { PromoCodeManager } from "@/components/promo-code-manager"

export default function PromoCodesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Promotional Codes</h1>
        <p className="text-gray-600">Manage and test promotional codes for the bookstore</p>
      </div>

      <PromoCodeManager />
    </div>
  )
}
