import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F5F0]">
      <div className="max-w-2xl w-full text-center">
        
        <div className="mb-8">
          <h1 
            className="text-9xl font-bold text-[#e6c35a] mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            404
          </h1>
          <h2 
            className="text-4xl font-bold text-[#101010] mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Page Not Found
          </h2>
          <p 
            className="text-lg text-[#707072] mb-8" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Go Home
          </Link>
          <Link 
            to="/contact"
            className="px-8 py-3 bg-white text-[#101010] border-2 border-[#707072] rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md text-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-12">
          <p 
            className="text-sm text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Need help? Call us at{' '}
            <a 
              href="tel:+18189128910" 
              className="text-[#1c449e] hover:text-[#e6c35a] font-semibold transition-colors"
            >
              (818) 912-8910
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

export default NotFoundPage