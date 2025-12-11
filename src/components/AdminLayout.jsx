import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

function AdminLayout({ children }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const auth = getAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/agent' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Email Templates', path: '/admin/email-templates' },
    { name: 'CRM', path: '/admin/crm' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      {/* Header */}
      <header className="bg-[#101010] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - links to dashboard */}
            <Link to="/dashboard/agent" className="flex items-center">
              <img src={logo} alt="Kept House" className="h-10 w-auto" />
            </Link>

            {/* Right side - Profile dropdown with navigation */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 bg-[#e6c35a] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {auth?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {auth?.user?.name || 'Agent'}
                  </p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {auth?.user?.email || ''}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {auth?.user?.name || 'Agent'}
                    </p>
                    <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {auth?.user?.email || ''}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Agent
                    </span>
                  </div>

                  {/* Navigation links */}
                  <div className="py-2 border-b border-gray-100">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setProfileOpen(false)}
                        className={`block px-4 py-2 text-sm transition-all ${
                          isActive(item.path)
                            ? 'bg-[#e6c35a]/20 text-[#101010] font-semibold'
                            : 'text-[#707072] hover:bg-[#F8F5F0]'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
