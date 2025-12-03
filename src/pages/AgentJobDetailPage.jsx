import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobById, updateClientJobProgress, requestClientJobDeposit } from '../utils/clientJobsApi'
import { getJobItems, createItem, uploadItemPhotos } from '../utils/itemsApi'
import { getBidsForJob, acceptBid, rejectBid, getDonationReceipts, markBidAsPaid } from '../utils/vendorsApi'
import logo from '../assets/Kept House _transparent logo .png'

function AgentJobDetailPage() {
  const { id } = useParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [item, setItem] = useState(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositData, setDepositData] = useState({
    serviceFee: '',
    depositAmount: '500',
    scopeNotes: ''
  })
  const [depositError, setDepositError] = useState('')
  const [isRequestingDeposit, setIsRequestingDeposit] = useState(false)
  const [bids, setBids] = useState([])
  const [groupedBids, setGroupedBids] = useState({ donation: [], hauling: [], legacy: [] })
  const [isLoadingBids, setIsLoadingBids] = useState(false)
  const [bidActionLoading, setBidActionLoading] = useState(null)
  const [donationReceipts, setDonationReceipts] = useState([])
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', bidId: null, photoIndex: null })
  const [notificationModal, setNotificationModal] = useState({ show: false, type: '', title: '', message: '' })

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  useEffect(() => {
    loadJob()
    loadItems()
    loadBids()
    loadDonationReceipts()
  }, [id])

  const loadBids = async () => {
    try {
      setIsLoadingBids(true)
      const data = await getBidsForJob(id)
      setBids(data.bids || [])
      setGroupedBids(data.grouped || { donation: [], hauling: [], legacy: [] })
    } catch (err) {
      console.error('Error loading bids:', err)
    } finally {
      setIsLoadingBids(false)
    }
  }

  const loadDonationReceipts = async () => {
    try {
      const data = await getDonationReceipts(id)
      setDonationReceipts(data.receipts || [])
    } catch (err) {
      console.error('Error loading donation receipts:', err)
    }
  }

  const handleAcceptBid = async (bidId) => {
    setConfirmModal({ show: true, type: 'accept', bidId, photoIndex: null })
  }

  const confirmAcceptBid = async () => {
    const bidId = confirmModal.bidId
    setConfirmModal({ show: false, type: '', bidId: null, photoIndex: null })
    try {
      setBidActionLoading(bidId)
      await acceptBid(bidId)
      await loadBids()
    } catch (err) {
      console.error('Error accepting bid:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Failed to Accept',
        message: err.message || 'Failed to accept bid'
      })
    } finally {
      setBidActionLoading(null)
    }
  }

  const handleRejectBid = async (bidId) => {
    setConfirmModal({ show: true, type: 'reject', bidId, photoIndex: null })
  }

  const confirmRejectBid = async () => {
    const bidId = confirmModal.bidId
    setConfirmModal({ show: false, type: '', bidId: null, photoIndex: null })
    try {
      setBidActionLoading(bidId)
      await rejectBid(bidId)
      await loadBids()
    } catch (err) {
      console.error('Error rejecting bid:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Failed to Reject',
        message: err.message || 'Failed to reject bid'
      })
    } finally {
      setBidActionLoading(null)
    }
  }

  const handleMarkAsPaid = async (bidId, paidAmount) => {
    try {
      setBidActionLoading(bidId)
      await markBidAsPaid(bidId, paidAmount)
      setNotificationModal({
        show: true,
        type: 'success',
        title: 'Payment Recorded',
        message: 'Vendor payment has been recorded and added to the finance summary'
      })
      await loadBids()
      await loadJob() // Refresh job to get updated finance
    } catch (err) {
      console.error('Error marking bid as paid:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Failed to Record Payment',
        message: err.message || 'Failed to mark vendor as paid'
      })
    } finally {
      setBidActionLoading(null)
    }
  }

  const loadJob = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getClientJobById(id)
      setJob(data.job)
      setNewStatus(data.job.stage)
      if (data.job.serviceFee) {
        setDepositData({
          serviceFee: data.job.serviceFee.toString(),
          depositAmount: data.job.depositAmount ? data.job.depositAmount.toString() : '500',
          scopeNotes: data.job.scopeNotes || ''
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load job details')
    } finally {
      setIsLoading(false)
    }
  }

  const loadItems = async () => {
    try {
      setIsLoadingItems(true)
      const data = await getJobItems(id)
      const items = Array.isArray(data) ? data : data.items || []
      setItem(items.length > 0 ? items[0] : null)
    } catch (err) {
      console.error('Failed to load items:', err)
    } finally {
      setIsLoadingItems(false)
    }
  }

  const handleRequestDeposit = async () => {
    if (!depositData.serviceFee || parseFloat(depositData.serviceFee) <= 0) {
      setDepositError('Please enter a valid service fee')
      return
    }

    if (!depositData.depositAmount || (parseFloat(depositData.depositAmount) !== 250 && parseFloat(depositData.depositAmount) !== 500)) {
      setDepositError('Please select a deposit amount ($250 or $500)')
      return
    }

    if (parseFloat(depositData.depositAmount) > parseFloat(depositData.serviceFee)) {
      setDepositError('Deposit amount cannot exceed service fee')
      return
    }

    try {
      setIsRequestingDeposit(true)
      setDepositError('')
      await requestClientJobDeposit(id, {
        serviceFee: parseFloat(depositData.serviceFee),
        depositAmount: parseFloat(depositData.depositAmount),
        scopeNotes: depositData.scopeNotes
      })
      await loadJob()
      setShowDepositModal(false)
    } catch (err) {
      setDepositError(err.message || 'Failed to request deposit')
    } finally {
      setIsRequestingDeposit(false)
    }
  }

  const hasDraftItems = item && (item.status === 'draft' || item.status === 'needs_review')
  const hasApprovedItems = item && item.status === 'approved'
  const allItemsApproved = item && item.status === 'approved'

  // Check if job is in final stages (payout_processing or closing)
  const isInFinalStage = job?.stage === 'payout_processing' || job?.stage === 'closing'

  const handleCreateItem = async () => {
    setShowUploadModal(true)
    setUploadError('')
    setSelectedFiles([])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 10) {
      setUploadError('Maximum 10 photos can be uploaded at a time')
      setSelectedFiles(files.slice(0, 10))
    } else {
      setSelectedFiles(files)
      setUploadError('')
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one photo')
      return
    }

    try {
      setIsUploading(true)
      setUploadError('')

      let currentItem = item

      if (!currentItem) {
        currentItem = await createItem(id)
      }

      await uploadItemPhotos(currentItem._id, selectedFiles)

      await loadItems()
      setShowUploadModal(false)
      setSelectedFiles([])
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const stages = [
    { key: 'walkthrough', label: 'Walkthrough' },
    { key: 'staging', label: 'Staging/Prep' },
    { key: 'online_sale', label: 'Online Sale' },
    { key: 'estate_sale', label: 'Estate Sale' },
    { key: 'donations', label: 'Donations' },
    { key: 'hauling', label: 'Hauling' },
    { key: 'payout_processing', label: 'Payout Processing' },
    { key: 'closing', label: 'Closing' }
  ]

  const handleStatusUpdate = async () => {
    if (!statusNote.trim()) {
      setUpdateError('Please add a note about this status change')
      return
    }

    try {
      setIsUpdating(true)
      setUpdateError('')
      await updateClientJobProgress(id, newStatus, statusNote)
      await loadJob()
      setShowStatusModal(false)
      setStatusNote('')
      setUpdateError('')
    } catch (err) {
      console.error('Status update error:', err)
      setUpdateError(err.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStageIndex = (stage) => {
    return stages.findIndex(s => s.key === stage)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateKeptHouseCommission = (grossSales) => {
    let commission = 0

    if (grossSales <= 7500) {
      commission = grossSales * 0.50
    } else if (grossSales <= 20000) {
      commission = (7500 * 0.50) + ((grossSales - 7500) * 0.40)
    } else {
      commission = (7500 * 0.50) + (12500 * 0.40) + ((grossSales - 20000) * 0.30)
    }

    return Math.round(commission * 100) / 100
  }

  const calculateFinancials = () => {
    if (!job) return { gross: 0, serviceFee: 0, keptHouseCommission: 0, hauling: 0, depositPaid: 0, net: 0 }

    const gross = job.finance?.gross || 0
    const serviceFee = (job.serviceFee && job.serviceFee > 0) ? job.serviceFee : 0
    const hauling = job.finance?.haulingCost || 0
    const depositPaid = (job.depositAmount && job.depositAmount > 0 && job.depositPaidAt) ? job.depositAmount : 0

    const keptHouseCommission = calculateKeptHouseCommission(gross)
    const net = gross - serviceFee - keptHouseCommission - hauling + depositPaid

    return {
      gross,
      serviceFee,
      keptHouseCommission,
      hauling,
      depositPaid,
      net
    }
  }

  const getAllTransactions = () => {
    if (!job) return []

    const transactions = []

    if (job.finance?.daily && job.finance.daily.length > 0) {
      job.finance.daily.forEach(transaction => {
        transactions.push({
          ...transaction,
          type: 'sale'
        })
      })
    }

    if (job.depositAmount && job.depositAmount > 0 && job.depositPaidAt) {
      transactions.push({
        label: 'Initial Deposit Payment',
        amount: job.depositAmount,
        at: job.depositPaidAt,
        type: 'deposit'
      })
    }

    return transactions.sort((a, b) => new Date(b.at) - new Date(a.at))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Loading job details...
        </p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <img src={logo} alt="Kept House" className="h-12 w-auto" />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error || 'Job not found'}
            </p>
            <button
              onClick={() => navigate('/dashboard/agent')}
              className="mt-4 px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentStageIndex = getStageIndex(job.stage)
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100
  const financials = calculateFinancials()
  const allTransactions = getAllTransactions()

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name} (Agent)
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard/agent')}
          className="text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {job.contractSignor}
            </h1>
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {job.propertyAddress}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            {!job.welcomeEmailSentAt && (
              <button
                onClick={() => navigate('/admin/email-templates', { state: { job, templateKey: 'welcome' } })}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md text-sm whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                📧 Send Welcome Email
              </button>
            )}
            {job.welcomeEmailSentAt && job.contractSignedByClient && !job.serviceFee && (
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all shadow-md text-sm whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                💰 Request Deposit
              </button>
            )}
            {job.welcomeEmailSentAt && (
              <button
                onClick={() => navigate('/admin/email-templates', { state: { job } })}
                className="px-6 py-3 bg-white border-2 border-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#e6c35a] transition-all shadow-md whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Send Email
              </button>
            )}
            {job.stage !== 'closing' && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Update Status
              </button>
            )}
          </div>
        </div>

        {!job.welcomeEmailSentAt && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📧 Send Welcome Email First
                </h3>
                <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Click "Send Welcome Email" above to send a personalized welcome email with contract to the client
                </p>
              </div>
            </div>
          </div>
        )}

        {job.welcomeEmailSentAt && !job.contractFileUrl && (
          <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-purple-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📄 Contract Upload Needed
                </h3>
                <p className="text-sm text-purple-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Agent needs to upload the contract agreement via the email system
                </p>
              </div>
            </div>
          </div>
        )}

        {job.contractFileUrl && !job.contractSignedByClient && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ⏳ Awaiting Client Signature
                </h3>
                <p className="text-sm text-amber-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Waiting for client to review and sign the contract agreement
                </p>
              </div>
            </div>
          </div>
        )}

        {job.contractSignedByClient && !job.serviceFee && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-yellow-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  💰 Request Initial Deposit
                </h3>
                <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Set service fee and deposit amount to activate this project
                </p>
              </div>
            </div>
          </div>
        )}

        {job.serviceFee > 0 && !job.depositPaidAt && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-green-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ✓ Awaiting Client Payment
                </h3>
                <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Deposit of {formatCurrency(job.depositAmount)} requested. Waiting for client to complete payment.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Project Progress
          </h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stages[currentStageIndex]?.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#F8F5F0]">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#e6c35a] transition-all duration-500"
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
            {stages.map((stage, i) => (
              <div
                key={stage.key}
                className={`text-center p-2 rounded text-xs ${i <= currentStageIndex ? 'bg-[#e6c35a]/20 text-[#101010] font-semibold' : 'bg-gray-100 text-[#707072]'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {stage.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'overview'
                ? 'bg-[#e6c35a] text-black'
                : 'bg-white text-[#707072] hover:bg-gray-50'
                }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'inventory'
                ? 'bg-[#e6c35a] text-black'
                : 'bg-white text-[#707072] hover:bg-gray-50'
                }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Inventory ({item?.photoGroups?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'finance'
                ? 'bg-[#e6c35a] text-black'
                : 'bg-white text-[#707072] hover:bg-gray-50'
                }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Finance
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'bids'
                ? 'bg-[#e6c35a] text-black'
                : 'bg-white text-[#707072] hover:bg-gray-50'
                }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {bids.some(b => b.status === 'accepted') ? 'Bids' : `Bids (${bids.length})`}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Client Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Client Name</p>
                    <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {job.client?.name || job.contractSignor}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Phone</p>
                    <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {job.contactPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Email</p>
                    <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {job.contactEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Desired Completion</p>
                    <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatDate(job.desiredCompletionDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  {financials.gross > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Gross Sales</span>
                      <span className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatCurrency(financials.gross)}
                      </span>
                    </div>
                  )}
                  {financials.serviceFee > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Service Fee</span>
                      <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        -{formatCurrency(financials.serviceFee)}
                      </span>
                    </div>
                  )}
                  {financials.keptHouseCommission > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Kept House Commission</span>
                      <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        -{formatCurrency(financials.keptHouseCommission)}
                      </span>
                    </div>
                  )}
                  {financials.hauling > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Hauling Cost</span>
                      <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        -{formatCurrency(financials.hauling)}
                      </span>
                    </div>
                  )}
                  {financials.depositPaid > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Paid</span>
                      <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        +{formatCurrency(financials.depositPaid)}
                      </span>
                    </div>
                  )}
                  {(financials.gross > 0 || financials.serviceFee > 0 || financials.keptHouseCommission > 0 || financials.hauling > 0 || financials.depositPaid > 0) && (
                    <div className="flex justify-between items-center py-3 bg-[#e6c35a]/10 -mx-6 px-6 mt-2">
                      <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Net Payout</span>
                      <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatCurrency(financials.net)}
                      </span>
                    </div>
                  )}
                  {financials.gross === 0 && financials.serviceFee === 0 && financials.keptHouseCommission === 0 && financials.hauling === 0 && financials.depositPaid === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        No financial data available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {job.serviceFee > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contract Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Service Fee</span>
                    <span className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatCurrency(job.serviceFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Initial Deposit</span>
                    <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatCurrency(job.depositAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Balance Due at Closing</span>
                    <span className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatCurrency(job.serviceFee - (job.depositAmount || 0))}
                    </span>
                  </div>
                  {job.depositPaidAt && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Paid On</span>
                      <span className="text-sm font-semibold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatDate(job.depositPaidAt)}
                      </span>
                    </div>
                  )}
                  {job.scopeNotes && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Scope of Work
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.scopeNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Services Requested
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(job.services).map(([key, value]) =>
                  value && (
                    <span
                      key={key}
                      className="px-3 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-xs font-semibold"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  )
                )}
              </div>
            </div>

            {(job.specialRequests.notForSale || job.specialRequests.restrictedAreas) && (
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Special Requests
                </h3>
                <div className="space-y-4">
                  {job.specialRequests.notForSale && (
                    <div>
                      <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Items Not for Sale
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.specialRequests.notForSale}
                      </p>
                    </div>
                  )}
                  {job.specialRequests.restrictedAreas && (
                    <div>
                      <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Restricted Areas
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.specialRequests.restrictedAreas}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(job.story.owner || job.story.inventory || job.story.property) && (
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  The Story
                </h3>
                <div className="space-y-4">
                  {job.story.owner && (
                    <div>
                      <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        About the Owner
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.story.owner}
                      </p>
                    </div>
                  )}
                  {job.story.inventory && (
                    <div>
                      <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Inventory Overview
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.story.inventory}
                      </p>
                    </div>
                  )}
                  {job.story.property && (
                    <div>
                      <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Property Details
                      </p>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.story.property}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {job.stageNotes && job.stageNotes.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Status History & Notes
                </h3>
                <div className="space-y-3">
                  {job.stageNotes.slice().reverse().map((note, i) => (
                    <div key={i} className="p-4 bg-[#F8F5F0] rounded-lg border-l-4 border-[#e6c35a]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {stages.find(s => s.key === note.stage)?.label || note.stage}
                        </span>
                        <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDateTime(note.at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {note.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Inventory Items
                </h3>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage and approve estate items
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {item && item.photoGroups && item.photoGroups.length > 0 && (
                  <button
                    onClick={() => navigate(`/agent/item/${item._id}`)}
                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View All Items
                  </button>
                )}
                {!allItemsApproved && !isInFinalStage && (
                  <button
                    onClick={handleCreateItem}
                    className="w-full sm:w-auto px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    + Add New Item
                  </button>
                )}
              </div>
            </div>

            {(!item || !item.photoGroups || item.photoGroups.length === 0) && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📸 <strong>Getting Started:</strong> Upload items on behalf of the client or have them add photos directly. Once all items are uploaded, run AI analysis to generate listings.
                </p>
              </div>
            )}

            {hasDraftItems && !hasApprovedItems && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ⚠️ Ready for Review
                </p>
                <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Tip:</strong> More photos per item = better AI results. When all items are uploaded, click "View All Items" to run AI analysis and approve.
                </p>
              </div>
            )}

            {hasApprovedItems && hasDraftItems && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📋 <strong>Mixed Status:</strong> Some items are approved while others need review. Complete reviewing all draft items.
                </p>
              </div>
            )}

            {allItemsApproved && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ✓ All Items Approved! You can now proceed to update the project status accordingly.
                </p>
              </div>
            )}

            {isLoadingItems ? (
              <div className="text-center py-8">
                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading items...</p>
              </div>
            ) : !item || !item.photoGroups || item.photoGroups.length === 0 ? (
              <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  No items added yet
                </p>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Upload items or have the client add them to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 rounded-lg overflow-hidden transition-all bg-white hover:border-[#e6c35a] border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/agent/item/${item._id}`)}>
                  <div className="p-4">
                    {item.status !== 'approved' && item.photoGroups && item.photoGroups.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {item.photoGroups.slice(0, 3).map((group, idx) => {
                          const firstPhoto = item.photos[group.startIndex]
                          return (
                            <div key={idx} className="relative h-32 overflow-hidden rounded-lg">
                              {firstPhoto && (
                                <>
                                  <img
                                    src={firstPhoto}
                                    alt={group.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {group.title}
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.photoGroups?.length || 0} item(s) • {item.photos?.length || 0} photo(s) • {item.approvedItems?.length || 0} items approved
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3 ${item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'needs_review' ? 'bg-orange-100 text-orange-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                          }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {item.status === 'draft' ? 'Draft' :
                          item.status === 'needs_review' ? 'Needs Review' :
                            item.status === 'approved' ? 'Approved' :
                              item.status}
                      </span>
                    </div>

                    {item.status === 'draft' && !item.ai && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          💡 <strong>Before AI:</strong> More photos per item = better results. Click to review items and run AI analysis.
                        </p>
                      </div>
                    )}

                    {item.status === 'needs_review' && (
                      <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                        <p className="text-xs text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          🔄 <strong>Reopened:</strong> This item was reopened for additional edits or photos.
                        </p>
                      </div>
                    )}

                    {item.ai && item.ai.length > 0 && item.status !== 'approved' && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          ⚠️ <strong>After AI, before Approve:</strong> Click to review AI details, edit anything, then approve.
                        </p>
                      </div>
                    )}
                  </div>

                  {item.status === 'approved' && item.approvedItems && item.approvedItems.length > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-200 pt-4 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {item.approvedItems.slice(0, 8).map((approvedItem, idx) => {
                          const photoIndices = approvedItem.photoIndices || [approvedItem.photoIndex]
                          const firstPhotoIndex = photoIndices[0]
                          return (
                            <div key={idx} className="relative group">
                              <img
                                src={item.photos[firstPhotoIndex]}
                                alt={approvedItem.title || `Item ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg p-2 flex flex-col justify-end">
                                <p className="text-white text-xs font-bold line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {approvedItem.title || 'Untitled'}
                                </p>
                                <p className="text-white text-xs font-semibold mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  ${approvedItem.price || '0'}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {item.approvedItems.length > 8 && (
                        <p className="text-xs text-[#707072] mt-3 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                          +{item.approvedItems.length - 8} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Gross Sales
                </p>
                <p className="text-2xl font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.gross)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Service Fee
                </p>
                <p className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.serviceFee)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Kept House Commission
                </p>
                <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.keptHouseCommission)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#e6c35a] to-[#d4b14a] p-6 rounded-xl shadow-md">
                <p className="text-xs font-semibold text-black/70 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Net Payout
                </p>
                <p className="text-2xl font-bold text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.net)}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Recent Transactions
              </h3>

              {allTransactions.length > 0 ? (
                <div className="space-y-3">
                  {allTransactions.map((transaction, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-[#F8F5F0] rounded-lg hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount < 0 ? 'bg-red-100' : transaction.type === 'deposit' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                          <svg className={`w-5 h-5 ${transaction.amount < 0 ? 'text-red-600' : transaction.type === 'deposit' ? 'text-blue-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {transaction.label || `Transaction ${i + 1}`}
                            </p>
                            {transaction.type === 'deposit' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Deposit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatDateTime(transaction.at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${transaction.amount < 0 ? 'text-red-600' : transaction.type === 'deposit' ? 'text-blue-600' : 'text-green-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
                  <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No transactions yet
                  </p>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Transactions will appear here as sales are completed
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'bids' && (
          <div className="space-y-6">
            {isLoadingBids ? (
              <div className="bg-white p-6 rounded-xl shadow-md text-center py-12">
                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading bids...</p>
              </div>
            ) : (
              <>
                {/* Donation Vendor Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Donation Vendor
                      </h3>
                      <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Vendor assigned to handle item donations
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const donationBid = groupedBids.donation.find(b => b.status === 'accepted')
                    const pendingDonationBids = groupedBids.donation.filter(b => b.status === 'submitted')

                    if (donationBid) {
                      return (
                        <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
                          {/* Vendor Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {donationBid.vendor?.companyName || donationBid.vendor?.name || 'Unknown Vendor'}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-200 text-purple-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Assigned
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Agreed Amount</p>
                              <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(donationBid.amount)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Timeline</p>
                              <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {donationBid.timelineDays > 0 ? `${donationBid.timelineDays} days` : 'TBD'}
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Contact Information
                            </p>
                            {donationBid.vendor?.phone && (
                              <p className="text-sm text-[#101010] flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <svg className="w-4 h-4 text-[#707072]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${donationBid.vendor.phone}`} className="text-[#e6c35a] hover:underline">
                                  {donationBid.vendor.phone}
                                </a>
                              </p>
                            )}
                            {donationBid.vendor?.email && (
                              <p className="text-sm text-[#101010] flex items-center gap-2 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <svg className="w-4 h-4 text-[#707072]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${donationBid.vendor.email}`} className="text-[#e6c35a] hover:underline">
                                  {donationBid.vendor.email}
                                </a>
                              </p>
                            )}
                          </div>

                          {/* Payment Details */}
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Payment Details
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              donationBid.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                              donationBid.paymentMethod === 'cashapp' ? 'bg-purple-100 text-purple-800' :
                              donationBid.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                              {donationBid.paymentMethod === 'cash' ? 'Cash' :
                               donationBid.paymentMethod === 'cashapp' ? 'Cash App' :
                               donationBid.paymentMethod === 'bank' ? 'Bank Transfer' :
                               'Not specified'}
                            </span>
                          </div>

                          {/* Payment Status */}
                          <div className="border-t border-purple-200 pt-4">
                            {donationBid.isPaid ? (
                              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-semibold text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Paid: {formatCurrency(donationBid.paidAmount || donationBid.amount)}
                                  </p>
                                  {donationBid.paidAt && (
                                    <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      on {formatDate(donationBid.paidAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Payment pending
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleMarkAsPaid(donationBid._id, donationBid.amount)}
                                  disabled={bidActionLoading === donationBid._id}
                                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                  {bidActionLoading === donationBid._id ? 'Processing...' : `Mark as Paid (${formatCurrency(donationBid.amount)})`}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Receipt */}
                          {donationBid.receipt?.url && (
                            <div className="mt-4 pt-4 border-t border-purple-200">
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      Receipt Uploaded
                                    </p>
                                    {donationBid.receipt.uploadedAt && (
                                      <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {formatDate(donationBid.receipt.uploadedAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={donationBid.receipt.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                >
                                  View PDF
                                </a>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-[#707072] mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Bid accepted on: {formatDate(donationBid.updatedAt || donationBid.createdAt)}
                          </p>
                        </div>
                      )
                    } else if (pendingDonationBids.length > 0) {
                      return (
                        <div className="space-y-3">
                          {pendingDonationBids.map(bid => (
                            <div key={bid._id} className="p-4 rounded-lg bg-[#F8F5F0] border-l-4 border-purple-400">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {bid.vendor?.companyName || bid.vendor?.name || 'Unknown Vendor'}
                                  </h4>
                                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Bid: {formatCurrency(bid.amount)} • {bid.timelineDays > 0 ? `${bid.timelineDays} days` : 'TBD'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptBid(bid._id)}
                                    disabled={bidActionLoading === bid._id}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectBid(bid._id)}
                                    disabled={bidActionLoading === bid._id}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8 bg-[#F8F5F0] rounded-lg">
                          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            No donation vendor assigned yet
                          </p>
                        </div>
                      )
                    }
                  })()}
                </div>

                {/* Hauling Vendor Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Hauling Vendor
                      </h3>
                      <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Vendor assigned to handle item removal
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const haulingBid = groupedBids.hauling.find(b => b.status === 'accepted')
                    const pendingHaulingBids = groupedBids.hauling.filter(b => b.status === 'submitted')

                    if (haulingBid) {
                      return (
                        <div className="p-4 rounded-lg border-2 border-orange-300 bg-orange-50">
                          {/* Vendor Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {haulingBid.vendor?.companyName || haulingBid.vendor?.name || 'Unknown Vendor'}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-200 text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Assigned
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Agreed Amount</p>
                              <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(haulingBid.amount)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Timeline</p>
                              <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {haulingBid.timelineDays > 0 ? `${haulingBid.timelineDays} days` : 'TBD'}
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Contact Information
                            </p>
                            {haulingBid.vendor?.phone && (
                              <p className="text-sm text-[#101010] flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <svg className="w-4 h-4 text-[#707072]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${haulingBid.vendor.phone}`} className="text-[#e6c35a] hover:underline">
                                  {haulingBid.vendor.phone}
                                </a>
                              </p>
                            )}
                            {haulingBid.vendor?.email && (
                              <p className="text-sm text-[#101010] flex items-center gap-2 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <svg className="w-4 h-4 text-[#707072]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${haulingBid.vendor.email}`} className="text-[#e6c35a] hover:underline">
                                  {haulingBid.vendor.email}
                                </a>
                              </p>
                            )}
                          </div>

                          {/* Payment Details */}
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Payment Details
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              haulingBid.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                              haulingBid.paymentMethod === 'cashapp' ? 'bg-purple-100 text-purple-800' :
                              haulingBid.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                              {haulingBid.paymentMethod === 'cash' ? 'Cash' :
                               haulingBid.paymentMethod === 'cashapp' ? 'Cash App' :
                               haulingBid.paymentMethod === 'bank' ? 'Bank Transfer' :
                               'Not specified'}
                            </span>
                          </div>

                          {/* Payment Status */}
                          <div className="border-t border-orange-200 pt-4">
                            {haulingBid.isPaid ? (
                              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-semibold text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Paid: {formatCurrency(haulingBid.paidAmount || haulingBid.amount)}
                                  </p>
                                  {haulingBid.paidAt && (
                                    <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      on {formatDate(haulingBid.paidAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Payment pending
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleMarkAsPaid(haulingBid._id, haulingBid.amount)}
                                  disabled={bidActionLoading === haulingBid._id}
                                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                  {bidActionLoading === haulingBid._id ? 'Processing...' : `Mark as Paid (${formatCurrency(haulingBid.amount)})`}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Receipt */}
                          {haulingBid.receipt?.url && (
                            <div className="mt-4 pt-4 border-t border-orange-200">
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      Receipt Uploaded
                                    </p>
                                    {haulingBid.receipt.uploadedAt && (
                                      <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {formatDate(haulingBid.receipt.uploadedAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={haulingBid.receipt.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                >
                                  View PDF
                                </a>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-[#707072] mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Bid accepted on: {formatDate(haulingBid.updatedAt || haulingBid.createdAt)}
                          </p>
                        </div>
                      )
                    } else if (pendingHaulingBids.length > 0) {
                      return (
                        <div className="space-y-3">
                          {pendingHaulingBids.map(bid => (
                            <div key={bid._id} className="p-4 rounded-lg bg-[#F8F5F0] border-l-4 border-orange-400">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {bid.vendor?.companyName || bid.vendor?.name || 'Unknown Vendor'}
                                  </h4>
                                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Bid: {formatCurrency(bid.amount)} • {bid.timelineDays > 0 ? `${bid.timelineDays} days` : 'TBD'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptBid(bid._id)}
                                    disabled={bidActionLoading === bid._id}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectBid(bid._id)}
                                    disabled={bidActionLoading === bid._id}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8 bg-[#F8F5F0] rounded-lg">
                          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            No hauling vendor assigned yet
                          </p>
                        </div>
                      )
                    }
                  })()}
                </div>

                {/* Assigned Vendors Section - for legacy bids without bidType */}
                {groupedBids.legacy.filter(b => b.status === 'accepted').length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Assigned Vendor
                    </h3>
                    {groupedBids.legacy.filter(b => b.status === 'accepted').map(bid => (
                      <div key={bid._id} className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {bid.vendor?.companyName || bid.vendor?.name || 'Unknown Vendor'}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-200 text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Assigned
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Agreed Amount</p>
                            <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {formatCurrency(bid.amount)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-[#707072] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Timeline</p>
                            <p className="font-bold text-[#101010] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {bid.timelineDays > 0 ? `${bid.timelineDays} days` : 'TBD'}
                            </p>
                          </div>
                        </div>
                        {bid.isPaid ? (
                          <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-semibold text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Paid: {formatCurrency(bid.paidAmount || bid.amount)}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkAsPaid(bid._id, bid.amount)}
                            disabled={bidActionLoading === bid._id}
                            className="w-full px-4 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all disabled:opacity-50"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {bidActionLoading === bid._id ? 'Processing...' : `Mark as Paid (${formatCurrency(bid.amount)})`}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Request Initial Deposit
              </h3>

              {depositError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {depositError}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Service Fee *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>$</span>
                  <input
                    type="number"
                    value={depositData.serviceFee}
                    onChange={(e) => setDepositData({ ...depositData, serviceFee: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="mt-1 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Kept House service fee for this project
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Initial Deposit Amount *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositData({ ...depositData, depositAmount: '250' })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${depositData.depositAmount === '250'
                      ? 'bg-[#e6c35a] text-black border-2 border-[#e6c35a]'
                      : 'bg-white text-[#707072] border-2 border-gray-300 hover:border-[#e6c35a]'
                      }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    $250
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositData({ ...depositData, depositAmount: '500' })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${depositData.depositAmount === '500'
                      ? 'bg-[#e6c35a] text-black border-2 border-[#e6c35a]'
                      : 'bg-white text-[#707072] border-2 border-gray-300 hover:border-[#e6c35a]'
                      }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    $500
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Standard initial deposit to activate the project
                </p>
              </div>

              {depositData.serviceFee && parseFloat(depositData.serviceFee) > 0 && depositData.depositAmount && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Deposit: ${parseFloat(depositData.depositAmount).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Balance due at closing: ${(parseFloat(depositData.serviceFee) - parseFloat(depositData.depositAmount)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Scope of Work & Contract Notes
                </label>
                <textarea
                  value={depositData.scopeNotes}
                  onChange={(e) => setDepositData({ ...depositData, scopeNotes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Document the scope of work, special agreements, contract terms, services included, timeline expectations, etc."
                />
                <p className="mt-1 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Track all contract details and service agreements here
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false)
                    setDepositError('')
                  }}
                  disabled={isRequestingDeposit}
                  className="w-full px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeposit}
                  disabled={isRequestingDeposit}
                  className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isRequestingDeposit ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Update Project Status
              </h3>

              {updateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {updateError}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {stages.map(stage => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Add Note *
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Describe what was done or next steps..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setStatusNote('')
                    setNewStatus(job.stage)
                    setUpdateError('')
                  }}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Add New Item
              </h3>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {uploadError}
                  </p>
                </div>
              )}

              {isUploading ? (
                <div className="py-12 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 border-4 border-[#F8F5F0] border-t-[#e6c35a] rounded-full animate-spin"></div>
                  </div>
                  <p className="text-lg font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Uploading photos...
                  </p>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Please wait while we upload your {selectedFiles.length} photo(s)
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                      💡 <strong>Agent Upload:</strong> You're uploading on behalf of the client. For best marketplace results, we recommend at least 4 clear photos per item showing different angles.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Select Photos for This Item
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    {selectedFiles.length > 0 && (
                      <p className="text-sm mt-2 text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {selectedFiles.length} photo(s) selected
                      </p>
                    )}
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Preview:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from(selectedFiles).slice(0, 6).map((file, i) => (
                          <img
                            key={i}
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                      {selectedFiles.length > 6 && (
                        <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          +{selectedFiles.length - 6} more
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setSelectedFiles([])
                        setUploadError('')
                      }}
                      className="w-full px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={selectedFiles.length === 0}
                      className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Upload Item
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                confirmModal.type === 'accept' ? 'bg-green-100' :
                confirmModal.type === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                {confirmModal.type === 'accept' ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : confirmModal.type === 'reject' ? (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {confirmModal.type === 'accept' ? 'Accept This Bid?' :
                 confirmModal.type === 'reject' ? 'Reject This Bid?' : 'Delete This Photo?'}
              </h3>
              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {confirmModal.type === 'accept' ? 'All other bids will be automatically rejected.' :
                 confirmModal.type === 'reject' ? 'This action cannot be undone.' : 'This photo will be permanently removed.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, type: '', bidId: null, photoIndex: null })}
                className="flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'accept') confirmAcceptBid()
                  else if (confirmModal.type === 'reject') confirmRejectBid()
                  else if (confirmModal.type === 'deletePhoto') confirmDeletePhoto()
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  confirmModal.type === 'accept' ? 'bg-green-600 text-white hover:bg-green-700' :
                  confirmModal.type === 'reject' ? 'bg-red-600 text-white hover:bg-red-700' :
                  'bg-red-600 text-white hover:bg-red-700'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {confirmModal.type === 'accept' ? 'Yes, Accept' :
                 confirmModal.type === 'reject' ? 'Yes, Reject' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                notificationModal.type === 'error' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {notificationModal.type === 'error' ? (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {notificationModal.title}
              </h3>
              <p className="text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                {notificationModal.message}
              </p>
              <button
                onClick={() => setNotificationModal({ show: false, type: '', title: '', message: '' })}
                className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
                  notificationModal.type === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-[#e6c35a] text-black hover:bg-[#edd88c]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentJobDetailPage