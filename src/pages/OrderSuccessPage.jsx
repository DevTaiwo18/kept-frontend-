import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth } from '../utils/auth'
import { getOrder } from '../utils/ordersApi'

function OrderSuccessPage() {
  const [status, setStatus] = useState('processing')
  const [order, setOrder] = useState(null)
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    if (!auth) {
      navigate('/login')
      return
    }

    const orderId = localStorage.getItem('kept_orderId')
    if (!orderId) {
      setStatus('missing')
      return
    }

    const pollOrder = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          const data = await getOrder(orderId)
          
          if (data?.paymentStatus === 'paid') {
            setOrder(data)
            setStatus('paid')
            return
          }
        } catch (error) {
          console.error(`Polling attempt ${i + 1} error:`, error)
        }

        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      setStatus('pending')
    }

    pollOrder()
  }, []) 

  useEffect(() => {
    return () => {
      if (status === 'paid') {
        localStorage.removeItem('kept_orderId')
      }
    }
  }, [status])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0)
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e6c35a] mx-auto mb-4"></div>
          <h2 
            className="text-2xl font-bold text-[#101010] mb-2" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Confirming your payment...
          </h2>
          <p 
            className="text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Please wait while we verify your order
          </p>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 
            className="text-3xl font-bold text-[#101010] mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Order Processing
          </h2>
          <p 
            className="text-lg text-[#707072] mb-6" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            We're finalizing your order. Please check your orders page in a few minutes.
          </p>
          <Link
            to="/browse"
            className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 
            className="text-3xl font-bold text-[#101010] mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            No Order Found
          </h2>
          <p 
            className="text-lg text-[#707072] mb-6" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            We couldn't find an order to confirm.
          </p>
          <Link
            to="/browse"
            className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 
              className="text-4xl font-bold text-[#101010] mb-2" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Order Confirmed!
            </h1>
            <p 
              className="text-lg text-[#707072]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Thank you for your purchase
            </p>
          </div>

          <div className="border-t border-b border-[#707072]/20 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span 
                className="text-[#707072] font-semibold" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Order ID:
              </span>
              <span 
                className="text-[#101010] font-mono text-sm" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {order?._id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span 
                className="text-[#707072] font-semibold" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Total Amount:
              </span>
              <span 
                className="text-3xl font-bold text-[#e6c35a]" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {formatPrice(order?.totalAmount)}
              </span>
            </div>
          </div>

          {order?.items && order.items.length > 0 && (
            <div className="mb-8">
              <h3 
                className="text-xl font-bold text-[#101010] mb-4" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 bg-[#F8F5F0] rounded-lg"
                  >
                    <span 
                      className="text-[#101010]" 
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item.title || 'Item'}
                    </span>
                    <span 
                      className="font-semibold text-[#101010]" 
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to={`/order/${order?._id}`}
            className="block w-full text-center px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View Order Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage