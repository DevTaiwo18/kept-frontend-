import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listMyOrders } from '../utils/ordersApi'
import { getAuth } from '../utils/auth'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    if (!auth) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const data = await listMyOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, []) 

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDeliveryBadge = (deliveryType) => {
    if (deliveryType === 'shipping') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
          <span>🚚</span>
          <span>Shipping</span>
        </span>
      )
    }
    if (deliveryType === 'pickup') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
          <span>📦</span>
          <span>Pickup</span>
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
        <div className="max-w-6xl mx-auto px-4 py-8">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-[#101010] hover:text-[#e6c35a] transition-colors mb-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Cart</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 
            className="text-3xl sm:text-4xl font-bold text-[#101010]" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            My Orders
          </h1>
          <Link
            to="/browse"
            className="px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 
              className="text-2xl font-bold text-[#101010] mb-2" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              No Orders Yet
            </h2>
            <p 
              className="text-lg text-[#707072] mb-6" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start shopping to create your first order
            </p>
            <Link
              to="/browse"
              className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/order/${order._id}`}
                className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 
                          className="text-lg sm:text-xl font-bold text-[#101010]" 
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.paymentStatus)}`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {order.paymentStatus.toUpperCase()}
                        </span>
                        {order.deliveryDetails?.type && getDeliveryBadge(order.deliveryDetails.type)}
                      </div>
                      <p 
                        className="text-xs sm:text-sm text-[#707072]" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                      <p 
                        className="text-xs text-[#707072]" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Total:
                      </p>
                      <p 
                        className="text-xl sm:text-2xl font-bold text-[#e6c35a]" 
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#707072]/20 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p 
                        className="text-xs sm:text-sm font-semibold text-[#101010]" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                      </p>
                      {order.fulfillmentStatus && (
                        <span className="text-xs text-[#707072] font-medium capitalize" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {order.fulfillmentStatus}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items?.slice(0, 4).map((item, index) => (
                        <img
                          key={index}
                          src={item.photo}
                          alt={item.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-white object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'
                          }}
                        />
                      ))}
                      {order.items?.length > 4 && (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-white bg-[#e6c35a] flex items-center justify-center">
                          <span className="text-xs font-bold text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#707072]/20">
                    <div className="flex items-center justify-between text-[#e6c35a]">
                      <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        View Details
                      </span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage