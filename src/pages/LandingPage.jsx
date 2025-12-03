import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMarketplaceItems } from '../utils/marketplaceApi'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

function LandingPage() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      quote: "Kept House handled our family estate with such care and honesty. We couldn't have asked for a better experience during a difficult time.",
      author: "Sarah M.",
      role: "Estate Client",
      location: "Austin, TX"
    },
    {
      quote: "The transparency throughout the entire process was incredible. We could track every sale and donation in real-time. Highly recommend!",
      author: "Michael R.",
      role: "Estate Client",
      location: "Dallas, TX"
    },
    {
      quote: "After my mother passed, I was overwhelmed. Kept House made the process dignified and stress-free. They truly care about families.",
      author: "Jennifer L.",
      role: "Estate Client",
      location: "Houston, TX"
    }
  ]

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await getMarketplaceItems({ limit: 6, sort: 'new' })
        const items = response.items || []
        const displayItems = items.length < 6 ? items.slice(0, 3) : items
        setFeaturedItems(displayItems)
      } catch (error) {

      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div>
      {/* Hero Section with Background */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/90 via-[#101010]/70 to-[#101010]/50"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <span
              className="inline-block px-4 py-2 bg-[#e6c35a] text-black rounded-full text-sm font-semibold mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Trusted Estate Sales Partner
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Thoughtful Estate Sales Company
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-300 mb-10"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Helping families sell, donate, and clear estates with compassion and transparency. We handle every detail so you can focus on what matters most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Get Started Free
              </Link>
              {!loading && featuredItems.length > 0 && (
                <Link
                  to="/browse"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all text-lg text-center"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Browse Items
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#101010] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50+', label: 'Families Helped' },
              { number: '$100K+', label: 'In Estate Sales' },
              { number: '500+', label: 'Items Sold' },
              { number: '100%', label: 'Client Satisfaction' }
            ].map((stat, i) => (
              <div key={i}>
                <p
                  className="text-2xl sm:text-3xl font-bold text-[#e6c35a] mb-1"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {stat.number}
                </p>
                <p
                  className="text-xs sm:text-sm text-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!loading && featuredItems.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-white to-[#F8F5F0]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Featured Estate Items
              </h2>
              <p 
                className="text-lg text-[#707072] max-w-2xl mx-auto" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Discover unique treasures from carefully curated estate collections
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredItems.map((item) => (
                <MarketplaceItemCard key={item._id} item={item} />
              ))}
            </div>
            
            <div className="text-center">
              <Link 
                to="/browse"
                className="inline-flex items-center gap-2 px-10 py-4 bg-[#101010] text-white rounded-lg font-bold hover:bg-[#2a2a2a] transition-all shadow-lg text-lg group"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Browse All Items
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-sm font-semibold mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Simple Process
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How It Works
            </h2>
            <p
              className="text-lg text-[#707072] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Our streamlined process makes estate management simple and stress-free
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: '📋', title: 'Walkthrough', desc: 'We assess your items and create a tailored plan for your estate.' },
              { step: '02', icon: '🏷️', title: 'Sale', desc: 'Items are cataloged with AI, priced fairly, and sold online.' },
              { step: '03', icon: '♻️', title: 'Donation', desc: 'Unsold items go to trusted partners. You get tax receipts.' },
              { step: '04', icon: '✅', title: 'Clear-Out', desc: 'Complete property clearing with full transparency and reports.' }
            ].map((step, i) => (
              <div key={i} className="relative text-center p-6 rounded-xl bg-[#F8F5F0] hover:shadow-lg transition-all hover:-translate-y-1">
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#e6c35a] text-black text-xs font-bold rounded-full"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Step {step.step}
                </span>
                <div className="text-5xl mb-4 mt-2">{step.icon}</div>
                <h3
                  className="text-xl font-bold text-[#101010] mb-3"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA after How It Works */}
          <div className="mt-12 text-center">
            <p
              className="text-lg text-[#707072] mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Ready to get started? It only takes a few minutes.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg group"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start Your Estate Sale
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#F8F5F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1 bg-[#101010] text-white rounded-full text-sm font-semibold mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Why Us
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Why Choose Kept House
            </h2>
            <p
              className="text-lg text-[#707072] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              We combine compassion with technology to deliver the best estate sale experience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Compassionate Service',
                desc: 'We handle every transition with care, dignity, and professionalism your family deserves.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Transparent Pricing',
                desc: 'Real-time revenue tracking and detailed financial reports. No hidden fees, ever.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered Cataloging',
                desc: 'Fast, accurate inventory with modern AI technology. Items listed in hours, not weeks.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Trusted Partners',
                desc: 'Vetted donation centers and hauling services. Tax receipts provided for all donations.'
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="mb-4 p-3 bg-[#F8F5F0] rounded-lg inline-block group-hover:bg-[#e6c35a]/20 transition-colors">
                  {benefit.icon}
                </div>
                <h3
                  className="text-lg font-bold text-[#101010] mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-sm font-semibold mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Testimonials
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              What Our Clients Say
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="bg-[#F8F5F0] p-8 sm:p-10 rounded-2xl shadow-lg max-w-3xl mx-auto">
                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-6 h-6 text-[#e6c35a]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p
                        className="text-xl sm:text-2xl italic text-[#101010] mb-6 leading-relaxed"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        "{testimonial.quote}"
                      </p>
                      <div>
                        <p
                          className="font-bold text-[#101010]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {testimonial.author}
                        </p>
                        <p
                          className="text-sm text-[#707072]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {testimonial.role} · {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeTestimonial === i
                      ? 'bg-[#e6c35a] w-8'
                      : 'bg-[#707072]/30 hover:bg-[#707072]/50'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-[#F8F5F0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#101010] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="text-lg text-[#707072] mb-10 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Join hundreds of families who have trusted Kept House with their estate sales. Start your free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-10 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="px-10 py-4 bg-[#101010] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Schedule a Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage