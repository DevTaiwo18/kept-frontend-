import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobById, payClientJobDeposit } from '../utils/clientJobsApi'
import { getJobItems, createItem, uploadItemPhotos } from '../utils/itemsApi'
import { getJobReceipts } from '../utils/vendorsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientProjectDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [item, setItem] = useState(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [vendorReceipts, setVendorReceipts] = useState([])
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  useEffect(() => {
    loadProject()
    loadItems()
    loadReceipts()

    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setShowSuccessModal(true)
    }
  }, [id, searchParams])

  const loadProject = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getClientJobById(id)

      if (!data.job?.depositPaidAt) {
        navigate(`/client/waiting/${id}`)
        return
      }

      setProject(data.job)
    } catch (err) {
      setError(err.message || 'Failed to load project details')
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

  const loadReceipts = async () => {
    try {
      setIsLoadingReceipts(true)
      const data = await getJobReceipts(id)
      setVendorReceipts(data.receipts || [])
    } catch (err) {
      console.error('Failed to load vendor receipts:', err)
    } finally {
      setIsLoadingReceipts(false)
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

  const hasApprovedItems = item && item.status === 'approved'
  const canUpload = !hasApprovedItems

  const handleCreateNewItem = async () => {
    if (!canUpload) {
      return
    }
    setShowUploadModal(true)
    setUploadError('')
    setSelectedFiles([])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setUploadError('')
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one photo')
      return
    }

    if (isUploading) {
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
    { key: 'estate_sale', label: 'Estate Transition' },
    { key: 'donations', label: 'Donations' },
    { key: 'hauling', label: 'Hauling' },
    { key: 'payout_processing', label: 'Payout' },
    { key: 'closing', label: 'Closing' }
  ]

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
    const gross = project?.finance?.gross || 0
    const serviceFee = (project?.serviceFee && project.serviceFee > 0) ? project.serviceFee : 0
    const hauling = project?.finance?.haulingCost || 0
    const depositPaid = (project?.depositAmount && project.depositAmount > 0 && project.depositPaidAt) ? project.depositAmount : 0

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Loading project details...
        </p>
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
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-sm sm:text-base text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error || 'Project not found'}
            </p>
            <button
              onClick={() => navigate('/onboarding')}
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

  const currentStageIndex = getStageIndex(project.stage)
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100
  const financials = calculateFinancials()

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-[#e6c35a] truncate max-w-[120px] sm:max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => navigate('/onboarding')}
          className="text-sm sm:text-base text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {project.contractSignor}
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {project.propertyAddress}
          </p>
        </div>

        {project.status === 'awaiting_deposit' && project.serviceFee > 0 && (
          <div className="mb-6 p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Initial Deposit Required
                </h3>
                <p className="text-sm text-blue-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  An initial deposit of <strong>{formatCurrency(project.depositAmount)}</strong> is required to activate your project.
                </p>

                {project.scopeNotes && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Contract Details
                    </p>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {project.scopeNotes}
                    </p>
                  </div>
                )}

                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {paymentError}
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePayDeposit}
                  disabled={isProcessingPayment}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isProcessingPayment ? 'Processing...' : `Pay ${formatCurrency(project.depositAmount)} Now`}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
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

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Inventory Items
              </h3>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {canUpload
                  ? 'Upload photos for each item in batches'
                  : 'Your items are being reviewed by our team'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {item && item.photoGroups && item.photoGroups.length > 0 && (
                <button
                  onClick={() => navigate(`/client/item/${item._id}`)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View All Items
                </button>
              )}
              {canUpload && (
                <button
                  onClick={handleCreateNewItem}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-sm sm:text-base whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  + Add New Item
                </button>
              )}
            </div>
          </div>

          {(!item || !item.photoGroups || item.photoGroups.length === 0) && (
            <div className="mb-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 <strong>Tip:</strong> For best marketplace results, we recommend at least 4 clear photos per item showing different angles.
              </p>
            </div>
          )}

          {item && canUpload && item.status !== 'approved' && (
            <div className="mb-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 <strong>Tip:</strong> For best marketplace results, we recommend at least 4 clear photos per item showing different angles.
              </p>
            </div>
          )}

          {hasApprovedItems && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                ✓ All items approved!
              </p>
              <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your items are ready for listing. To add more items, please contact your agent at{' '}
                <a href="mailto:admin@keptestate.com" className="underline font-semibold">admin@keptestate.com</a>
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
                Click "Add New Item" above to upload photos for your first item
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.photoGroups.slice(0, 3).map((group) => {
                const firstPhotoIndex = group.startIndex
                const photoUrl = item.photos[firstPhotoIndex]
                const approvedItem = item.approvedItems?.find(ai => ai.itemNumber === group.itemNumber)
                const isSold = item.soldPhotoIndices?.some(idx => idx >= group.startIndex && idx <= group.endIndex)
                const isDonated = item.donatedPhotoIndices?.some(idx => idx >= group.startIndex && idx <= group.endIndex)
                const isHauled = item.hauledPhotoIndices?.some(idx => idx >= group.startIndex && idx <= group.endIndex)

                return (
                  <div
                    key={group.itemNumber}
                    className={`border-2 rounded-lg overflow-hidden transition-all bg-white ${
                      isSold || isDonated || isHauled ? 'border-gray-300' : 'hover:border-[#e6c35a] border-gray-200'
                    }`}
                  >
                    {photoUrl ? (
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <img
                          src={photoUrl}
                          alt={group.title}
                          className={`w-full h-full object-cover ${isSold || isDonated || isHauled ? 'opacity-60 grayscale' : ''}`}
                        />
                        {(isSold || isDonated || isHauled) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className={`px-4 py-2 rounded-lg font-bold text-sm text-white shadow-lg ${
                              isSold ? 'bg-red-600' : isDonated ? 'bg-purple-600' : 'bg-orange-600'
                            }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                              {isSold ? 'SOLD' : isDonated ? 'DONATED' : 'HAULED'}
                            </div>
                          </div>
                        )}
                        {group.photoCount > 1 && !isSold && !isDonated && !isHauled && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                              +{group.photoCount - 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 sm:h-56 bg-gray-100 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm sm:text-base font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {group.title}
                        </h4>
                        {isSold ? (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-red-100 text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Sold
                          </span>
                        ) : isDonated ? (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-100 text-purple-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Donated
                          </span>
                        ) : isHauled ? (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-orange-100 text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Hauled
                          </span>
                        ) : approvedItem ? (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                            ${approvedItem.price || '0'}
                          </span>
                        ) : (
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                              }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {item.status === 'draft' ? 'Awaiting Review' :
                              item.status === 'approved' ? 'Approved' :
                                item.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {group.photoCount} photo(s)
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Project Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Phone</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {project.contactPhone}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Email</p>
                <p className="text-sm text-[#101010] font-semibold break-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {project.contactEmail}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Desired Completion</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(project.desiredCompletionDate)}
                </p>
              </div>
              {project.accountManager && (
                <div>
                  <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Account Manager</p>
                  <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.accountManager.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Gross Sales</span>
                <span className="text-xs sm:text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Service Fee</span>
                <span className="text-xs sm:text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(financials.serviceFee)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Kept House Commission</span>
                <span className="text-xs sm:text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(financials.keptHouseCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Hauling Cost</span>
                <span className="text-xs sm:text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(financials.hauling)}
                </span>
              </div>
              {financials.depositPaid > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Paid</span>
                  <span className="text-xs sm:text-sm font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    +{formatCurrency(financials.depositPaid)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 sm:py-3 bg-[#e6c35a]/10 -mx-4 sm:-mx-6 px-4 sm:px-6 mt-2">
                <span className="text-sm sm:text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Net Payout</span>
                <span className="text-sm sm:text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(financials.net)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {project.serviceFee > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Contract Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Service Fee</span>
                <span className="text-xs sm:text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(project.serviceFee)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Initial Deposit</span>
                <span className="text-xs sm:text-sm font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(project.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Balance Due at Closing</span>
                <span className="text-xs sm:text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(project.serviceFee - (project.depositAmount || 0))}
                </span>
              </div>
              {project.depositPaidAt && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit Paid On</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatDate(project.depositPaidAt)}
                  </span>
                </div>
              )}
              {project.scopeNotes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Scope of Work
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010] whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.scopeNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vendor Receipts Section - Separated by type */}
        {vendorReceipts.length > 0 && (() => {
          // Categorize receipts by bidType
          const getReceiptType = (r) => {
            // Check bidType at root level or nested under bid
            const bidType = r.bidType || r.bid?.bidType
            if (bidType === 'donation') return 'donation'
            if (bidType === 'hauling') return 'hauling'
            // Then check vendor serviceType (only if specific, not 'both')
            if (r.vendor?.serviceType === 'donation') return 'donation'
            if (r.vendor?.serviceType === 'hauling') return 'hauling'
            // For 'both' vendors without bidType, it's uncategorized/legacy
            return 'other'
          }

          const donationReceipts = vendorReceipts.filter(r => getReceiptType(r) === 'donation')
          const haulingReceipts = vendorReceipts.filter(r => getReceiptType(r) === 'hauling')
          const otherReceipts = vendorReceipts.filter(r => getReceiptType(r) === 'other')

          const ReceiptCard = ({ receipt, idx, colorClass, serviceLabel }) => (
            <div
              key={receipt._id || idx}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-[#F8F5F0] rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {receipt.vendor?.companyName || receipt.vendor?.name || 'Vendor'}
                  {serviceLabel && <span className="text-[#707072] font-normal"> ({serviceLabel})</span>}
                </p>
                {receipt.receipt?.uploadedAt && (
                  <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Uploaded: {formatDate(receipt.receipt.uploadedAt)}
                  </p>
                )}
              </div>
              {receipt.receipt?.url && (
                <a
                  href={receipt.receipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${colorClass}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Receipt
                </a>
              )}
            </div>
          )

          return (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Vendor Receipts
              </h3>

              {/* Donation Receipts */}
              {donationReceipts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Donation
                    </span>
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {donationReceipts.length} receipt(s)
                    </span>
                  </div>
                  <div className="space-y-3 border-l-4 border-purple-400 pl-4">
                    {donationReceipts.map((receipt, idx) => (
                      <ReceiptCard key={receipt._id || idx} receipt={receipt} idx={idx} colorClass="bg-purple-600 text-white hover:bg-purple-700" serviceLabel="Donation" />
                    ))}
                  </div>
                </div>
              )}

              {/* Hauling Receipts */}
              {haulingReceipts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Hauling
                    </span>
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {haulingReceipts.length} receipt(s)
                    </span>
                  </div>
                  <div className="space-y-3 border-l-4 border-orange-400 pl-4">
                    {haulingReceipts.map((receipt, idx) => (
                      <ReceiptCard key={receipt._id || idx} receipt={receipt} idx={idx} colorClass="bg-orange-600 text-white hover:bg-orange-700" serviceLabel="Hauling" />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Receipts (legacy or untyped) */}
              {otherReceipts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Service
                    </span>
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {otherReceipts.length} receipt(s)
                    </span>
                  </div>
                  <div className="space-y-3 border-l-4 border-gray-400 pl-4">
                    {otherReceipts.map((receipt, idx) => (
                      <ReceiptCard key={receipt._id || idx} receipt={receipt} idx={idx} colorClass="bg-[#e6c35a] text-black hover:bg-[#edd88c]" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {project.services && Object.values(project.services).some(v => v) && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Services Requested
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.services).map(([key, value]) =>
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
        )}

        {project.specialRequests && (project.specialRequests.notForSale || project.specialRequests.restrictedAreas) && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Special Requests
            </h3>
            <div className="space-y-4">
              {project.specialRequests.notForSale && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Items Not for Sale
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.specialRequests.notForSale}
                  </p>
                </div>
              )}
              {project.specialRequests.restrictedAreas && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Restricted Areas
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.specialRequests.restrictedAreas}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {project.story && (project.story.owner || project.story.inventory || project.story.property) && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Story
            </h3>
            <div className="space-y-4">
              {project.story.owner && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    About the Owner
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.story.owner}
                  </p>
                </div>
              )}
              {project.story.inventory && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Inventory Overview
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.story.inventory}
                  </p>
                </div>
              )}
              {project.story.property && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Property Details
                  </p>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.story.property}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {project.stageNotes && project.stageNotes.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Status History & Notes
            </h3>
            <div className="space-y-3">
              {project.stageNotes.slice().reverse().map((note, i) => (
                <div key={i} className="p-3 sm:p-4 bg-[#F8F5F0] rounded-lg border-l-4 border-[#e6c35a]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {stages.find(s => s.key === note.stage)?.label || note.stage}
                    </span>
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatDateTime(note.at)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {note.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#e6c35a]/10 p-4 sm:p-6 rounded-xl border-2 border-[#e6c35a]/30">
          <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Need Help?
          </h3>
          <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Have questions about your project? Contact us at <a href="mailto:admin@keptestate.com" className="text-[#1c449e] font-semibold hover:underline break-all">admin@keptestate.com</a>
          </p>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Add New Item
            </h3>

            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 <strong>Tip:</strong> For best marketplace results, we recommend at least 4 clear photos per item showing different angles.
              </p>
            </div>

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
                <p className="text-base sm:text-lg font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Uploading photos...
                </p>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Please wait while we upload your {selectedFiles.length} photo(s)
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Select Photos for This Item
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 text-sm"
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
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from(selectedFiles).slice(0, 4).map((file, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-300"
                          />
                          {i === 3 && selectedFiles.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white text-lg font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                +{selectedFiles.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFiles([])
                      setUploadError('')
                    }}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload Item
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#101010] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Payment Successful!
              </h3>
              <p className="text-base text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your deposit of <span className="font-bold text-[#101010]">{formatCurrency(project.depositAmount)}</span> has been processed successfully.
              </p>
              <p className="text-sm text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your project is now active and our team will begin work shortly.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientProjectDetailPage