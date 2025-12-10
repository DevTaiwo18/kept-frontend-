import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMarketplaceItems } from '../utils/marketplaceApi'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

const heroImages = [
  '/hero-bg-1.jpg',
  '/hero-bg-2.jpg',
  '/hero-bg-3.jpg',
]

function LandingPage() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  // Hero image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Hero Section with Sliding Background */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Sliding Background Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-[#101010]/80 via-[#101010]/50 to-[#101010]/30"></div>
          </div>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Main text */}
            <div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-2 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Kept House.
              </h1>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                The <span className="font-bold">thoughtful</span> estate sales company.
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
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

            {/* Right side - Logo and testimonial */}
            <div className="text-center lg:text-right mt-8 lg:mt-0">
              <img
                src="/kept-house-logo-white.png"
                alt="Kept House Estate Sales"
                className="w-32 lg:w-48 mx-auto lg:ml-auto lg:mr-0 mb-6 lg:mb-8"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <p
                className="text-lg sm:text-xl lg:text-2xl text-white italic leading-relaxed mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                "I recommend Kept House Estate Sale Company to anyone and everyone faced with the challenges of closing an estate!"
              </p>
              <p
                className="text-lg lg:text-xl text-white italic"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Laura H.
              </p>
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
              { number: '5 Star', label: 'Google Reviews' }
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
        <section className="py-16 px-4 bg-linear-to-b from-white to-[#F8F5F0]">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', icon: '📋', title: 'Walkthrough', desc: 'We assess your items and create a tailored plan for your estate.' },
              { step: '02', icon: '🏷️', title: 'Sale', desc: 'Items are cataloged with AI, priced fairly, and sold online.' },
              { step: '03', icon: '♻️', title: 'Donation', desc: 'Unsold items go to trusted partners. You get tax receipts.' },
              { step: '04', icon: '✅', title: 'Clear-Out', desc: 'Complete property clearing with full transparency and reports.' },
              { step: '05', icon: '🏠', title: 'Home Sale', desc: 'We help prepare and coordinate the sale of the property itself.' }
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

      {/* Google Reviews Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span
                className="text-sm font-semibold text-[#707072]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Google Reviews
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              What Our Clients Say
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 text-[#FBBC05]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p
              className="text-lg text-[#707072]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              4.3 out of 5 based on 19 reviews
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Kris Maloney',
                date: '3 weeks ago',
                text: "Kept House cleaned out my father's house. He lived in it for 46 years and had a lot of accumulated things that were valuable to him but not necessarily other people. Other companies offered to chuck everything into a dumpster but Kept House made an effort to re-home as many things as possible and that meant a lot. They kept to the schedule we agreed on and left the house empty. I would definitely use them again but hope to not have to anytime soon."
              },
              {
                name: 'Rachael Bernstein',
                date: '8 months ago',
                text: "Jamie and Greg Pipkins and their team did a wonderful job. Cleaning out our grandmothers home was nothing short of the biggest project of our lives. It was extremely emotional and difficult for us but Kept House remained patient, thoughtful and professional throughout the entire process. I cannot express my gratitude enough and I wish them the best of luck in their future endeavors. I will recommend this company to anyone who needs their services."
              },
              {
                name: 'Tom Witmer',
                date: '10 months ago',
                text: "Very happy with their work. From start to finish, they were friendly, knowledgeable, experienced, and accommodating for everything that came up. They did everything needed and also did a great job working with the realtor. I would not hesitate to use them again."
              }
            ].map((review, i) => (
              <div
                key={i}
                className="bg-[#F8F5F0] p-6 rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-[#FBBC05]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p
                  className="text-[#707072] text-sm leading-relaxed mb-4 line-clamp-6"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {review.text}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p
                      className="font-semibold text-[#101010]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {review.name}
                    </p>
                    <p
                      className="text-xs text-[#707072]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {review.date}
                    </p>
                  </div>
                  <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.google.com/search?q=Kept+House+Estate+Sales+Company+Reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#707072] hover:text-[#101010] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View all reviews on Google
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Past Sales Gallery */}
      <section className="py-16 px-4 bg-[#F8F5F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-sm font-semibold mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Our Work
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Estate Sale Gallery
            </h2>
            <p
              className="text-lg text-[#707072] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse highlights from our past estate sales
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Row 1 */}
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-01.jpeg" alt="Past estate sale 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-02.jpeg" alt="Past estate sale 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-03.jpeg" alt="Past estate sale 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-04.jpeg" alt="Past estate sale 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-05.jpeg" alt="Past estate sale 5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-06.jpeg" alt="Past estate sale 6" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            {/* Row 2 */}
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-07.jpeg" alt="Past estate sale 7" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-08.jpeg" alt="Past estate sale 8" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-09.jpeg" alt="Past estate sale 9" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-10.jpeg" alt="Past estate sale 10" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-11.jpeg" alt="Past estate sale 11" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-12.jpeg" alt="Past estate sale 12" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            {/* Row 3 */}
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-13.jpeg" alt="Past estate sale 13" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-14.jpeg" alt="Past estate sale 14" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-15.jpeg" alt="Past estate sale 15" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-16.jpeg" alt="Past estate sale 16" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-17.jpeg" alt="Past estate sale 17" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer">
              <img src="/past-sale-01.jpeg" alt="Past estate sale 18" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Estate Transitions & Donation Process */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Video */}
            <div className="rounded-lg overflow-hidden shadow-lg bg-black">
              <video
                className="w-full h-full object-cover"
                controls
              >
                <source src="/estate-video.mov" type="video/quicktime" />
                <source src="/estate-video.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Content */}
            <div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#101010] mb-4 underline underline-offset-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                ESTATE TRANSITIONS:
              </h3>
              <p
                className="text-[#707072] mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Our ESTATE TRANSITION package leaves the home completely empty and ready for next steps (see video below).
              </p>
              <p
                className="text-[#707072] mb-8"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                We are happy to connect you to one of our preferred realtors (or other partners) as well.
              </p>

              <h3
                className="text-2xl sm:text-3xl font-bold text-[#101010] mb-4 underline underline-offset-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                DONATION PROCESS:
              </h3>
              <p
                className="text-[#707072] mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Through our unique donation process, most clients will save at least 50% by allowing Kept House to manage the estate clear out.
              </p>
              <p
                className="text-[#707072]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                We are an Earth-Friendly company and we do everything we can to keep quality used goods out of the landfill.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estate Transition Comparison Chart */}
      <section className="py-16 px-4 bg-[#F8F5F0]" id="comparison">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-sm font-semibold mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Compare Services
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#101010] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Estate Transition
            </h2>
            <p
              className="text-lg text-[#707072] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Comparison Chart
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="bg-[#101010] text-white py-4 px-4 text-left font-semibold"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    FEATURES
                  </th>
                  <th
                    className="bg-[#101010]/80 text-white py-4 px-4 text-center font-semibold text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    ONLINE<br />AUCTION<br />PLATFORM
                  </th>
                  <th
                    className="bg-[#101010]/80 text-white py-4 px-4 text-center font-semibold text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    FRANCHISE<br />ESTATE SALE<br />COMPANY
                  </th>
                  <th
                    className="bg-[#101010]/80 text-white py-4 px-4 text-center font-semibold text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    AUCTION<br />HOUSE
                  </th>
                  <th
                    className="bg-[#e6c35a] text-[#101010] py-4 px-4 text-center font-semibold text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    KEPT<br />HOUSE
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Auction', online: true, franchise: false, auction: true, kept: true },
                  { feature: 'Estate Sale', online: false, franchise: true, auction: false, kept: true },
                  { feature: 'Online Sales', online: true, franchise: true, auction: true, kept: true },
                  { feature: 'Donation', online: false, franchise: true, auction: false, kept: true },
                  { feature: 'Home Clearout', online: false, franchise: false, auction: false, kept: true },
                  { feature: 'Home Cleaning', online: false, franchise: false, auction: false, kept: true },
                  { feature: 'Home Sale', online: false, franchise: false, auction: false, kept: true },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[#F8F5F0]' : 'bg-white'}>
                    <td
                      className="py-4 px-4 font-medium text-[#101010]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.online && (
                        <span className="inline-block w-4 h-4 bg-[#101010] rounded-full"></span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.franchise && (
                        <span className="inline-block w-4 h-4 bg-[#101010] rounded-full"></span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.auction && (
                        <span className="inline-block w-4 h-4 bg-[#101010] rounded-full"></span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.kept && (
                        <span className="inline-block w-4 h-4 bg-[#e6c35a] rounded-full"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <p
            className="text-sm text-[#707072] mt-6 text-center max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            *Comparison based on publicly available service offerings as of August 2025. Kept House does not claim affiliation with any other service providers listed. Features may vary by location or franchise model.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-white">
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