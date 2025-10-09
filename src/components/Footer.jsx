import logo from '../assets/Kept House _transparent logo .png'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-[#101010] text-[#F8F5F0] border-t border-[#e6c35a]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <img 
              src={logo} 
              alt="Kept House Estate Sales" 
              className="h-20 w-auto mb-4 mx-auto md:mx-0"
            />
            <p 
              className="text-sm text-[#e6c35a] italic" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Thoughtful Estate Sales Company
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 
              className="text-xl font-bold mb-4 text-[#e6c35a]" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[#e6c35a]">📧</span>
                <a 
                  href="mailto:greg@keptestate.com" 
                  className="hover:text-[#edd88c] transition-colors"
                >
                  greg@keptestate.com
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[#e6c35a]">📞</span>
                <a 
                  href="tel:+18189128910" 
                  className="hover:text-[#edd88c] transition-colors"
                >
                  +1 (818) 912-8910
                </a>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-center md:text-left">
            <h4 
              className="text-xl font-bold mb-4 text-[#e6c35a]" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Explore
            </h4>
            <div className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <p>
                <Link to="/" className="hover:text-[#edd88c] transition-colors">
                  Home
                </Link>
              </p>
              <p>
                <Link to="/about" className="hover:text-[#edd88c] transition-colors">
                  About Us
                </Link>
              </p>
              <p>
                <Link to="/contact" className="hover:text-[#edd88c] transition-colors">
                  Contact
                </Link>
              </p>
              <p>
                <Link to="/signup" className="hover:text-[#edd88c] transition-colors">
                  Create Profile
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#707072]/30 mt-10 pt-6 text-center">
          <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2025 Kept House Estate Sales. All rights reserved.
          </p>
          <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Compassionate estate sales for families in transition.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer