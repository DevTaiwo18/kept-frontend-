import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobById, updateJobStatus } from '../utils/clientJobsApi'
import { getJobItems, createItem, uploadItemPhotos } from '../utils/itemsApi'
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
  const [items, setItems] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  useEffect(() => {
    loadJob()
    loadItems()
  }, [id])

  const loadJob = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getClientJobById(id)
      setJob(data.job)
      setNewStatus(data.job.stage)
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
      setItems(Array.isArray(data) ? data : data.items || [])
    } catch (err) {
      console.error('Failed to load items:', err)
    } finally {
      setIsLoadingItems(false)
    }
  }

  const hasDraftItems = items.some(item => item.status === 'draft' || item.status === 'needs_review')
  const hasApprovedItems = items.some(item => item.status === 'approved')
  const allItemsApproved = items.length > 0 && items.every(item => item.status === 'approved')

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

      let itemId = null

      if (items.length > 0) {
        const firstNonApprovedItem = items.find(item => item.status !== 'approved')
        if (firstNonApprovedItem) {
          itemId = firstNonApprovedItem._id
        } else {
          const newItem = await createItem(id)
          itemId = newItem._id
        }
      } else {
        const newItem = await createItem(id)
        itemId = newItem._id
      }

      await uploadItemPhotos(itemId, selectedFiles)

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
      await updateJobStatus(id, newStatus, statusNote)
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {job.contractSignor}
            </h1>
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {job.propertyAddress}
            </p>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Update Status
          </button>
        </div>

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

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
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
              {items.length > 0 && (
                <button
                  onClick={() => navigate(`/agent/item/${items[0]._id}`)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View All Items
                </button>
              )}
              {!allItemsApproved && (
                <button
                  onClick={handleCreateItem}
                  className="w-full sm:w-auto px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  + Upload Photos
                </button>
              )}
            </div>
          </div>

          {items.length === 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                📸 <strong>Getting Started:</strong> Ask the client to upload all photos for this project before running AI analysis. You can also upload photos on their behalf using the button above.
              </p>
            </div>
          )}

          {hasDraftItems && !hasApprovedItems && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                ⚠️ Ready for Review
              </p>
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>Tip:</strong> More angles = better AI results. When all photos are uploaded, click "View All Items" to run AI analysis and approve.
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
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F5F0] rounded-lg">
              <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                No items added yet
              </p>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Upload photos or have the client add them to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="border-2 rounded-lg overflow-hidden transition-all bg-white hover:border-[#e6c35a] border-gray-200"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => navigate(`/agent/item/${item._id}`)}
                  >
                    {item.status !== 'approved' && (
                      <>
                        {item.photos && item.photos.length > 0 ? (
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {item.photos.slice(0, 3).map((photo, idx) => (
                              <div key={idx} className="relative h-32 overflow-hidden rounded-lg">
                                <img
                                  src={photo}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-4">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.photos?.length || 0} photo(s) • {item.approvedItems?.length || 0} items approved
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3 ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
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
                          💡 <strong>Before AI:</strong> More angles = better results. Click to review photos and run AI analysis.
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
                        {item.approvedItems.slice(0, 8).map((approvedItem, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={item.photos[approvedItem.photoIndex]}
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
                        ))}
                      </div>
                      {item.approvedItems.length > 8 && (
                        <p className="text-xs text-[#707072] mt-3 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                          +{item.approvedItems.length - 8} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Gross Sales</span>
                <span className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(job.finance.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Fees</span>
                <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(job.finance.fees)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Hauling Cost</span>
                <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(job.finance.haulingCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-[#e6c35a]/10 -mx-6 px-6 mt-2">
                <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Net Payout</span>
                <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(job.finance.net)}
                </span>
              </div>
            </div>

            {job.finance.daily && job.finance.daily.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Daily Breakdown
                </p>
                {job.finance.daily.map((day, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Day {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatCurrency(day.sales)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setStatusNote('')
                  setNewStatus(job.stage)
                  setUpdateError('')
                }}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Upload Item Photos
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
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Select Photos (Max 10 at a time)
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
                    <p className={`text-sm mt-2 ${selectedFiles.length === 10 ? 'text-[#e6c35a] font-semibold' : 'text-[#707072]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {selectedFiles.length} / 10 file(s) selected
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFiles([])
                      setUploadError('')
                    }}
                    className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0}
                    className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentJobDetailPage