import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../utils/api'

function AdminForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setIsLoading(true)

        try {
            await forgotPassword({ email })
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.')
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
                        Admin Password Reset
                    </h1>
                    <p
                        className="text-sm text-[#707072]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Enter your admin email to receive a reset code
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

                    {success && (
                        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Reset code sent! Check your email and use the code to reset your password.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label
                                className="block text-sm font-semibold text-[#101010] mb-2"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Admin Email
                            </label>
                            <input
                                type="email"
                                required
                                disabled={isLoading || success}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 transition-all disabled:bg-gray-50"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                                placeholder="admin@keptestate.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full bg-[#e6c35a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>

                    {success && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/admin/reset-password"
                                className="text-[#1c449e] hover:text-[#e6c35a] font-semibold transition-colors"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Go to Reset Password →
                            </Link>
                        </div>
                    )}

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
                                Login
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminForgotPasswordPage