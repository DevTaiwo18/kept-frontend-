import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import { getVendorBids, submitBid, uploadVendorReceipt, getOpportunities, getJobVideos, getVendorJobItems, markItemsDonated, markItemsHauled, completeDonationWork, completeHaulingWork } from '../utils/vendorsApi'
import logo from '../assets/Kept House _transparent logo .png'

function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [opportunities, setOpportunities] = useState([])
  const [myBids, setMyBids] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [bidData, setBidData] = useState({
    amount: '',
    timelineDays: '',
    paymentMethod: '',
    cashAppHandle: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedJobForReceipt, setSelectedJobForReceipt] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [jobVideos, setJobVideos] = useState({})
  const [opportunityItems, setOpportunityItems] = useState({})
  const [loadingVideosFor, setLoadingVideosFor] = useState(null)
  const [bidSubmitSuccess, setBidSubmitSuccess] = useState(false)
  const [notificationModal, setNotificationModal] = useState({ show: false, type: '', message: '', title: '' })
  const [receiptUploadSuccess, setReceiptUploadSuccess] = useState(false)
  const [expandedBidId, setExpandedBidId] = useState(null)
  const [jobItems, setJobItems] = useState({})
  const [loadingItemsFor, setLoadingItemsFor] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [isMarkingItems, setIsMarkingItems] = useState(false)
  const [isCompletingWork, setIsCompletingWork] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, bid: null })

  const auth = getAuth()
  const navigate = useNavigate()
  // vendorProfile can be either an ID string or an object with _id
  const vendorId = typeof auth?.user?.vendorProfile === 'string'
    ? auth?.user?.vendorProfile
    : auth?.user?.vendorProfile?._id || auth?.user?.vendorId

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  useEffect(() => {
    if (vendorId) {
      loadData()
    }
  }, [vendorId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Load vendor's bids and opportunities in parallel
      const [bidsData, opportunitiesData] = await Promise.all([
        getVendorBids(vendorId),
        getOpportunities(vendorId)
      ])

      setMyBids(bidsData.bids || [])
      setOpportunities(opportunitiesData.opportunities || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenBidModal = (job) => {
    setSelectedJob(job)
    setBidData({
      amount: '',
      timelineDays: '',
      paymentMethod: '',
      cashAppHandle: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: ''
      }
    })
    setShowBidModal(true)
  }

  const handleSubmitBid = async () => {
    if (!bidData.amount || parseFloat(bidData.amount) <= 0) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid bid amount'
      })
      return
    }

    if (!bidData.paymentMethod) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Payment Method Required',
        message: 'Please select how you want to be paid'
      })
      return
    }

    // Validate payment details based on method
    if (bidData.paymentMethod === 'cashapp' && !bidData.cashAppHandle) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Cash App Handle Required',
        message: 'Please enter your Cash App handle'
      })
      return
    }

    if (bidData.paymentMethod === 'bank') {
      const { bankName, accountNumber, routingNumber, accountHolderName } = bidData.bankDetails
      if (!bankName || !accountNumber || !routingNumber || !accountHolderName) {
        setNotificationModal({
          show: true,
          type: 'error',
          title: 'Bank Details Required',
          message: 'Please fill in all bank details'
        })
        return
      }
    }

    try {
      setIsSubmitting(true)

      // Build payload
      const payload = {
        job: selectedJob._id,
        vendorId: vendorId,
        amount: parseFloat(bidData.amount),
        timelineDays: parseInt(bidData.timelineDays) || 0,
        paymentMethod: bidData.paymentMethod
      }

      // Add payment details based on method
      if (bidData.paymentMethod === 'cashapp') {
        payload.cashAppHandle = bidData.cashAppHandle
      } else if (bidData.paymentMethod === 'bank') {
        payload.bankDetails = bidData.bankDetails
      }

      await submitBid(payload)

      // Show success state briefly
      setBidSubmitSuccess(true)

      // Wait a moment to show success, then transition
      setTimeout(async () => {
        setShowBidModal(false)
        setSelectedJob(null)
        setBidData({
          amount: '',
          timelineDays: '',
          paymentMethod: '',
          cashAppHandle: '',
          bankDetails: {
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            accountHolderName: ''
          }
        })
        setBidSubmitSuccess(false)
        await loadData()
        // Automatically switch to My Bids tab
        setActiveTab('my bids')
      }, 1500)
    } catch (err) {
      console.error('Error submitting bid:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Failed to submit bid'
      })
      setIsSubmitting(false)
    }
  }

  const handleOpenReceiptModal = (job) => {
    setSelectedJobForReceipt(job)
    setReceiptFile(null)
    setShowReceiptModal(true)
  }

  const handleToggleVideos = async (jobId) => {
    // If already expanded, collapse it
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }

    // Expand and load videos + items if not already loaded
    setExpandedJobId(jobId)

    if (!jobVideos[jobId]) {
      setLoadingVideosFor(jobId)
      try {
        const response = await getJobVideos(jobId)
        setJobVideos(prev => ({ ...prev, [jobId]: response.videos || [] }))
        setOpportunityItems(prev => ({ ...prev, [jobId]: { items: response.items || [], summary: response.itemSummary || {} } }))
      } catch (err) {
        console.error('Error loading videos:', err)
        setJobVideos(prev => ({ ...prev, [jobId]: [] }))
        setOpportunityItems(prev => ({ ...prev, [jobId]: { items: [], summary: {} } }))
      } finally {
        setLoadingVideosFor(null)
      }
    }
  }

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'No File Selected',
        message: 'Please select a PDF file'
      })
      return
    }

    try {
      setIsUploadingReceipt(true)
      await uploadVendorReceipt(selectedJobForReceipt._id, receiptFile)

      // Show success state
      setReceiptUploadSuccess(true)

      // Wait a moment then close
      setTimeout(async () => {
        setShowReceiptModal(false)
        setSelectedJobForReceipt(null)
        setReceiptFile(null)
        setReceiptUploadSuccess(false)
        setIsUploadingReceipt(false)
        await loadData()
      }, 1500)
    } catch (err) {
      console.error('Error uploading receipt:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload receipt'
      })
      setIsUploadingReceipt(false)
    }
  }

  const handleToggleItems = async (bid) => {
    const jobId = bid.job?._id
    if (!jobId) return

    // If already expanded, collapse it
    if (expandedBidId === bid._id) {
      setExpandedBidId(null)
      setSelectedItems([])
      return
    }

    // Expand and load items if not already loaded
    setExpandedBidId(bid._id)
    setSelectedItems([])

    if (!jobItems[jobId]) {
      setLoadingItemsFor(jobId)
      try {
        const response = await getVendorJobItems(jobId)
        setJobItems(prev => ({ ...prev, [jobId]: response }))
      } catch (err) {
        console.error('Error loading items:', err)
        setJobItems(prev => ({ ...prev, [jobId]: { items: [], summary: {} } }))
      } finally {
        setLoadingItemsFor(null)
      }
    }
  }

  const handleToggleItemSelection = (itemNumber) => {
    setSelectedItems(prev =>
      prev.includes(itemNumber)
        ? prev.filter(n => n !== itemNumber)
        : [...prev, itemNumber]
    )
  }

  const handleSelectAllAvailable = (items) => {
    const availableItems = items.filter(item => item.disposition === 'available')
    setSelectedItems(availableItems.map(item => item.itemNumber))
  }

  const handleMarkItems = async (bid, action) => {
    if (selectedItems.length === 0) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'No Items Selected',
        message: 'Please select at least one item'
      })
      return
    }

    const jobId = bid.job?._id
    if (!jobId) return

    try {
      setIsMarkingItems(true)

      if (action === 'donated') {
        await markItemsDonated(jobId, selectedItems)
      } else {
        await markItemsHauled(jobId, selectedItems)
      }

      // Refresh items
      const response = await getVendorJobItems(jobId)
      setJobItems(prev => ({ ...prev, [jobId]: response }))
      setSelectedItems([])

      setNotificationModal({
        show: true,
        type: 'success',
        title: 'Items Updated',
        message: `${selectedItems.length} item(s) marked as ${action}`
      })
    } catch (err) {
      console.error('Error marking items:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Failed to update items'
      })
    } finally {
      setIsMarkingItems(false)
    }
  }

  const handleCompleteWork = (bid) => {
    setConfirmModal({ show: true, bid })
  }

  const confirmCompleteWork = async () => {
    const bid = confirmModal.bid
    if (!bid) return

    const jobStage = bid.job?.stage
    const actionLabel = jobStage === 'donations' ? 'donations' : 'hauling'

    try {
      setIsCompletingWork(true)
      setConfirmModal({ show: false, bid: null })

      if (jobStage === 'donations') {
        await completeDonationWork(bid._id)
      } else {
        await completeHaulingWork(bid._id)
      }

      setNotificationModal({
        show: true,
        type: 'success',
        title: 'Work Completed',
        message: `Your ${actionLabel} work has been marked as complete. You can now upload your receipt.`
      })

      // Refresh data
      await loadData()
      setExpandedBidId(null)
    } catch (err) {
      console.error('Error completing work:', err)
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to complete work'
      })
    } finally {
      setIsCompletingWork(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const acceptedBids = myBids.filter(b => b.status === 'accepted')
  const pendingBids = myBids.filter(b => b.status === 'submitted')

  // Filter opportunities based on bid type matching the job stage
  // A vendor with 'both' serviceType who completed donation work should still see hauling opportunities
  const availableOpportunities = opportunities.filter(job => {
    // Find bids for this specific job
    const bidsForJob = myBids.filter(b => b.job?._id === job._id)

    if (bidsForJob.length === 0) {
      // No bids for this job - show it
      return true
    }

    // Check if there's a pending (submitted) bid for this job - hide it until decision is made
    const hasPendingBid = bidsForJob.some(b => b.status === 'submitted')
    if (hasPendingBid) {
      return false
    }

    // Determine bid type based on job stage
    const jobBidType = job.stage === 'donations' ? 'donation' : 'hauling'

    // Check if vendor already has an accepted bid matching this stage's type
    const hasAcceptedBidForType = bidsForJob.some(b =>
      b.status === 'accepted' && b.bidType === jobBidType
    )

    // If they have an accepted bid for this type, hide the opportunity
    if (hasAcceptedBidForType) {
      return false
    }

    // Otherwise show it (e.g., they completed donation, now job is in hauling stage)
    return true
  })

  if (!vendorId) {
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
            <p className="text-red-600 font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Account Not Linked
            </p>
            <p className="text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your account is not linked to a vendor profile. Please contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Vendor Dashboard
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage bids, jobs, and documentation
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Available Opportunities</p>
            <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {availableOpportunities.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Jobs Awarded</p>
            <p className="text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {acceptedBids.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Bids</p>
            <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {pendingBids.length}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-[#707072]/20 overflow-x-auto">
          {['opportunities', 'my bids', 'awarded jobs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-[#e6c35a] text-[#101010]'
                  : 'text-[#707072] hover:text-[#101010]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'opportunities' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Open Bid Opportunities
                </h2>
                {availableOpportunities.length === 0 ? (
                  <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
                    <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      No opportunities available at this time
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOpportunities.map(job => (
                      <div key={job._id} className="bg-[#F8F5F0] rounded-lg border-l-4 border-[#e6c35a] overflow-hidden">
                        <div className="p-4">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                  {job.propertyAddress}
                                </h3>
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-semibold capitalize bg-blue-100 text-blue-800"
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                  {job.stage}
                                </span>
                              </div>
                              <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <strong>Client:</strong> {job.contractSignor}
                              </p>
                              {job.story?.inventory && (
                                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  <strong>Inventory:</strong> {job.story.inventory}
                                </p>
                              )}
                              <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Target Date: {formatDate(job.desiredCompletionDate)}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleToggleVideos(job._id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                                  expandedJobId === job._id
                                    ? 'bg-[#333] text-white'
                                    : 'bg-[#101010] text-white hover:bg-[#333]'
                                }`}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {expandedJobId === job._id ? 'Hide Videos' : 'View Videos'}
                              </button>
                              <button
                                onClick={() => handleOpenBidModal(job)}
                                className="px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all whitespace-nowrap"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                Submit Bid
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Videos & Items Section */}
                        {expandedJobId === job._id && (
                          <div className="border-t border-[#e6c35a]/30 bg-white p-4">
                            {loadingVideosFor === job._id ? (
                              <div className="text-center py-6">
                                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Videos Section */}
                                <div>
                                  <h4 className="text-sm font-bold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Property Walkthrough Videos
                                  </h4>
                                  {!jobVideos[job._id] || jobVideos[job._id].length === 0 ? (
                                    <div className="text-center py-4 bg-[#F8F5F0] rounded-lg">
                                      <p className="text-[#707072] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        No videos available yet
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {jobVideos[job._id].map((video, index) => (
                                        <div key={video._id || index} className="bg-[#F8F5F0] rounded-lg p-3">
                                          <div className="mb-2">
                                            <h5 className="font-semibold text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                              {video.title || `Video ${index + 1}`}
                                            </h5>
                                            {video.description && (
                                              <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                {video.description}
                                              </p>
                                            )}
                                          </div>
                                          <video
                                            src={video.url}
                                            controls
                                            className="w-full rounded-lg bg-black"
                                            style={{ maxHeight: '200px' }}
                                          >
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Available Items Section */}
                                <div>
                                  <h4 className="text-sm font-bold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Available Items ({opportunityItems[job._id]?.items?.length || 0})
                                  </h4>
                                  {!opportunityItems[job._id]?.items?.length ? (
                                    <div className="text-center py-4 bg-[#F8F5F0] rounded-lg">
                                      <p className="text-[#707072] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        No items listed yet
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                      {opportunityItems[job._id].items.map(item => (
                                        <div key={item.itemNumber} className="bg-[#F8F5F0] rounded-lg overflow-hidden">
                                          <div className="aspect-square bg-gray-100">
                                            {item.photo ? (
                                              <img
                                                src={item.photo}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-1.5">
                                            <p className="text-xs font-medium text-[#101010] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                                              {item.title}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my bids' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  My Bids
                </h2>
                {myBids.length === 0 ? (
                  <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
                    <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      You haven't submitted any bids yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBids.map(bid => (
                      <div
                        key={bid._id}
                        className={`p-4 rounded-lg border-l-4 ${
                          bid.status === 'accepted'
                            ? 'bg-green-50 border-green-500'
                            : bid.status === 'rejected'
                            ? 'bg-red-50 border-red-400'
                            : 'bg-[#F8F5F0] border-[#e6c35a]'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {bid.job?.propertyAddress || 'Unknown Location'}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                                  bid.status === 'accepted'
                                    ? 'bg-green-200 text-green-800'
                                    : bid.status === 'rejected'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-yellow-200 text-yellow-800'
                                }`}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {bid.status === 'accepted' ? 'Won' : bid.status === 'rejected' ? 'Not Selected' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                              <strong>Client:</strong> {bid.job?.contractSignor || 'N/A'}
                            </p>
                            <div className="flex gap-6 text-sm flex-wrap">
                              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <strong>Your Bid:</strong> {formatCurrency(bid.amount)}
                              </p>
                              {bid.timelineDays > 0 && (
                                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  <strong>Timeline:</strong> {bid.timelineDays} days
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Submitted: {formatDate(bid.createdAt)}
                            </p>

                            {/* Status Message */}
                            {bid.status === 'rejected' && (
                              <div className="mt-3 p-3 bg-red-100 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-semibold text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Another vendor was selected
                                  </p>
                                  <p className="text-xs text-red-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Thank you for your bid. The client chose a different vendor for this job.
                                  </p>
                                </div>
                              </div>
                            )}

                            {bid.status === 'accepted' && (
                              <div className="mt-3 p-3 bg-green-100 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-semibold text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Congratulations! You won this job
                                  </p>
                                  <p className="text-xs text-green-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    View details in the "Awarded Jobs" tab.
                                  </p>
                                </div>
                              </div>
                            )}

                            {bid.status === 'submitted' && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-semibold text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Awaiting client decision
                                  </p>
                                  <p className="text-xs text-yellow-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Your bid is under review. You'll be notified when a decision is made.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'awarded jobs' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Awarded Jobs
                </h2>
                {acceptedBids.length === 0 ? (
                  <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
                    <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      No awarded jobs yet
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Payment will be made after the job is completed and verified.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {acceptedBids.map(bid => (
                        <div key={bid._id} className="border border-[#707072]/20 rounded-lg overflow-hidden">
                          {/* Job Header */}
                          <div className="p-4 bg-[#F8F5F0]">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                                  {bid.job?.contractSignor || 'N/A'}
                                </h4>
                                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {bid.job?.propertyAddress || 'N/A'}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-2">
                                  <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <strong>Amount:</strong> {formatCurrency(bid.amount)}
                                  </span>
                                  {bid.timelineDays > 0 && (
                                    <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      <strong>Timeline:</strong> {bid.timelineDays} days
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Work Status */}
                                {bid.workCompleted ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                    bid.bidType === 'donation' ? 'bg-purple-100 text-purple-800' :
                                    bid.bidType === 'hauling' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                  }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {bid.bidType === 'donation' ? 'Donations Done' :
                                     bid.bidType === 'hauling' ? 'Hauling Done' :
                                     'Work Done'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    In Progress
                                  </span>
                                )}
                                {/* Payment Status */}
                                {bid.isPaid ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Paid
                                  </span>
                                ) : bid.workCompleted ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Awaiting Payment
                                  </span>
                                ) : null}
                                {/* Receipt Status - only show after work completed */}
                                {bid.workCompleted && (
                                  <>
                                    {bid.receipt?.url ? (
                                      <span className="inline-flex items-center text-xs text-green-600 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Receipt Uploaded
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleOpenReceiptModal(bid)}
                                        className="px-3 py-1 bg-[#e6c35a] text-black rounded text-xs font-medium hover:bg-[#edd88c]"
                                      >
                                        Upload Receipt
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => handleToggleItems(bid)}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                    expandedBidId === bid._id
                                      ? 'bg-[#101010] text-white'
                                      : 'bg-white border border-[#707072]/30 text-[#101010] hover:bg-gray-50'
                                  }`}
                                >
                                  {expandedBidId === bid._id ? 'Hide Items' : 'View Items'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Items Section */}
                          {expandedBidId === bid._id && (
                            <div className="p-4 border-t border-[#707072]/20 bg-white">
                              {/* Work Completed State */}
                              {bid.workCompleted ? (
                                <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <h4 className="text-lg font-bold text-green-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {bid.job?.stage === 'donations' ? 'Donations' : 'Hauling'} Complete!
                                  </h4>
                                  <p className="text-sm text-green-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {bid.job?.stage === 'donations'
                                      ? `You marked ${jobItems[bid.job?._id]?.summary?.donated || 0} items as donated.`
                                      : `You marked ${jobItems[bid.job?._id]?.summary?.hauled || 0} items as hauled.`
                                    }
                                  </p>
                                  {!bid.receipt?.url && (
                                    <button
                                      onClick={() => handleOpenReceiptModal(bid)}
                                      className="px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all"
                                      style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                      Upload Receipt for Payment
                                    </button>
                                  )}
                                  {bid.receipt?.url && !bid.isPaid && (
                                    <p className="text-sm text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      Receipt uploaded. Awaiting payment...
                                    </p>
                                  )}
                                  {bid.isPaid && (
                                    <p className="text-sm text-green-600 font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      Payment received!
                                    </p>
                                  )}
                                </div>
                              ) : loadingItemsFor === bid.job?._id ? (
                                <div className="text-center py-8">
                                  <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading items...</p>
                                </div>
                              ) : !jobItems[bid.job?._id]?.items?.filter(item => item.disposition === 'available').length ? (
                                <div className="text-center py-8 bg-[#F8F5F0] rounded-lg">
                                  <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    No available items remaining for this job
                                  </p>
                                  {jobItems[bid.job?._id]?.summary && (
                                    <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {bid.job?.stage === 'donations'
                                        ? `${jobItems[bid.job?._id]?.summary?.donated || 0} donated`
                                        : `${jobItems[bid.job?._id]?.summary?.hauled || 0} hauled`
                                      }
                                    </p>
                                  )}
                                  {/* Show complete button even when no items left */}
                                  <button
                                    onClick={() => handleCompleteWork(bid)}
                                    disabled={isCompletingWork}
                                    className={`mt-4 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 ${
                                      bid.job?.stage === 'donations'
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                    }`}
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                  >
                                    {isCompletingWork
                                      ? 'Processing...'
                                      : bid.job?.stage === 'donations'
                                      ? 'Complete Donations'
                                      : 'Complete Hauling'
                                    }
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* Summary - show relevant stats based on job stage */}
                                  <div className="flex flex-wrap gap-4 mb-4 p-3 bg-[#F8F5F0] rounded-lg">
                                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      <strong>Total:</strong> {jobItems[bid.job?._id]?.summary?.total || 0}
                                    </span>
                                    <span className="text-sm text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      <strong>Available:</strong> {jobItems[bid.job?._id]?.summary?.available || 0}
                                    </span>
                                    {bid.job?.stage === 'donations' && (
                                      <span className="text-sm text-purple-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        <strong>Donated:</strong> {jobItems[bid.job?._id]?.summary?.donated || 0}
                                      </span>
                                    )}
                                    {bid.job?.stage === 'hauling' && (
                                      <span className="text-sm text-orange-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        <strong>Hauled:</strong> {jobItems[bid.job?._id]?.summary?.hauled || 0}
                                      </span>
                                    )}
                                  </div>

                                  {/* Action Buttons - show based on job stage */}
                                  {jobItems[bid.job?._id]?.items?.some(item => item.disposition === 'available') && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      <button
                                        onClick={() => handleSelectAllAvailable(jobItems[bid.job?._id]?.items || [])}
                                        className="px-3 py-1 text-xs font-medium bg-gray-100 text-[#101010] rounded hover:bg-gray-200"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                      >
                                        Select All Available
                                      </button>
                                      {selectedItems.length > 0 && (
                                        <>
                                          {bid.job?.stage === 'donations' && (
                                            <button
                                              onClick={() => handleMarkItems(bid, 'donated')}
                                              disabled={isMarkingItems}
                                              className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                              style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                              {isMarkingItems ? 'Processing...' : `Mark ${selectedItems.length} as Donated`}
                                            </button>
                                          )}
                                          {bid.job?.stage === 'hauling' && (
                                            <button
                                              onClick={() => handleMarkItems(bid, 'hauled')}
                                              disabled={isMarkingItems}
                                              className="px-3 py-1 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                                              style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                              {isMarkingItems ? 'Processing...' : `Mark ${selectedItems.length} as Hauled`}
                                            </button>
                                          )}
                                          <button
                                            onClick={() => setSelectedItems([])}
                                            className="px-3 py-1 text-xs font-medium bg-gray-200 text-[#707072] rounded hover:bg-gray-300"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                          >
                                            Clear Selection
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {/* Items Grid - only show available items */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {jobItems[bid.job?._id]?.items?.filter(item => item.disposition === 'available').map(item => (
                                      <div
                                        key={item.itemNumber}
                                        onClick={() => handleToggleItemSelection(item.itemNumber)}
                                        className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                          selectedItems.includes(item.itemNumber)
                                            ? 'border-[#e6c35a] ring-2 ring-[#e6c35a]/30'
                                            : 'border-gray-200 hover:border-[#e6c35a]/50'
                                        }`}
                                      >
                                        {/* Item Image */}
                                        <div className="aspect-square bg-gray-100">
                                          {item.photo ? (
                                            <img
                                              src={item.photo}
                                              alt={item.title}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>

                                        {/* Item Info */}
                                        <div className="p-2">
                                          <p className="text-xs font-medium text-[#101010] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            #{item.itemNumber} - {item.title}
                                          </p>
                                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                          </span>
                                        </div>

                                        {/* Selection Checkbox */}
                                        <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                          selectedItems.includes(item.itemNumber)
                                            ? 'bg-[#e6c35a] border-[#e6c35a]'
                                            : 'bg-white border-gray-300'
                                        }`}>
                                          {selectedItems.includes(item.itemNumber) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Complete Work Button */}
                                  {!bid.workCompleted && (
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                      <button
                                        onClick={() => handleCompleteWork(bid)}
                                        disabled={isCompletingWork}
                                        className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 ${
                                          bid.job?.stage === 'donations'
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-orange-600 text-white hover:bg-orange-700'
                                        }`}
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                      >
                                        {isCompletingWork
                                          ? 'Processing...'
                                          : bid.job?.stage === 'donations'
                                          ? 'Complete Donations'
                                          : 'Complete Hauling'
                                        }
                                      </button>
                                      <p className="text-xs text-[#707072] text-center mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        Click when you're done with all {bid.job?.stage === 'donations' ? 'donations' : 'hauling'} to proceed to payment
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Submit Bid Modal */}
      {showBidModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Submit Bid
              </h3>

              <div className="mb-4 p-3 bg-[#F8F5F0] rounded-lg">
                <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedJob.propertyAddress}
                </p>
                <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedJob.contractSignor}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Bid Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[#707072]">$</span>
                  <input
                    type="number"
                    value={bidData.amount}
                    onChange={(e) => setBidData({ ...bidData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Estimated Timeline (days)
                </label>
                <input
                  type="number"
                  value={bidData.timelineDays}
                  onChange={(e) => setBidData({ ...bidData, timelineDays: e.target.value })}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="e.g., 3"
                  min="1"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: '💵' },
                    { value: 'cashapp', label: 'Cash App', icon: '📱' },
                    { value: 'bank', label: 'Bank Transfer', icon: '🏦' }
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setBidData({ ...bidData, paymentMethod: method.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        bidData.paymentMethod === method.value
                          ? 'border-[#e6c35a] bg-[#e6c35a]/10'
                          : 'border-[#707072]/30 hover:border-[#707072]/50'
                      }`}
                    >
                      <span className="text-xl block mb-1">{method.icon}</span>
                      <span className="text-xs font-medium text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash App Handle - shown when cashapp selected */}
              {bidData.paymentMethod === 'cashapp' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Cash App Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[#707072]">$</span>
                    <input
                      type="text"
                      value={bidData.cashAppHandle}
                      onChange={(e) => setBidData({ ...bidData, cashAppHandle: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="yourhandle"
                    />
                  </div>
                </div>
              )}

              {/* Bank Details - shown when bank selected */}
              {bidData.paymentMethod === 'bank' && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={bidData.bankDetails.accountHolderName}
                      onChange={(e) => setBidData({
                        ...bidData,
                        bankDetails: { ...bidData.bankDetails, accountHolderName: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bidData.bankDetails.bankName}
                      onChange={(e) => setBidData({
                        ...bidData,
                        bankDetails: { ...bidData.bankDetails, bankName: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="Bank of America"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={bidData.bankDetails.accountNumber}
                        onChange={(e) => setBidData({
                          ...bidData,
                          bankDetails: { ...bidData.bankDetails, accountNumber: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Routing Number *
                      </label>
                      <input
                        type="text"
                        value={bidData.bankDetails.routingNumber}
                        onChange={(e) => setBidData({
                          ...bidData,
                          bankDetails: { ...bidData.bankDetails, routingNumber: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        placeholder="021000021"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {bidSubmitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Bid Submitted!
                  </h4>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Taking you to My Bids...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowBidModal(false)
                      setSelectedJob(null)
                    }}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBid}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Bid'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      {showReceiptModal && selectedJobForReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Upload Donation Receipt
              </h3>

              <div className="mb-4 p-3 bg-[#F8F5F0] rounded-lg">
                <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedJobForReceipt.job?.propertyAddress}
                </p>
                <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedJobForReceipt.job?.contractSignor}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Receipt PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                {receiptFile && (
                  <p className="text-sm text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Selected: {receiptFile.name}
                  </p>
                )}
              </div>

              {/* Success State */}
              {receiptUploadSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Receipt Uploaded!
                  </h4>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Your receipt has been saved successfully.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowReceiptModal(false)
                      setSelectedJobForReceipt(null)
                      setReceiptFile(null)
                    }}
                    disabled={isUploadingReceipt}
                    className="w-full px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadReceipt}
                    disabled={isUploadingReceipt || !receiptFile}
                    className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {isUploadingReceipt ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Receipt'
                    )}
                  </button>
                </div>
              )}
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
                onClick={() => setNotificationModal({ show: false, type: '', message: '', title: '' })}
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

      {/* Complete Work Confirmation Modal */}
      {confirmModal.show && confirmModal.bid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                confirmModal.bid.job?.stage === 'donations' ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                <svg className={`w-8 h-8 ${confirmModal.bid.job?.stage === 'donations' ? 'text-purple-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Complete {confirmModal.bid.job?.stage === 'donations' ? 'Donations' : 'Hauling'}?
              </h3>
              <p className="text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Are you sure you're done with all {confirmModal.bid.job?.stage === 'donations' ? 'donations' : 'hauling'}? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, bid: null })}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCompleteWork}
                  disabled={isCompletingWork}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 ${
                    confirmModal.bid.job?.stage === 'donations'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isCompletingWork ? 'Processing...' : 'Yes, Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDashboardPage
