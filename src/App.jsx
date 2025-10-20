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
import ShopperMarketplacePage from './pages/ShopperMarketplacePage'
import AgentDashboardPage from './pages/AgentDashboardPage'
import ClientProjectDetailPage from './pages/ClientProjectDetailPage'
import AgentJobDetailPage from './pages/AgentJobDetailPage'
import ClientItemGalleryPage from './pages/ClientItemGalleryPage'
import AgentItemGalleryPage from './pages/AgentItemGalleryPage'

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
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={['shopper', 'buyer']}>
              <ShopperMarketplacePage />
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
          path="/agent/job/:id"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentJobDetailPage />
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App