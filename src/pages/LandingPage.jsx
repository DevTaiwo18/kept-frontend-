import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMarketplaceItems } from '../utils/marketplaceApi'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

function LandingPage() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await getMarketplaceItems({ limit: 6, sort: 'new' })
        setFeaturedItems(response.items || [])
      } catch (error) {
        
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  return (
    <div>
      <section className="relative bg-gradient-to-br from-[#F8F5F0] to-[#edd88c]/20 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#101010] mb-6 leading-tight" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            The Thoughtful Estate Sales Company
          </h1>
          <p 
            className="text-lg sm:text-xl text-[#707072] mb-10 max-w-3xl mx-auto" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Helping families sell, donate, and clear estates with compassion and transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get Started
            </Link>
            <Link 
              to="/contact"
              className="px-8 py-4 bg-white text-[#101010] border-2 border-[#707072] rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

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

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96" />
              ))}
            </div>
          ) : featuredItems.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#707072] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                No items available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-[#101010] text-center mb-12" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '📋', title: 'Walkthrough', desc: 'We assess your items and create a tailored plan.' },
              { icon: '🏷️', title: 'Sale', desc: 'Items are cataloged, priced, and sold online and in-person.' },
              { icon: '♻️', title: 'Donation', desc: 'Unsold items go to trusted partners with tax receipts.' },
              { icon: '✅', title: 'Clear-Out & Settlement', desc: 'Complete property clearing with full transparency.' }
            ].map((step, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-[#F8F5F0] hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{step.icon}</div>
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
        </div>
      </section>

      <section className="py-16 px-4 bg-[#F8F5F0]">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-[#101010] text-center mb-12" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Why Choose Kept House
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Compassionate Service', desc: 'We handle every transition with care and professionalism.' },
              { title: 'Transparent Pricing', desc: 'Real-time revenue tracking and detailed financial reports.' },
              { title: 'AI-Assisted Tagging', desc: 'Fast, accurate inventory cataloging with modern technology.' },
              { title: 'Trusted Partners', desc: 'Work with vetted donation centers and hauling services.' }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
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

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#edd88c]/20 p-10 rounded-2xl shadow-md">
            <p 
              className="text-xl italic text-[#101010] mb-4" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              "Kept House handled our family estate with such care and honesty. We couldn't have asked for a better experience during a difficult time."
            </p>
            <p className="text-sm font-semibold text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              — Sarah M., Client
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage