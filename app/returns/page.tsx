import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Package, Truck, AlertCircle, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">My Returns</h1>
          <p className="text-lg text-gray-600">
            We want you to be completely satisfied with your purchase. If you change your mind, you can return your
            items following our simple return policy.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/returns/track">
            <Button className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Track a Return
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <CardTitle>First Return</CardTitle>
            </div>
            <CardDescription>Your first return is on us</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              For your first return, we cover all costs. Simply request a return through your account, and we'll send
              you a prepaid shipping label. Pack your items securely and drop them off at any shipping location.
            </p>
            <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-600">
              <li>Full refund including original shipping costs</li>
              <li>Return shipping is free</li>
              <li>Process typically takes 5-7 business days</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <CardTitle>Subsequent Returns</CardTitle>
            </div>
            <CardDescription>You only pay for shipping</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              For your second and any subsequent returns, you'll only need to cover the shipping cost. We'll still
              refund the full price of your items once we receive them in good condition.
            </p>
            <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-600">
              <li>Full refund of item price</li>
              <li>Customer pays return shipping costs only</li>
              <li>Shipping typically costs $5.99-$12.99 depending on package size</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-12">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-amber-800 mb-2">Important Return Information</h2>
            <ul className="space-y-2 text-amber-700">
              <li>All returns must be initiated within 30 days of delivery</li>
              <li>Books must be in original condition with no damage, markings, or wear</li>
              <li>Special orders, digital products, and gift cards are not eligible for return</li>
              <li>
                Return shipping costs for subsequent returns are non-refundable and will be deducted from your refund
                amount
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Return an Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Request a Return</h3>
            <p>
              Log in to your account, find the order you want to return, and click "Return Items". Select the items and
              reason for return.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Package Your Items</h3>
            <p>
              Carefully pack the items in their original packaging if possible. Include the return form that will be
              emailed to you.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Ship Your Return</h3>
            <p>
              Attach the provided shipping label to your package and drop it off at any authorized shipping location.
              Track your return online.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help with a Return?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Our customer service team is ready to assist you with any questions about returns or refunds.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">Contact Support</Button>
          <Link href="/returns/track">
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Track a Return
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
