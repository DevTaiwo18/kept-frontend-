import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAuth, clearAuth, onAuthUpdate } from '../utils/auth'
import { getCart, getCachedCart, onCartUpdate } from '../utils/cartApi'
import { getMarketplaceItems } from '../utils/marketplaceApi'
import logo from '../assets/Kept House _transparent logo .png'

function Header() {
  const [auth, setAuth] = useState(getAuth())
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [hasItems, setHasItems] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchCartCount = async () => {
    if (!auth) {
      setCartCount(0)
      return
    }

    try {
      const cached = getCachedCart()
      
      if (cached) {
        const count = cached.count || cached.cartItemCount || 0
        setCartCount(count)
      }
      
      const data = await getCart()
      const count = data.count || data.cartItemCount || 0
      setCartCount(count)
    } catch (error) {
      setCartCount(0)
    }
  }

  const checkMarketplaceItems = async () => {
    try {
      const response = await getMarketplaceItems({ limit: 1 })
      const items = response.items || []
      setHasItems(items.length > 0)
    } catch (error) {
      setHasItems(false)
    }
  }

  useEffect(() => {
    fetchCartCount()
    checkMarketplaceItems()

    const unsubscribeCart = onCartUpdate(() => {
      fetchCartCount()
    })
    
    const unsubscribeAuth = onAuthUpdate(() => {
      const newAuth = getAuth()
      setAuth(newAuth)
      fetchCartCount()
    })
    
    return () => {
      unsubscribeCart()
      unsubscribeAuth()
    }
  }, [auth])

  const handleLogout = () => {
    clearAuth()
    setCartCount(0)
    setMobileMenuOpen(false)
    navigate('/')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-[#101010] text-[#F8F5F0] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
            <img
              src={logo}
              alt="Kept House Estate Transitions"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Home
            </Link>
            {hasItems && (
              <Link
                to="/browse"
                className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Browse Items
              </Link>
            )}
            <Link
              to="/about"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              About
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Pricing
            </Link>
            <Link
              to="/faq"
              className="px-4 py-2 rounded-lg hover:bg-[#edd88c] hover:text-black transition-all text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              FAQ
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
              className="px-4 py-2 text-[#e6c35a] hover:text-[#edd88c] transition-colors text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              (513) 609-4731
            </a>
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {auth && (
              <Link
                to="/cart"
                className="relative p-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-xl">🛒</span>
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
                className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg font-medium hover:bg-gray-600 transition-all text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-[#707072] hover:bg-[#F8F5F0] hover:text-black transition-all text-sm font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all text-sm shadow-md"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center gap-2">
            {auth && (
              <Link
                to="/cart"
                className="relative p-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e6c35a] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#707072]/30 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#101010] border-t border-[#707072]/30">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Home
            </Link>
            {hasItems && (
              <Link
                to="/browse"
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Browse Items
              </Link>
            )}
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              About
            </Link>
            <Link
              to="/pricing"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Pricing
            </Link>
            <Link
              to="/faq"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact
            </Link>
            <a
              href="tel:+15136094731"
              className="block px-4 py-3 rounded-lg hover:bg-[#707072]/30 transition-colors text-base font-medium text-[#e6c35a]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📞 (513) 609-4731
            </a>

            {/* Divider */}
            <div className="border-t border-[#707072]/30 my-3"></div>

            {/* Auth Section */}
            {auth ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-[#707072] text-[#F8F5F0] rounded-lg font-medium hover:bg-gray-600 transition-all text-base text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg border border-[#707072] hover:bg-[#707072]/30 transition-colors text-base font-medium text-center"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all text-base text-center shadow-md"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header