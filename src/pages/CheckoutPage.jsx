import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { getCart } from '../utils/cartApi'
import { getAuth } from '../utils/auth'
import { calculateCheckoutTotals, createCheckoutSession } from '../utils/checkoutApi'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutPage() {
  const navigate = useNavigate()
  const auth = getAuth()
  
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [deliveryType, setDeliveryType] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState(auth?.email || '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('OH')
  const [zipCode, setZipCode] = useState('')
  const [instructions, setInstructions] = useState('')
  
  const [totals, setTotals] = useState(null)
  const [calculatingTotals, setCalculatingTotals] = useState(false)
  const [pickupAddress, setPickupAddress] = useState(null)

  useEffect(() => {
    if (!auth) {
      navigate('/login')
      return
    }
    loadCart()
  }, [])

  useEffect(() => {
    if (!deliveryType) return
    
    const timer = setTimeout(() => {
      calculateTotals()
    }, 1000)
    return () => clearTimeout(timer)
  }, [deliveryType, address, city, state, zipCode])

  const loadCart = async () => {
    try {
      const data = await getCart()
      if (!data.items || data.items.length === 0) {
        navigate('/cart')
        return
      }
      setCartItems(data.items)
      
      const initialData = await calculateCheckoutTotals({
        deliveryType: 'pickup'
      })
      setPickupAddress(initialData.originAddress)
    } catch (err) {
      setError('Failed to load cart')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = async () => {
    if (deliveryType === 'shipping' && (!address || !city || !state || !zipCode)) {
      return
    }

    setCalculatingTotals(true)
    setError('')
    
    try {
      const data = await calculateCheckoutTotals({
        deliveryType,
        address: deliveryType === 'shipping' ? address : undefined,
        city: deliveryType === 'shipping' ? city : undefined,
        state: deliveryType === 'shipping' ? state : undefined,
        zipCode: deliveryType === 'shipping' ? zipCode : undefined
      })
      setTotals(data)
      setPickupAddress(data.originAddress)
    } catch (err) {
      console.error('Calculate totals error:', err)
      setError(err.message || 'Failed to calculate totals')
    } finally {
      setCalculatingTotals(false)
    }
  }

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length <= 10) {
      setPhoneNumber(formatPhoneNumber(value))
    }
  }

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!fullName || !phoneNumber) {
      setError('Please fill in all required fields')
      return
    }

    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid 10-digit US phone number')
      return
    }

    if (!deliveryType) {
      setError('Please select a delivery method')
      return
    }

    if (deliveryType === 'shipping' && (!address || !city || !state || !zipCode)) {
      setError('Please fill in shipping address')
      return
    }

    if (!totals) {
      setError('Please wait for totals to calculate')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const { sessionId, orderId } = await createCheckoutSession({
        deliveryType,
        fullName,
        phoneNumber,
        email,
        address: deliveryType === 'shipping' ? address : undefined,
        city: deliveryType === 'shipping' ? city : undefined,
        state: deliveryType === 'shipping' ? state : undefined,
        zipCode: deliveryType === 'shipping' ? zipCode : undefined,
        instructions
      })

      if (!sessionId) {
        setError('Checkout failed. Please try again.')
        setSubmitting(false)
        return
      }

      localStorage.setItem('kept_orderId', orderId || '')

      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      })

      if (stripeError) {
        setError(stripeError.message)
        setSubmitting(false)
      }
    } catch (err) {
      setError(err.message || 'Checkout failed')
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0)
  }

  const isFormValid = () => {
    if (!fullName || !phoneNumber || !deliveryType) return false
    if (!validatePhone(phoneNumber)) return false
    if (deliveryType === 'shipping' && (!address || !city || !state || !zipCode)) return false
    if (!totals) return false
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0] flex items-center justify-center">
        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading checkout...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8F5F0]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-[#101010] hover:text-[#e6c35a] transition-colors mb-8"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span>←</span>
          <span className="font-medium">Back to Cart</span>
        </button>

        <h1 className="text-4xl font-bold text-[#101010] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Checkout
        </h1>

        {pickupAddress && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📍</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Estate Sale Location
                </h3>
                <p className="text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  All items are located at:
                </p>
                <p className="text-lg font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {pickupAddress.address}<br />
                  {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zipCode}
                </p>
                <p className="text-sm text-[#707072] mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  💡 Choose pickup for free, or we can ship it to you for a fee
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Delivery Method
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    deliveryType === 'pickup' 
                      ? 'border-[#e6c35a] bg-[#e6c35a]/10' 
                      : 'border-gray-200 hover:border-[#e6c35a]/50'
                  }`}
                >
                  <div className="text-3xl mb-2">📦</div>
                  <h3 className="font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pickup
                  </h3>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pick up from estate sale location
                  </p>
                  <p className="text-sm font-semibold text-[#e6c35a] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    FREE
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('shipping')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    deliveryType === 'shipping' 
                      ? 'border-[#e6c35a] bg-[#e6c35a]/10' 
                      : 'border-gray-200 hover:border-[#e6c35a]/50'
                  }`}
                >
                  <div className="text-3xl mb-2">🚚</div>
                  <h3 className="font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Shipping
                  </h3>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    We'll ship it to you
                  </p>
                  <p className="text-sm font-semibold text-[#101010] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {deliveryType === 'shipping' && totals?.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : 'Enter address for rate'}
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone Number (US) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707072]">
                      +1
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      required
                      placeholder="(555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    10-digit US phone number
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {deliveryType === 'shipping' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required={deliveryType === 'shipping'}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required={deliveryType === 'shipping'}
                        placeholder="Columbus"
                        className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required={deliveryType === 'shipping'}
                        className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="OH">Ohio</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required={deliveryType === 'shipping'}
                        maxLength="5"
                        pattern="[0-9]{5}"
                        placeholder="43215"
                        className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Special Instructions
              </h2>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="3"
                placeholder="Any special delivery instructions?"
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </h2>

              {!deliveryType && (
                <p className="text-center text-[#707072] py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Please select a delivery method
                </p>
              )}

              {deliveryType && calculatingTotals && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6c35a]"></div>
                </div>
              )}

              {deliveryType && !calculatingTotals && totals && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  {totals.deliveryFee > 0 && (
                    <div className="flex justify-between text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span>Shipping</span>
                      <span>{formatPrice(totals.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>Tax (7.8%)</span>
                    <span>{formatPrice(totals.taxAmount)}</span>
                  </div>
                  <div className="border-t border-[#707072]/20 pt-3">
                    <div className="flex justify-between text-xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      <span>Total</span>
                      <span className="text-[#e6c35a]">{formatPrice(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {deliveryType === 'shipping' && !calculatingTotals && !totals && (
                <p className="text-center text-[#707072] py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enter shipping address to calculate total
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || calculatingTotals || !isFormValid()}
                className="w-full px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {submitting ? 'Processing...' : 'Continue to Payment'}
              </button>

              <p className="text-xs text-center text-[#707072] mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage