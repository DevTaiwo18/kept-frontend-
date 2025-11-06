import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getOrder, saveDeliveryDetails } from '../utils/ordersApi'
import { getAuth } from '../utils/auth'

function OrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const auth = getAuth()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showDeliveryModal, setShowDeliveryModal] = useState(false)
    const [deliveryType, setDeliveryType] = useState('pickup')
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('')
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [instructions, setInstructions] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!auth) {
            navigate('/login')
            return
        }

        const fetchOrder = async () => {
            try {
                const data = await getOrder(id)
                setOrder(data)
            } catch (error) {
                console.error('Failed to fetch order:', error)
                navigate('/orders')
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [id]) 

    const handleSaveDelivery = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const scheduledAt = scheduledDate && scheduledTime
                ? new Date(`${scheduledDate}T${scheduledTime}`)
                : null

            const deliveryData = {
                type: deliveryType,
                scheduledAt,
                fullName,
                phoneNumber,
                email: email || undefined,
                instructions
            }

            if (deliveryType === 'delivery') {
                deliveryData.address = address
                deliveryData.city = city
                deliveryData.state = state
                deliveryData.zipCode = zipCode
            }

            await saveDeliveryDetails(order._id, deliveryData)

            const updatedOrder = await getOrder(order._id)
            setOrder(updatedOrder)
            setShowDeliveryModal(false)
        } catch (error) {
            alert('Failed to save delivery information')
        } finally {
            setSaving(false)
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
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

    const getDeliveryTypeBadge = (type) => {
        if (type === 'shipping') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
                    <span>🚚</span>
                    <span>Shipping</span>
                </span>
            )
        }
        if (type === 'pickup') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-semibold">
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
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
                        <div className="bg-gray-200 rounded-xl h-96" />
                    </div>
                </div>
            </div>
        )
    }

    if (!order) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
            {showDeliveryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                        <h3
                            className="text-2xl font-bold text-[#101010] mb-4"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Add Delivery Information
                        </h3>

                        <form onSubmit={handleSaveDelivery}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        Delivery Type
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryType('pickup')}
                                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${deliveryType === 'pickup'
                                                    ? 'bg-[#e6c35a] text-black'
                                                    : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
                                                }`}
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            Pickup
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryType('delivery')}
                                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${deliveryType === 'delivery'
                                                    ? 'bg-[#e6c35a] text-black'
                                                    : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
                                                }`}
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            Delivery
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-[#707072]/20 pt-4">
                                    <h4 className="text-sm font-semibold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        Contact Information
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                required
                                                placeholder="(555) 123-4567"
                                                className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Email (Optional)
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-[#707072]/20 pt-4">
                                    <h4 className="text-sm font-semibold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} Schedule
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {deliveryType === 'delivery' && (
                                    <div className="border-t border-[#707072]/20 pt-4">
                                        <h4 className="text-sm font-semibold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Delivery Address
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    Street Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required={deliveryType === 'delivery'}
                                                    placeholder="123 Main Street, Apt 4B"
                                                    className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        required={deliveryType === 'delivery'}
                                                        placeholder="Cincinnati"
                                                        className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={state}
                                                        onChange={(e) => setState(e.target.value)}
                                                        required={deliveryType === 'delivery'}
                                                        placeholder="OH"
                                                        maxLength={2}
                                                        className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] uppercase"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                        ZIP Code *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={zipCode}
                                                        onChange={(e) => setZipCode(e.target.value)}
                                                        required={deliveryType === 'delivery'}
                                                        placeholder="45202"
                                                        maxLength={10}
                                                        className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-[#707072]/20 pt-4">
                                    <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        Special Instructions (Optional)
                                    </label>
                                    <textarea
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        rows={3}
                                        placeholder="Any special instructions or notes..."
                                        className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeliveryModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-[#101010] rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all disabled:opacity-50"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    {saving ? 'Saving...' : 'Save Information'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 text-[#101010] hover:text-[#e6c35a] transition-colors mb-6"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to Orders</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-[#707072]/20">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h1
                                        className="text-2xl sm:text-3xl font-bold text-[#101010]"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </h1>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.paymentStatus)}`}
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        {order.paymentStatus.toUpperCase()}
                                    </span>
                                    {order.deliveryDetails?.type && getDeliveryTypeBadge(order.deliveryDetails.type)}
                                </div>
                                <p
                                    className="text-sm text-[#707072]"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    Placed on {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p
                                    className="text-sm text-[#707072] mb-1"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    Total Amount
                                </p>
                                <p
                                    className="text-3xl sm:text-4xl font-bold text-[#e6c35a]"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    {formatPrice(order.totalAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <h2
                            className="text-xl font-bold text-[#101010] mb-4"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Order Items ({order.items?.length || 0})
                        </h2>
                        <div className="space-y-4 mb-8">
                            {order.items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 p-4 bg-[#F8F5F0] rounded-lg"
                                >
                                    {item.photo && (
                                        <img
                                            src={item.photo}
                                            alt={item.title}
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'
                                            }}
                                        />
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3
                                                className="text-base sm:text-lg font-bold text-[#101010] mb-1"
                                                style={{ fontFamily: 'Playfair Display, serif' }}
                                            >
                                                {item.title || 'Item'}
                                            </h3>
                                            {item.compositeId && (
                                                <p
                                                    className="text-xs text-[#707072]"
                                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                                >
                                                    Item ID: {item.compositeId}
                                                </p>
                                            )}
                                        </div>
                                        <p
                                            className="text-xl font-bold text-[#e6c35a] mt-2"
                                            style={{ fontFamily: 'Playfair Display, serif' }}
                                        >
                                            {formatPrice(item.unitPrice)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {order.shippingDetails?.trackingNumber && (
                            <div className="mb-8">
                                <h2
                                    className="text-xl font-bold text-[#101010] mb-4"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Shipping Information
                                </h2>
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">📦</span>
                                        <div>
                                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                Tracking Number
                                            </p>
                                            <p className="text-lg font-mono text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                {order.shippingDetails.trackingNumber}
                                            </p>
                                        </div>
                                    </div>
                                    {order.fulfillmentStatus && (
                                        <p className="text-sm text-[#707072] capitalize" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Status: <span className="font-semibold">{order.fulfillmentStatus}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {order.paymentStatus === 'paid' && (
                            <>
                                {order.deliveryDetails ? (
                                    <div>
                                        <h2
                                            className="text-xl font-bold text-[#101010] mb-4"
                                            style={{ fontFamily: 'Playfair Display, serif' }}
                                        >
                                            Delivery Information
                                        </h2>
                                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            Type
                                                        </p>
                                                        <p className="text-sm text-[#707072] capitalize" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            {order.deliveryDetails.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            Contact Name
                                                        </p>
                                                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            {order.deliveryDetails.fullName}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            Phone Number
                                                        </p>
                                                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                            {order.deliveryDetails.phoneNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                {order.deliveryDetails.email && (
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                Email
                                                            </p>
                                                            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                {order.deliveryDetails.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {order.deliveryDetails.scheduledAt && (
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                Scheduled
                                                            </p>
                                                            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                {formatDate(order.deliveryDetails.scheduledAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {order.deliveryDetails.address && (
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                Delivery Address
                                                            </p>
                                                            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                {order.deliveryDetails.address}
                                                                {order.deliveryDetails.city && order.deliveryDetails.state && order.deliveryDetails.zipCode && (
                                                                    <><br />{order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.zipCode}</>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {order.deliveryDetails.instructions && (
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                Special Instructions
                                                            </p>
                                                            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                                {order.deliveryDetails.instructions}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                                            <div className="text-4xl mb-3">📦</div>
                                            <h3
                                                className="text-lg font-bold text-[#101010] mb-2"
                                                style={{ fontFamily: 'Playfair Display, serif' }}
                                            >
                                                No Delivery Information Yet
                                            </h3>
                                            <p
                                                className="text-sm text-[#707072] mb-4"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                                Add your delivery or pickup details to complete your order
                                            </p>
                                            <button
                                                onClick={() => setShowDeliveryModal(true)}
                                                className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                                Add Delivery Information
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage