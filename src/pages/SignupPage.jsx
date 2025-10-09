import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../utils/api'
import { saveAuth } from '../utils/auth'

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Client'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const getRoleRoute = (role) => {
    const routes = {
      Client: '/onboarding',
      Vendor: '/dashboard/vendor',
      Buyer: '/marketplace'
    }
    return routes[role] || '/'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase()
      }

      const data = await register(payload)
      saveAuth(data.token, data.user)
      navigate(getRoleRoute(formData.role))
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-[#101010] mb-3" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Create Your Account
          </h1>
          <p 
            className="text-sm text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start your estate sales journey with Kept House
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Full Name
              </label>
              <input 
                type="text"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email
              </label>
              <input 
                type="email"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <input 
                type="password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Create a strong password"
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Confirm Password
              </label>
              <input 
                type="password"
                required
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                I am a
              </label>
              <select 
                value={formData.role}
                disabled={isLoading}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all bg-white disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="Client">Client</option>
                <option value="Buyer">Buyer</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e6c35a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm text-[#707072]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-[#1c449e] hover:text-[#e6c35a] font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignupPage