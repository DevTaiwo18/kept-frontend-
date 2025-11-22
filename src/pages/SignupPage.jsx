import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../utils/api'
import { saveAuth } from '../utils/auth'

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const roles = [
    {
      value: 'client',
      label: 'Client',
      icon: '🏠',
      description: 'I need help selling estate items',
      route: '/onboarding'
    },
    {
      value: 'buyer',
      label: 'Buyer',
      icon: '🛍️',
      description: 'I want to shop estate sales',
      route: '/browse'
    },
    {
      value: 'vendor',
      label: 'Vendor',
      icon: '🚚',
      description: 'I provide hauling or donation services',
      route: '/dashboard/vendor'
    }
  ]

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-600' }
    if (password.length < 10) return { strength: 2, label: 'Medium', color: 'text-yellow-600' }
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Strong', color: 'text-green-600' }
    }
    return { strength: 2, label: 'Medium', color: 'text-yellow-600' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      }

      const data = await register(payload)
      saveAuth(data.token, data.user)
      
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath)
      } else {
        const selectedRole = roles.find(r => r.value === formData.role)
        navigate(selectedRole?.route || '/')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        
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
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                        passwordStrength.strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold ${passwordStrength.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-3" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                I am a
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setFormData({...formData, role: role.value})}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.role === role.value
                        ? 'border-[#e6c35a] bg-[#e6c35a]/10'
                        : 'border-gray-200 hover:border-[#e6c35a]/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {role.label}
                    </div>
                    <div className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {role.description}
                    </div>
                  </button>
                ))}
              </div>
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