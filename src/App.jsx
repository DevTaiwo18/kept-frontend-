import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSignupPage from './pages/AdminSignupPage'
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage'
import AdminResetPasswordPage from './pages/AdminResetPasswordPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NotFoundPage from './pages/NotFoundPage'
import ClientOnboardingPage from './pages/ClientOnboardingPage'
import ClientNewProjectPage from './pages/ClientNewProjectPage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import AgentDashboardPage from './pages/AgentDashboardPage'
import ClientProjectDetailPage from './pages/ClientProjectDetailPage'
import AgentJobDetailPage from './pages/AgentJobDetailPage'
import ClientItemGalleryPage from './pages/ClientItemGalleryPage'
import AgentItemGalleryPage from './pages/AgentItemGalleryPage'
import MarketplacePage from './pages/MarketplacePage'
import MarketplaceItemDetailPage from './pages/MarketplaceItemDetailPage'
import CartPage from './pages/CartPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import EmailTemplatesPage from './pages/EmailTemplatesPage'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientOnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/new-project"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientNewProjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/project/:id"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/item/:id"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientItemGalleryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/agent"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/email-templates"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <EmailTemplatesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/job/:id"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentJobDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/item/:id"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentItemGalleryPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <LandingPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/about" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <AboutPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/contact" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <ContactPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/login" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <LoginPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/signup" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <SignupPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/browse" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <MarketplacePage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/browse/item/:id" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <MarketplaceItemDetailPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/cart" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <CartPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/checkout" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <CheckoutPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/forgot-password" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <ForgotPasswordPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/reset-password" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <ResetPasswordPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/orders" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <OrdersPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/order/:id" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <OrderDetailPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/order-success" element={
          <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
            <Header />
            <main className="flex-grow">
              <OrderSuccessPage />
            </main>
            <Footer />
          </div>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App