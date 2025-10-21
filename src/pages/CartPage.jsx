import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, removeFromCart as removeFromCartApi, clearCart as clearCartApi, onCartUpdate } from '../utils/cartApi'
import { getAuth, onAuthUpdate } from '../utils/auth'

function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState(getAuth())
  const navigate = useNavigate()

  const fetchCart = async () => {
    if (!auth) {
      navigate('/login')
      return
    }

    try {
      const data = await getCart(true)
      setCart(data)
    } catch (error) {
      setCart({ items: [], total: 0, count: 0 })
    }
  }

  useEffect(() => {
    if (!auth) {
      navigate('/login')
      return
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
  }, [auth])

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
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCartApi()
      } catch (error) {
        console.error('Failed to clear cart:', error)
      }
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 
            className="text-4xl font-bold text-[#101010]" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Shopping Cart
          </h1>
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p 
              className="text-xl text-[#707072] mb-6" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your cart is empty
            </p>
            <Link
              to="/browse"
              className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
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
                    <span>Items ({cart.count})</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="border-t border-[#707072]/20 pt-3">
                    <div className="flex justify-between text-xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      <span>Total</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/browse"
                  className="block text-center mt-4 text-[#707072] hover:text-[#101010] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  ← Continue Shopping
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