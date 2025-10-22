import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { getCart, getCachedCart, removeFromCart as removeFromCartApi, clearCart as clearCartApi, onCartUpdate } from '../utils/cartApi'
import { getAuth, onAuthUpdate } from '../utils/auth'
import { createCheckoutSession } from '../utils/checkoutApi'

function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [auth, setAuth] = useState(getAuth())
  const [justCompletedCheckout, setJustCompletedCheckout] = useState(false)
  const [removedItemsCount, setRemovedItemsCount] = useState(0)
  const navigate = useNavigate()

  const fetchCart = async () => {
    if (!auth) {
      navigate('/login')
      return
    }

    try {
      const cached = getCachedCart()
      if (cached && cached.items) {
        setCart(cached)
        setLoading(false)
      }
      
      const data = await getCart(true)
      
      if (data.removedCount > 0) {
        setRemovedItemsCount(data.removedCount)
        setTimeout(() => setRemovedItemsCount(0), 8000)
      }
      
      setCart(data || { items: [], total: 0, count: 0 })
    } catch (error) {
      setCart({ items: [], total: 0, count: 0 })
    }
  }

  useEffect(() => {
    if (!auth) {
      navigate('/login')
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('cleared') === 'true') {
      setJustCompletedCheckout(true)
      window.history.replaceState({}, '', '/cart')
    }

    setLoading(true)
    fetchCart().finally(() => setLoading(false))

    const unsubscribeCart = onCartUpdate(fetchCart)
    
    const unsubscribeAuth = onAuthUpdate(() => {
      setAuth(getAuth())
    })

    return () => {
      unsubscribeCart()
      unsubscribeAuth()
    }
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0)
  }

  const handleRemove = async (itemId) => {
    try {
      await removeFromCartApi(itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCartApi()
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Failed to clear cart:', error)
      setError('Failed to clear cart. Please try again.')
      setShowClearConfirm(false)
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setError(null)
    
    try {
      const { sessionId, orderId } = await createCheckoutSession()
      
      if (!sessionId) {
        setError('Checkout failed. Please try again.')
        setCheckoutLoading(false)
        return
      }

      localStorage.setItem('kept_orderId', orderId || '')
      
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      await stripe.redirectToCheckout({ sessionId })
      
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Cart is empty or items are unavailable. Please check your cart.')
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const cartCount = cart?.count || 0
  const cartTotal = cart?.total || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 
              className="text-2xl font-bold text-[#101010] mb-4" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Clear Cart?
            </h3>
            <p 
              className="text-[#707072] mb-6" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-[#101010] rounded-lg font-semibold hover:bg-gray-300 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 
            className="text-4xl font-bold text-[#101010]" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Shopping Cart
          </h1>
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
          </div>
        )}

        {removedItemsCount > 0 && (
          <div className="mb-6 p-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-orange-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {removedItemsCount} {removedItemsCount === 1 ? 'item has' : 'items have'} been removed
                </p>
                <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {removedItemsCount === 1 ? 'This item was' : 'These items were'} purchased by another customer and {removedItemsCount === 1 ? 'is' : 'are'} no longer available.
                </p>
              </div>
            </div>
          </div>
        )}

        {justCompletedCheckout && items.length === 0 && (
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <h3 
                  className="text-xl font-bold text-[#101010] mb-2" 
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Order Placed Successfully!
                </h3>
                <p 
                  className="text-[#707072] mb-4" 
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Your cart has been cleared and your order is being processed.
                </p>
                <Link
                  to="/orders"
                  className="inline-block px-6 py-2 bg-[#101010] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && !justCompletedCheckout && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p 
              className="text-xl text-[#707072] mb-6" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your cart is empty
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Start Shopping
              </Link>
              <Link
                to="/orders"
                className="inline-block px-8 py-3 bg-white border-2 border-[#101010] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                View My Orders
              </Link>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <Link 
                      to={`/browse/item/${item._id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link 
                          to={`/browse/item/${item._id}`}
                          className="hover:text-[#e6c35a] transition-colors"
                        >
                          <h3 
                            className="text-lg font-bold text-[#101010] mb-1" 
                            style={{ fontFamily: 'Playfair Display, serif' }}
                          >
                            {item.title}
                          </h3>
                        </Link>
                        {item.category && (
                          <span className="inline-block px-2 py-1 bg-[#e6c35a]/20 text-[#101010] text-xs font-semibold rounded mb-2">
                            {item.category}
                          </span>
                        )}
                        {item.description && (
                          <p 
                            className="text-sm text-[#707072] line-clamp-2" 
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span 
                          className="text-2xl font-bold text-[#e6c35a]" 
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Remove from cart"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                <h2 
                  className="text-2xl font-bold text-[#101010] mb-6" 
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>Items ({cartCount})</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="border-t border-[#707072]/20 pt-3">
                    <div className="flex justify-between text-xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      <span>Total</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <Link
                  to="/browse"
                  className="block text-center mt-4 text-[#707072] hover:text-[#101010] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  ← Continue Shopping
                </Link>

                <Link
                  to="/orders"
                  className="block text-center mt-2 text-[#e6c35a] hover:text-[#edd88c] font-semibold transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage