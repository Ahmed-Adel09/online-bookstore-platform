import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-8">About BookHaven</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <p className="text-lg mb-4">
            BookHaven was founded in 2010 with a simple mission: to connect readers with the books they love. What
            started as a small corner bookshop has grown into one of the most beloved online bookstores, serving
            customers worldwide.
          </p>
          <p className="text-lg mb-4">
            Our team of passionate book lovers is dedicated to curating the best selection of books across all genres,
            from bestselling fiction to rare academic texts. We believe that books have the power to inspire, educate,
            and transform lives.
          </p>
          <p className="text-lg">
            At BookHaven, we're not just selling books—we're building a community of readers. Join us in our journey to
            make quality literature accessible to everyone.
          </p>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <img
            src="/images/bookstore.png"
            alt="BookHaven Store"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Passion for Literature</h3>
            <p>
              We believe in the transformative power of books and are committed to sharing our love of reading with our
              customers.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Customer Experience</h3>
            <p>
              We strive to provide an exceptional shopping experience, from easy browsing to fast shipping and
              responsive customer service.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Community Engagement</h3>
            <p>
              We actively support literacy programs, local authors, and book clubs to foster a vibrant reading
              community.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden mb-4">
              <img src="/images/abdullah-ahmed.jpeg" alt="Abdullah Ahmed" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold">Abdullah Ahmed</h3>
            <p className="text-gray-500">Founder & CEO</p>
            <p className="text-center mt-2 max-w-md">
              Abdullah founded BookHaven with a vision to create the ultimate destination for book lovers.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden mb-4">
              <img src="/images/ahmed-adel.jpeg" alt="Ahmed Adel" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold">Ahmed Adel</h3>
            <p className="text-gray-500">Operations Manager</p>
            <p className="text-center mt-2 max-w-md">
              Ahmed ensures that BookHaven runs smoothly, from inventory management to order fulfillment.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden mb-4">
              <img src="/images/mohammed-fathy.jpeg" alt="Mohammed Fathy" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold">Mohammed Fathy</h3>
            <p className="text-gray-500">Marketing Director</p>
            <p className="text-center mt-2 max-w-md">
              Mohammed leads our marketing efforts with creativity and strategic vision.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden mb-4">
              <img src="/images/ahmed-elnoby.jpeg" alt="Ahmed El Noby" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold">Ahmed El Noby</h3>
            <p className="text-gray-500">Technology Officer</p>
            <p className="text-center mt-2 max-w-md">
              Ahmed oversees our technical infrastructure and digital innovation initiatives.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden mb-4">
              <img src="/images/mohammed-ahmed.jpeg" alt="Mohammed Ahmed" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold">Mohammed Ahmed</h3>
            <p className="text-gray-500">Customer Relations</p>
            <p className="text-center mt-2 max-w-md">
              Mohammed leads our customer service team and ensures an exceptional experience for all clients.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Journey</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          We're always looking for passionate individuals to join our team. If you love books as much as we do, we'd
          love to hear from you.
        </p>
        <Button size="lg">View Careers</Button>
      </div>
    </div>
  )
}
