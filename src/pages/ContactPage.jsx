import { useState } from 'react'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    }, 4000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      
      <div className="text-center mb-12">
        <h1 
          className="text-4xl sm:text-5xl font-bold text-[#101010] mb-4" 
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Contact Us
        </h1>
        <p 
          className="text-xl text-[#707072]" 
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          We're here to help you every step of the way.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 
            className="text-2xl font-bold text-[#101010] mb-6" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Send us a message
          </h2>

          {showSuccess && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-green-700 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Message sent successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Full Name *
              </label>
              <input 
                type="text"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email *
              </label>
              <input 
                type="email"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Phone
              </label>
              <input 
                type="tel"
                disabled={isLoading}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="(123) 456-7890"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Message *
              </label>
              <textarea 
                required
                rows="5"
                disabled={isLoading}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Tell us how we can help..."
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e6c35a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          
          <div className="bg-[#F8F5F0] rounded-lg shadow-md p-8">
            <h2 
              className="text-2xl font-bold text-[#101010] mb-6" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get in Touch
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </p>
                  <a 
                    href="mailto:admin@keptestate.com" 
                    className="text-lg font-semibold text-[#101010] hover:text-[#e6c35a] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    admin@keptestate.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone
                  </p>
                  <a 
                    href="tel:+15136094731" 
                    className="text-lg font-semibold text-[#101010] hover:text-[#e6c35a] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    +1 (513) 609-4731
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Location
                  </p>
                  <p 
                    className="text-lg font-semibold text-[#101010]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cincinnati, Ohio
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#edd88c]/20 rounded-lg p-6 border-l-4 border-[#e6c35a]">
            <p 
              className="text-sm text-[#101010]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              💬 <strong>We typically respond within 24 hours.</strong> We're committed to 
              answering all inquiries promptly and helping you through this transition with care.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ContactPage