import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobById, payClientJobDeposit, getDocuSignSigningUrl, checkDocuSignContractStatus } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientWaitingPage() {
  const { id } = useParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false)
  const [hasSignedConfirmation, setHasSignedConfirmation] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  useEffect(() => {
    loadProject()
  }, [id])

  useEffect(() => {
    if (!project || project.contractFileUrl || project.contractSignedByClient) {
      return
    }

    const contractPollInterval = setInterval(async () => {
      try {
        const data = await getClientJobById(id)
        if (data.job?.contractFileUrl) {
          setProject(data.job)
          clearInterval(contractPollInterval)
        }
      } catch (error) {
        console.error('Contract poll error:', error)
      }
    }, 10000)

    return () => clearInterval(contractPollInterval)
  }, [project, id])

  useEffect(() => {
    if (!project || !project.contractFileUrl || project.contractSignedByClient) {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkDocuSignContractStatus(id)
        if (result.signed) {
          clearInterval(pollInterval)
          setStatusMessage('✅ Contract signed!')
          await loadProject()
        }
      } catch (error) {
        console.error('Background check error:', error)
      }
    }, 30000)

    return () => clearInterval(pollInterval)
  }, [project, id])

  useEffect(() => {
    if (!autoCheckEnabled) return

    const aggressiveInterval = setInterval(async () => {
      try {
        const result = await checkDocuSignContractStatus(id)
        if (result.signed) {
          clearInterval(aggressiveInterval)
          setAutoCheckEnabled(false)
          setStatusMessage('✅ Contract signed!')
          await loadProject()
        }
      } catch (error) {
        console.error('Check error:', error)
      }
    }, 5000)

    const timeout = setTimeout(() => {
      clearInterval(aggressiveInterval)
      setAutoCheckEnabled(false)
    }, 600000)

    return () => {
      clearInterval(aggressiveInterval)
      clearTimeout(timeout)
    }
  }, [autoCheckEnabled, id])

  const loadProject = async () => {
    try {
      if (!project) {
        setIsLoading(true)
      }
      setError('')
      const data = await getClientJobById(id)
      setProject(data.job)
      
      if (data.job?.depositPaidAt) {
        navigate(`/client/project/${id}`)
        return
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details')
    } finally {
      if (!project) {
        setIsLoading(false)
      }
    }
  }

  const handleCheckContractStatus = async () => {
    setIsCheckingStatus(true)
    setStatusMessage('')
    
    try {
      const result = await checkDocuSignContractStatus(id)
      
      if (result.signed) {
        setStatusMessage('✅ Contract signed!')
        await loadProject()
      } else {
        setStatusMessage(`⏳ ${result.message || 'Contract not yet signed. Please complete signing via DocuSign first.'}`)
        setTimeout(() => setStatusMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setStatusMessage('❌ Failed to check status. Please try again.')
      setTimeout(() => setStatusMessage(''), 5000)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleSignWithDocuSign = async () => {
    try {
      setIsLoading(true)
      const response = await getDocuSignSigningUrl(id)
      
      if (response.signingUrl) {
        window.open(response.signingUrl, '_blank', 'width=1000,height=800')
        setAutoCheckEnabled(true)
      }
    } catch (error) {
      console.error('DocuSign Error:', error)
      setError('Failed to open signing page. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayDeposit = async () => {
    try {
      setIsProcessingPayment(true)
      setPaymentError('')
      const response = await payClientJobDeposit(id)

      if (response.url) {
        window.location.href = response.url
      }
    } catch (err) {
      setPaymentError(err.message || 'Failed to initiate payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleDownloadContract = () => {
    const link = document.createElement('a')
    link.href = project.contractFileUrl
    link.download = 'contract.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
              <button onClick={handleLogout} className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-sm font-medium hover:bg-gray-600 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>Logout</button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-base text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{error || 'Project not found'}</p>
            <button onClick={() => navigate('/onboarding')} className="mt-4 px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      {statusMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          statusMessage.includes('✅') ? 'bg-green-600' : 
          statusMessage.includes('⏳') ? 'bg-yellow-600' : 
          'bg-red-600'
        } text-white`} style={{ fontFamily: 'Inter, sans-serif' }}>
          {statusMessage}
        </div>
      )}

      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>{auth?.user?.name}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-sm font-medium hover:bg-gray-600 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/onboarding')} className="text-sm sm:text-base text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>&larr; Back to Dashboard</button>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Project Setup in Progress</h1>
            <p className="text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{project.propertyAddress}</p>
          </div>

          <div className="space-y-6">
            {project.contractFileUrl ? (
              <div className="p-6 bg-[#e6c35a]/10 border-l-4 border-[#e6c35a] rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#e6c35a] text-[#101010] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Contract Available</h3>
                    <p className="text-sm text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Your agent has uploaded the contract agreement. Please review and sign it digitally.</p>
                  </div>
                </div>
                
                {!project.contractSignedByClient ? (
                  <>
                    <div className="mb-4 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <iframe 
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(project.contractFileUrl)}&embedded=true`}
                        className="w-full h-[600px] border-0"
                        title="Contract Document"
                        style={{ minHeight: '600px' }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleDownloadContract}
                          className="flex-1 px-6 py-3 bg-white border-2 border-[#101010] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all text-center" 
                          style={{ fontFamily: 'Inter, sans-serif' }}>
                          Download Contract
                        </button>
                        <button 
                          onClick={handleSignWithDocuSign} 
                          className="flex-1 px-6 py-3 bg-[#e6c35a] text-[#101010] rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-center" 
                          style={{ fontFamily: 'Inter, sans-serif' }}>
                          Sign Contract Now
                        </button>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasSignedConfirmation}
                              onChange={(e) => setHasSignedConfirmation(e.target.checked)}
                              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                I have signed the contract via DocuSign
                              </p>
                              <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Check this box after you've completed signing through DocuSign (email or platform)
                              </p>
                            </div>
                          </label>
                        </div>

                        {hasSignedConfirmation && (
                          <button
                            onClick={handleCheckContractStatus}
                            disabled={isCheckingStatus}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {isCheckingStatus ? (
                              <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Verifying Signature...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Verify My Signature</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-500">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-base text-green-800 font-bold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contract Signed Successfully</p>
                      <p className="text-sm text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Signed on {new Date(project.contractSignedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Waiting for Contract</h3>
                    <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>Your agent will upload the contract agreement soon. You will receive an email notification when it is ready.</p>
                  </div>
                </div>
              </div>
            )}

            {project.contractSignedByClient && !project.serviceFee && (
              <div className="p-6 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#101010] text-[#F8F5F0] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Waiting for Agent to Request Payment</h3>
                    <p className="text-sm text-[#707072] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Your contract has been signed and sent to your agent. They are now reviewing it and will request the initial deposit payment shortly.</p>
                    <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-300">
                      <svg className="w-5 h-5 text-[#707072] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>What happens next?</p>
                        <ul className="text-xs text-[#707072] space-y-1 ml-4 list-disc" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <li>Your agent reviews the signed contract</li>
                          <li>They set the service fee and deposit amount</li>
                          <li>You will receive a payment request notification</li>
                          <li>Complete the payment to activate your project</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {project.serviceFee > 0 && project.contractSignedByClient ? (
              <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Payment Required</h3>
                    <p className="text-sm text-green-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Initial deposit of <strong>{formatCurrency(project.depositAmount)}</strong> required to activate your project.</p>
                  </div>
                </div>
                
                {project.scopeNotes && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Service Details</p>
                    <p className="text-sm text-green-800 whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>{project.scopeNotes}</p>
                  </div>
                )}

                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{paymentError}</p>
                  </div>
                )}

                <button onClick={handlePayDeposit} disabled={isProcessingPayment} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>{isProcessingPayment ? 'Processing...' : `Pay ${formatCurrency(project.depositAmount)} Now`}</button>
              </div>
            ) : project.serviceFee > 0 && !project.contractSignedByClient ? (
              <div className="p-6 bg-gray-50 border-l-4 border-gray-400 rounded-lg opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Payment</h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Please sign the contract first before proceeding with payment.</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Project Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#707072]">Property:</span><span className="font-semibold text-[#101010]">{project.propertyAddress}</span></div>
                <div className="flex justify-between"><span className="text-[#707072]">Status:</span><span className="font-semibold text-yellow-600 capitalize">{project.status.replace('_', ' ')}</span></div>
                {project.serviceFee > 0 && (
                  <>
                    <div className="flex justify-between pt-3 border-t border-gray-200"><span className="text-[#707072]">Service Fee:</span><span className="font-semibold text-[#101010]">{formatCurrency(project.serviceFee)}</span></div>
                    <div className="flex justify-between"><span className="text-[#707072]">Initial Deposit:</span><span className="font-semibold text-green-600">{formatCurrency(project.depositAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-[#707072]">Balance at Closing:</span><span className="font-semibold text-[#101010]">{formatCurrency(project.serviceFee - (project.depositAmount || 0))}</span></div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#e6c35a]/10 p-6 rounded-xl border-2 border-[#e6c35a]/30">
              <h3 className="text-base font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Need Help?</h3>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Questions about your project? Contact us at <a href="mailto:admin@keptestate.com" className="text-[#1c449e] font-semibold hover:underline">admin@keptestate.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientWaitingPage