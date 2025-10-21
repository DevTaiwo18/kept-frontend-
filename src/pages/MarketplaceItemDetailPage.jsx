import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMarketplaceItem, getRelatedMarketplaceItems } from '../utils/marketplaceApi'
import { addToCart, getCart, getCachedCart, onCartUpdate } from '../utils/cartApi'
import { getAuth, onAuthUpdate } from '../utils/auth'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

function MarketplaceItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [auth, setAuth] = useState(getAuth())
  const [item, setItem] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isInCart, setIsInCart] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      try {
        const response = await getMarketplaceItem(id)
        setItem(response)
      } catch (error) {
        navigate('/browse')
      } finally {
        setLoading(false)
      }
    }

    const fetchRelated = async () => {
      setRelatedLoading(true)
      try {
        const response = await getRelatedMarketplaceItems(id)
        setRelatedItems(response.items || [])
      } catch (error) {
        
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchItem()
    fetchRelated()
  }, [id, navigate])

  useEffect(() => {
    const checkIfInCart = async () => {
      if (!auth) {
        setIsInCart(false)
        return
      }

      try {
        const cached = getCachedCart()
        if (cached) {
          const inCart = cached.items?.some(cartItem => cartItem._id === id)
          setIsInCart(inCart)
        } else {
          const cartData = await getCart()
          const inCart = cartData.items?.some(cartItem => cartItem._id === id)
          setIsInCart(inCart)
        }
      } catch (error) {
        setIsInCart(false)
      }
    }

    checkIfInCart()

    const unsubscribeCart = onCartUpdate(checkIfInCart)
    
    const unsubscribeAuth = onAuthUpdate(() => {
      setAuth(getAuth())
      checkIfInCart()
    })
    
    return () => {
      unsubscribeCart()
      unsubscribeAuth()
    }
  }, [id, auth])

  const handleAddToCart = async () => {
    if (!auth) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      navigate('/login')
      return
    }

    if (isInCart) {
      navigate('/cart')
      return
    }

    setCartLoading(true)
    try {
      const result = await addToCart(id)
      setIsInCart(true)
      setNotification({ type: 'success', message: 'Item added to cart!' })
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Failed to add to cart' })
    } finally {
      setCartLoading(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-200 rounded-xl h-96" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold`} style={{ fontFamily: 'Inter, sans-serif' }}>
          {notification.message}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center gap-2 text-[#101010] hover:text-[#e6c35a] transition-colors mb-8"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span>←</span>
          <span className="font-medium">Back to Marketplace</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <img
              src={item.photo}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>

          <div className="space-y-6">
            <div>
              {item.category && (
                <span className="inline-block px-3 py-1 bg-[#e6c35a] text-black text-sm font-semibold rounded-full mb-3">
                  {item.category}
                </span>
              )}
              <h1 
                className="text-4xl font-bold text-[#101010] mb-4" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {item.title}
              </h1>
            </div>

            <div className="border-t border-b border-[#707072]/20 py-6">
              <div className="flex items-baseline gap-3">
                <span 
                  className="text-5xl font-bold text-[#e6c35a]" 
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {item.description && (
              <div>
                <h2 
                  className="text-xl font-bold text-[#101010] mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Description
                </h2>
                <p 
                  className="text-[#707072] leading-relaxed" 
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.description}
                </p>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`block w-full text-center px-8 py-4 rounded-lg font-bold transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInCart 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-[#e6c35a] text-black hover:bg-[#edd88c]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {cartLoading ? 'Processing...' : isInCart ? '✓ View in Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 
                className="text-3xl font-bold text-[#101010]" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Related Items
              </h2>
              <Link
                to="/browse"
                className="text-[#e6c35a] hover:text-[#edd88c] font-semibold transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                View All →
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedItems.map((relatedItem) => (
                  <MarketplaceItemCard key={relatedItem._id} item={relatedItem} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketplaceItemDetailPage