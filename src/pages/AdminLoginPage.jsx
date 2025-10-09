import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/api'
import { saveAuth } from '../utils/auth'

function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await login({ email, password })
      
      if (data.user.role !== 'agent') {
        setError('Access denied. Admin credentials required.')
        setIsLoading(false)
        return
      }

      saveAuth(data.token, data.user)
      navigate('/dashboard/agent')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#F8F5F0]">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-[#101010] mb-3" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Admin Login
          </h1>
          <p 
            className="text-sm text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Access the Kept House admin dashboard
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
                Email
              </label>
              <input 
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="admin@keptestate.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Enter your password"
              />
            </div>

            <div className="text-right">
              <a 
                href="#" 
                className="text-sm text-[#1c449e] hover:text-[#e6c35a] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e6c35a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? 'Logging in...' : 'Log In as Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm text-[#707072]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Need an admin account?{' '}
              <Link 
                to="/admin/signup" 
                className="text-[#1c449e] hover:text-[#e6c35a] font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminLoginPage