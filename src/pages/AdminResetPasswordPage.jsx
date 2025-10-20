import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../utils/api'

function AdminResetPasswordPage() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword({ token, newPassword })
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
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
            Reset Admin Password
          </h1>
          <p 
            className="text-sm text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Enter the code from your email
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
                Reset Code
              </label>
              <input 
                type="text"
                required
                disabled={isLoading}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Enter code from email"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-semibold text-[#101010] mb-2" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                New Password
              </label>
              <input 
                type="password"
                required
                disabled={isLoading}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Enter new password"
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Confirm new password"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e6c35a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm text-[#707072]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Remember your password?{' '}
              <Link 
                to="/admin" 
                className="text-[#1c449e] hover:text-[#e6c35a] font-semibold transition-colors"
              >
                Back to Admin Login
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminResetPasswordPage