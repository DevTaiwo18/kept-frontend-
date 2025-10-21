import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAuth, clearAuth } from '../utils/auth'
import { getCart, onCartUpdate } from '../utils/cartApi'
import logo from '../assets/Kept House _transparent logo .png'

function Header() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    if (!auth) {
      setCartCount(0)
      return
    }

    try {
      const data = await getCart()
      setCartCount(data.count || 0)
    } catch (error) {
      setCartCount(0)
    }
  }

  useEffect(() => {
    fetchCartCount()

    const unsubscribe = onCartUpdate(fetchCartCount)
    
    return unsubscribe
  }, [auth])

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <header className="bg-[#101010] text-[#F8F5F0] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img 
              src={logo} 
              alt="Kept House Estate Sales" 
              className="h-14 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Home
            </Link>
            <Link 
              to="/browse"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse Items
            </Link>
            <Link 
              to="/about"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              About
            </Link>
            <Link 
              to="/contact"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact
            </Link>
            <a 
              href="tel:+15136094731"
              className="px-4 py-2 text-[#e6c35a] hover:text-[#edd88c] transition-colors text-sm font-medium flex items-center gap-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📞 (513) 609-4731
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {auth && (
              <Link
                to="/cart"
                className="relative px-3 py-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e6c35a] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            
            {auth ? (
              <button 
                onClick={handleLogout}
                className="px-5 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg font-medium hover:bg-gray-600 transition-all text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-[#707072] hover:bg-[#F8F5F0] hover:text-black transition-all text-sm font-medium hidden sm:block"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="px-5 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all text-sm shadow-md"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Create Profile
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden flex justify-center gap-4 pb-3 border-t border-[#707072]/20 pt-3">
          <Link to="/" className="text-xs hover:text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>Home</Link>
          <Link to="/browse" className="text-xs hover:text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>Browse</Link>
          <Link to="/about" className="text-xs hover:text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>About</Link>
          <Link to="/contact" className="text-xs hover:text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>Contact</Link>
          <a href="tel:+15136094731" className="text-xs text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>📞 Call</a>
        </div>
      </div>
    </header>
  )
}

export default Header