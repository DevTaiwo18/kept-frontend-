import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from '../utils/auth'
import { listAllOrders, updateOrderStatus, getOrderById } from '../utils/ordersApi'
import AdminLayout from '../components/AdminLayout'

function AdminOrdersPage() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [updateData, setUpdateData] = useState({
    fulfillmentStatus: '',
    trackingNumber: '',
    notes: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [page, filter])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError('')
      const params = {
        page,
        limit: 20
      }
      if (filter !== 'all') {
        params.fulfillmentStatus = filter
      }
      const data = await listAllOrders(params)
      setOrders(data.orders || [])
      setTotalPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (order) => {
    try {
      setIsLoadingDetails(true)
      setShowDetailModal(true)
      const data = await getOrderById(order._id)
      setOrderDetails(data)
    } catch (err) {
      console.error('Failed to load order details:', err)
      setOrderDetails(order)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleOpenUpdateModal = (order) => {
    setSelectedOrder(order)
    setUpdateData({
      fulfillmentStatus: order.fulfillmentStatus || 'processing',
      trackingNumber: order.shippingDetails?.trackingNumber || '',
      notes: ''
    })
    setUpdateError('')
    setShowUpdateModal(true)
  }

  const handleUpdateOrder = async () => {
    if (!updateData.fulfillmentStatus) {
      setUpdateError('Please select a fulfillment status')
      return
    }

    try {
      setIsUpdating(true)
      setUpdateError('')
      await updateOrderStatus(selectedOrder._id, updateData)
      await loadOrders()
      setShowUpdateModal(false)
      setSelectedOrder(null)
      setUpdateData({ fulfillmentStatus: '', trackingNumber: '', notes: '' })
    } catch (err) {
      setUpdateError(err.message || 'Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateLong = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diffMs = now - orderDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(date)
  }

  const isNewOrder = (date) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diffHours = (now - orderDate) / 3600000
    return diffHours < 24
  }

  const isVeryRecentOrder = (date) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diffHours = (now - orderDate) / 3600000
    return diffHours < 1
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      picked_up: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      ready: 'Ready',
      shipped: 'Shipped',
      delivered: 'Delivered',
      picked_up: 'Picked Up'
    }
    return labels[status] || status
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      order._id?.toLowerCase().includes(search) ||
      order.buyerEmail?.toLowerCase().includes(search) ||
      order.deliveryDetails?.fullName?.toLowerCase().includes(search)
    )
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.fulfillmentStatus === 'pending').length,
    processing: orders.filter(o => o.fulfillmentStatus === 'processing').length,
    ready: orders.filter(o => o.fulfillmentStatus === 'ready').length,
    shipped: orders.filter(o => o.fulfillmentStatus === 'shipped').length,
    delivered: orders.filter(o => o.fulfillmentStatus === 'delivered').length,
    picked_up: orders.filter(o => o.fulfillmentStatus === 'picked_up').length
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            View and manage all buyer orders • Sorted by newest first
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>All Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.all}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Processing</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.processing}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Ready</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.ready}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Shipped</p>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.shipped}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Delivered</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.delivered}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.pending}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Picked Up</p>
            <p className="text-2xl sm:text-3xl font-bold text-teal-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {statusCounts.picked_up}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order ID, buyer email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 text-sm sm:text-base"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707072]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#707072] hover:text-[#101010]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md mb-6 overflow-x-auto">
          <div className="flex flex-nowrap gap-2 min-w-max sm:min-w-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'processing'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Processing ({statusCounts.processing})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'ready'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Ready ({statusCounts.ready})
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'shipped'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Shipped ({statusCounts.shipped})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'delivered'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Delivered ({statusCounts.delivered})
            </button>
            <button
              onClick={() => setFilter('picked_up')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'picked_up'
                  ? 'bg-[#e6c35a] text-black'
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Picked Up ({statusCounts.picked_up})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl shadow-md text-center">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              No Orders Found
            </h3>
            <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {filter === 'all' ? 'No orders have been placed yet.' : `No orders with status "${getStatusLabel(filter)}".`}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#101010] text-[#F8F5F0]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Buyer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Delivery Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order._id} 
                        className={`transition-colors ${
                          isVeryRecentOrder(order.createdAt) 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'hover:bg-[#F8F5F0]'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              #{order._id.slice(-8)}
                            </p>
                            {isNewOrder(order.createdAt) && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {order.deliveryDetails?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {order.buyerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {order.items?.length || 0} item(s)
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.deliveryDetails?.type === 'pickup' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                            {order.deliveryDetails?.type === 'pickup' ? '📦 Pickup' : '🚚 Shipping'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.fulfillmentStatus)}`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {getStatusLabel(order.fulfillmentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#707072] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {getTimeAgo(order.createdAt)}
                          </p>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatDate(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="px-3 py-2 bg-white border-2 border-[#707072] text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleOpenUpdateModal(order)}
                              className="px-3 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className={`p-4 transition-colors ${
                      isVeryRecentOrder(order.createdAt) 
                        ? 'bg-green-50' 
                        : 'hover:bg-[#F8F5F0]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            #{order._id.slice(-8)}
                          </p>
                          {isNewOrder(order.createdAt) && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {order.deliveryDetails?.fullName || 'N/A'}
                        </p>
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {order.buyerEmail}
                        </p>
                        <p className="text-xs text-[#e6c35a] font-semibold mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {getTimeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.fulfillmentStatus)}`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {getStatusLabel(order.fulfillmentStatus)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.deliveryDetails?.type === 'pickup' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {order.deliveryDetails?.type === 'pickup' ? '📦 Pickup' : '🚚 Shipping'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Total</p>
                        <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Items</p>
                        <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {order.items?.length || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Date</p>
                        <p className="text-xs text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex-1 px-4 py-2 bg-white border-2 border-[#707072] text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleOpenUpdateModal(order)}
                        className="flex-1 px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-[#707072] text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border-2 border-[#707072] text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#101010] text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setOrderDetails(null)
                }}
                className="text-white hover:text-[#e6c35a] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-[#F8F5F0] border-t-[#e6c35a] rounded-full animate-spin mb-4"></div>
                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading order details...</p>
              </div>
            ) : orderDetails ? (
              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#F8F5F0] rounded-xl">
                  <div>
                    <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Order ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-mono font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        #{orderDetails._id.slice(-8).toUpperCase()}
                      </p>
                      {isNewOrder(orderDetails.createdAt) && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Date</p>
                    <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {getTimeAgo(orderDetails.createdAt)}
                    </p>
                    <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatDate(orderDetails.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderDetails.fulfillmentStatus)}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {getStatusLabel(orderDetails.fulfillmentStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Payment</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {orderDetails.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-bold text-[#101010] mb-3 pb-2 border-b-2 border-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Customer Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Name</p>
                      <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {orderDetails.deliveryDetails?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Email</p>
                      <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {orderDetails.buyerEmail || orderDetails.deliveryDetails?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#707072] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Phone</p>
                      <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {orderDetails.deliveryDetails?.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping/Delivery Info */}
                <div>
                  <h4 className="text-lg font-bold text-[#101010] mb-3 pb-2 border-b-2 border-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {orderDetails.deliveryDetails?.type === 'pickup' ? 'Pickup Information' : 'Shipping Information'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{orderDetails.deliveryDetails?.type === 'pickup' ? '📦' : '🚚'}</span>
                      <p className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {orderDetails.deliveryDetails?.type === 'pickup' ? 'Local Pickup' : 'Shipping Delivery'}
                      </p>
                    </div>
                    
                    {orderDetails.deliveryDetails?.type === 'shipping' && orderDetails.deliveryDetails?.address && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-900 mb-1 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Shipping Address</p>
                        <p className="text-sm text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {orderDetails.deliveryDetails.address}<br />
                          {orderDetails.deliveryDetails.city}, {orderDetails.deliveryDetails.state} {orderDetails.deliveryDetails.zipCode}
                        </p>
                      </div>
                    )}

                    {orderDetails.shippingDetails?.trackingNumber && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-indigo-900 mb-1 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Tracking Number</p>
                        <p className="text-base font-mono font-bold text-indigo-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {orderDetails.shippingDetails.trackingNumber}
                        </p>
                      </div>
                    )}

                    {orderDetails.deliveryDetails?.scheduledAt && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-900 mb-1 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {orderDetails.deliveryDetails?.type === 'pickup' ? 'Scheduled Pickup' : 'Scheduled Delivery'}
                        </p>
                        <p className="text-sm font-bold text-purple-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDateLong(orderDetails.deliveryDetails.scheduledAt)}
                        </p>
                      </div>
                    )}

                    {orderDetails.deliveryDetails?.instructions && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-900 mb-1 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Special Instructions</p>
                        <p className="text-sm text-yellow-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {orderDetails.deliveryDetails.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-lg font-bold text-[#101010] mb-3 pb-2 border-b-2 border-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Items ({orderDetails.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {orderDetails.items?.map((item, idx) => (
                      <div key={idx} className="bg-[#F8F5F0] rounded-xl p-4 flex gap-4">
                        {item.photo && (
                          <img
                            src={item.photo}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border-2 border-white shadow"
                          />
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-base font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {item.title}
                            </h5>
                            {item.category && (
                              <span className="inline-block text-xs bg-[#e6c35a] px-2 py-1 rounded-full text-black font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-[#101010] mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {formatCurrency(item.unitPrice || item.price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-[#101010] text-white p-6 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Order Total</span>
                    <span className="text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(orderDetails.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                {orderDetails.adminNotes && orderDetails.adminNotes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-[#101010] mb-3 pb-2 border-b-2 border-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Admin Notes
                    </h4>
                    <div className="space-y-2">
                      {orderDetails.adminNotes.map((note, idx) => (
                        <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 rounded p-3">
                          <p className="text-sm text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {note.note}
                          </p>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatDate(note.addedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Update Order Status
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Order ID</p>
              <p className="text-sm font-mono font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                #{selectedOrder._id}
              </p>
              <p className="text-xs text-[#707072] mt-2 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Buyer</p>
              <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedOrder.deliveryDetails?.fullName} ({selectedOrder.buyerEmail})
              </p>
              <p className="text-xs text-[#707072] mt-2 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Delivery Type</p>
              <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedOrder.deliveryDetails?.type === 'pickup' ? '📦 Pickup' : '🚚 Shipping'}
              </p>
            </div>

            {updateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {updateError}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fulfillment Status *
              </label>
              <select
                value={updateData.fulfillmentStatus}
                onChange={(e) => setUpdateData({ ...updateData, fulfillmentStatus: e.target.value })}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                {selectedOrder.deliveryDetails?.type === 'pickup' ? (
                  <>
                    <option value="ready">Ready for Pickup</option>
                    <option value="picked_up">Picked Up</option>
                  </>
                ) : (
                  <>
                    <option value="ready">Ready to Ship</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </>
                )}
              </select>
            </div>

            {selectedOrder.deliveryDetails?.type === 'shipping' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={updateData.trackingNumber}
                  onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Enter tracking number"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Notes (Optional)
              </label>
              <textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Add any notes about this update..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false)
                  setSelectedOrder(null)
                  setUpdateData({ fulfillmentStatus: '', trackingNumber: '', notes: '' })
                  setUpdateError('')
                }}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isUpdating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrdersPage