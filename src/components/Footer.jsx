import logo from '../assets/Kept House _transparent logo .png'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-[#101010] text-[#F8F5F0] border-t border-[#e6c35a]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile Layout - Stacked and Compact */}
        <div className="sm:hidden">
          {/* Logo and Tagline */}
          <div className="text-center mb-6">
            <img
              src={logo}
              alt="Kept House Estate Sales"
              className="h-14 w-auto mx-auto mb-2"
            />
            <p
              className="text-xs text-[#e6c35a] italic"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Thoughtful Estate Sales Company
            </p>
          </div>

          {/* Quick Links - Horizontal */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <Link to="/" className="text-sm hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Home
            </Link>
            <Link to="/about" className="text-sm hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              About
            </Link>
            <Link to="/contact" className="text-sm hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Contact
            </Link>
            <Link to="/signup" className="text-sm hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sign Up
            </Link>
          </div>

          {/* Contact Info - Horizontal */}
          <div className="flex justify-center gap-4 mb-6">
            <a
              href="mailto:admin@keptestate.com"
              className="flex items-center gap-1.5 text-sm hover:text-[#e6c35a] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <svg className="w-4 h-4 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
            <a
              href="tel:+15136094731"
              className="flex items-center gap-1.5 text-sm hover:text-[#e6c35a] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <svg className="w-4 h-4 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Logo Section */}
          <div className="text-center sm:text-left">
            <img
              src={logo}
              alt="Kept House Estate Sales"
              className="h-16 lg:h-20 w-auto mb-3 mx-auto sm:mx-0"
            />
            <p
              className="text-sm text-[#e6c35a] italic"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Thoughtful Estate Sales Company
            </p>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h4
              className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-[#e6c35a]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get in Touch
            </h4>
            <div className="space-y-2 lg:space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[#e6c35a]">📧</span>
                <a
                  href="mailto:admin@keptestate.com"
                  className="hover:text-[#edd88c] transition-colors"
                >
                  admin@keptestate.com
                </a>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[#e6c35a]">📞</span>
                <a
                  href="tel:+15136094731"
                  className="hover:text-[#edd88c] transition-colors"
                >
                  +1 (513) 609-4731
                </a>
              </p>
            </div>
          </div>

          {/* Links Section */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4
              className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-[#e6c35a]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Explore
            </h4>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 lg:flex-col lg:gap-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Link to="/" className="hover:text-[#edd88c] transition-colors">
                Home
              </Link>
              <Link to="/about" className="hover:text-[#edd88c] transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-[#edd88c] transition-colors">
                Contact
              </Link>
              <Link to="/signup" className="hover:text-[#edd88c] transition-colors">
                Create Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#707072]/30 mt-6 sm:mt-10 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2025 Kept House Estate Sales. All rights reserved.
          </p>
          <p className="text-xs text-[#707072] mt-1 sm:mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Compassionate estate sales for families in transition.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer