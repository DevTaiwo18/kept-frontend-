import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { createClientJob } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientNewProjectPage() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    contractSignor: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    contactEmail: auth?.user?.email || '',
    desiredCompletionDate: '',
    liquidation: true,
    donationClearout: true,
    cleaning: false,
    homeSale: false,
    homeRepair: false,
    notForSale: '',
    restrictedAreas: '',
    owner: '',
    inventory: '',
    property: ''
  })

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const handleServiceChange = (serviceKey, checked) => {
    if (serviceKey === 'allServices') {
      setFormData({
        ...formData,
        liquidation: checked,
        donationClearout: checked,
        cleaning: checked,
        homeSale: checked,
        homeRepair: checked
      })
    } else {
      setFormData({...formData, [serviceKey]: checked})
    }
  }

  const allServicesChecked = formData.liquidation && formData.donationClearout && 
    formData.cleaning && formData.homeSale && formData.homeRepair

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Prepend +1 to phone number for backend
      const phoneWithCountryCode = formData.contactPhone.startsWith('+1')
        ? formData.contactPhone
        : `+1${formData.contactPhone.replace(/^\+1/, '')}`

      // Combine address fields into single string for backend
      const propertyAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`

      const jobData = {
        contractSignor: formData.contractSignor,
        propertyAddress: propertyAddress,
        contactPhone: phoneWithCountryCode,
        contactEmail: formData.contactEmail,
        desiredCompletionDate: formData.desiredCompletionDate,
        services: {
          liquidation: formData.liquidation,
          donationClearout: formData.donationClearout,
          cleaning: formData.cleaning,
          homeSale: formData.homeSale,
          homeRepair: formData.homeRepair
        },
        specialRequests: {
          notForSale: formData.notForSale,
          restrictedAreas: formData.restrictedAreas
        },
        story: {
          owner: formData.owner,
          inventory: formData.inventory,
          property: formData.property
        }
      }

      const response = await createClientJob(jobData)
      navigate(`/client/project/${response.job._id}`)
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-[#707072] hover:text-[#101010] mb-4 flex items-center gap-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Start New Project
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Fill out the details below to begin your estate sale journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Contract Signor Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={formData.contractSignor}
                  onChange={(e) => setFormData({...formData, contractSignor: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Property Address *
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Street address (e.g., 123 Main St)"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="City"
                    />
                    <select
                      required
                      disabled={isLoading}
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 bg-white"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">State</option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CA">CA</option>
                      <option value="CO">CO</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="IA">IA</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WI">WI</option>
                      <option value="WY">WY</option>
                      <option value="DC">DC</option>
                    </select>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="Zip code"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Contact Phone *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 border border-r-0 border-[#707072]/30 rounded-l-lg bg-gray-100 text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      +1
                    </span>
                    <input
                      type="tel"
                      required
                      disabled={isLoading}
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-r-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="(513) 555-1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Desired Completion Date *
                </label>
                <input
                  type="date"
                  required
                  disabled={isLoading}
                  value={formData.desiredCompletionDate}
                  onChange={(e) => setFormData({...formData, desiredCompletionDate: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Services Desired
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  checked={allServicesChecked}
                  onChange={(e) => handleServiceChange('allServices', e.target.checked)}
                  className="w-5 h-5 text-[#e6c35a] border-[#707072]/30 rounded focus:ring-[#e6c35a]"
                />
                <span className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  All of the above
                </span>
              </label>
              {[
                { key: 'liquidation', label: 'Liquidation' },
                { key: 'donationClearout', label: 'Donation/Clearout' },
                { key: 'cleaning', label: 'Cleaning' },
                { key: 'homeSale', label: 'Home Sale' },
                { key: 'homeRepair', label: 'Home Repair' }
              ].map(service => (
                <label key={service.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    checked={formData[service.key]}
                    onChange={(e) => handleServiceChange(service.key, e.target.checked)}
                    className="w-5 h-5 text-[#e6c35a] border-[#707072]/30 rounded focus:ring-[#e6c35a]"
                  />
                  <span className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {service.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Special Requests
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Items Not for Sale
                </label>
                <textarea
                  rows="3"
                  disabled={isLoading}
                  value={formData.notForSale}
                  onChange={(e) => setFormData({...formData, notForSale: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Family photos, piano, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Restricted Areas
                </label>
                <textarea
                  rows="3"
                  disabled={isLoading}
                  value={formData.restrictedAreas}
                  onChange={(e) => setFormData({...formData, restrictedAreas: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Basement closet, attic, etc."
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Story
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  About the Owner
                </label>
                <textarea
                  rows="3"
                  disabled={isLoading}
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Tell us about the estate owner..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Inventory Overview
                </label>
                <textarea
                  rows="3"
                  disabled={isLoading}
                  value={formData.inventory}
                  onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Furniture, tools, kitchenware, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Property Details
                </label>
                <textarea
                  rows="3"
                  disabled={isLoading}
                  value={formData.property}
                  onChange={(e) => setFormData({...formData, property: e.target.value})}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="3-bedroom, garage, basement, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              disabled={isLoading}
              className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientNewProjectPage