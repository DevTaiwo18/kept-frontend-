import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getItemById, uploadItemPhotos, analyzeItem, approveItem, reopenItem, markItemAsSold } from '../utils/itemsApi'
import { getClientJobById, toggleOnlineSale } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

import ApprovedItemsList from '../components/ApprovedItemsList'
import AIReviewSection from '../components/AIReviewSection'
import UnanalyzedItemsList from '../components/UnanalyzedItemsList'
import UploadModal from '../components/UploadModal'
import ReopenModal from '../components/ReopenModal'
import AnalyzingModal from '../components/AnalyzingModal'
import StatusBanners from '../components/StatusBanners'
import SaleTimeframesSection from '../components/SaleTimeframesSection'
import HaulerVideosSection from '../components/HaulerVideosSection'

function AgentItemGalleryPage() {
  const { id } = useParams()
  const auth = getAuth()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const [isApproving, setIsApproving] = useState(false)
  const [approveError, setApproveError] = useState('')

  const [showReopenModal, setShowReopenModal] = useState(false)
  const [isReopening, setIsReopening] = useState(false)
  const [reopenError, setReopenError] = useState('')

  const [editedItems, setEditedItems] = useState({})
  const [selectedItems, setSelectedItems] = useState({})

  const [isTogglingOnlineSale, setIsTogglingOnlineSale] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  useEffect(() => {
    loadItem()
  }, [id])

  const loadJob = async (jobId) => {
    try {
      const jobData = await getClientJobById(jobId)
      setJob(jobData.job)
    } catch (err) {
      console.error('Failed to load job:', err)
    }
  }

  const loadItem = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getItemById(id)
      setItem(data)

      if (data.job) {
        const jobId = typeof data.job === 'string' ? data.job : data.job._id || data.job
        await loadJob(jobId)
      }

      if (data.ai && Array.isArray(data.ai)) {
        const approvedItemNumbers = new Set(
          (data.approvedItems || []).map(approvedItem => approvedItem.itemNumber)
        )

        const newAiItems = data.ai.filter(
          aiItem => !approvedItemNumbers.has(aiItem.itemNumber)
        )

        const edited = {}
        const selected = {}
        newAiItems.forEach((aiItem) => {
          edited[aiItem.itemNumber] = {
            title: aiItem.title || '',
            description: aiItem.description || '',
            category: aiItem.category || '',
            priceLow: aiItem.priceLow || '',
            priceHigh: aiItem.priceHigh || '',
            price: aiItem.price || '',
            dimensions: aiItem.dimensions || { length: '', width: '', height: '', unit: 'inches' },
            weight: aiItem.weight || { value: '', unit: 'lbs' },
            material: aiItem.material || '',
            tags: aiItem.tags || []
          }
          selected[aiItem.itemNumber] = false
        })
        setEditedItems(edited)
        setSelectedItems(selected)
      }
    } catch (err) {
      setError(err.message || 'Failed to load item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleOnlineSale = async () => {
    if (!job) return

    try {
      setIsTogglingOnlineSale(true)
      await toggleOnlineSale(job._id)
      const jobId = typeof item.job === 'string' ? item.job : item.job._id || item.job
      await loadJob(jobId)
    } catch (err) {
      console.error('Failed to toggle online sale:', err)
      alert(err.message || 'Failed to toggle online sale status')
    } finally {
      setIsTogglingOnlineSale(false)
    }
  }

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true)
      setAnalyzeError('')
      await analyzeItem(id)
      await loadItem()
    } catch (err) {
      setAnalyzeError(err.message || 'Failed to analyze item')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpload = async (files) => {
    try {
      setIsUploading(true)
      setUploadError('')
      await uploadItemPhotos(id, files)
      await loadItem()
      setShowUploadModal(false)
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReopen = async (reason) => {
    try {
      setIsReopening(true)
      setReopenError('')
      await reopenItem(id, reason)
      await loadItem()
      setShowReopenModal(false)
    } catch (err) {
      setReopenError(err.message || 'Failed to reopen item')
    } finally {
      setIsReopening(false)
    }
  }

  const handleBatchApprove = async () => {
    try {
      setIsApproving(true)
      setApproveError('')

      const itemsToApprove = []

      Object.keys(selectedItems).forEach(itemNumber => {
        if (selectedItems[itemNumber]) {
          const aiItem = item.ai.find(ai => ai.itemNumber === parseInt(itemNumber))
          itemsToApprove.push({
            itemNumber: parseInt(itemNumber),
            photoIndices: aiItem.photoIndices,
            ...editedItems[itemNumber]
          })
        }
      })

      if (itemsToApprove.length === 0) {
        setApproveError('Please select at least one item to approve')
        return
      }

      await approveItem(id, { items: itemsToApprove })
      await loadItem()
    } catch (err) {
      setApproveError(err.message || 'Failed to approve items')
    } finally {
      setIsApproving(false)
    }
  }

  const handleMarkAsSold = async (itemNumber, estateSalePrice) => {
    try {
      await markItemAsSold(id, itemNumber, estateSalePrice)
    } catch (err) {
      throw err
    }
  }

  const handleEditItem = (itemNumber, field, value) => {
    setEditedItems(prev => ({
      ...prev,
      [itemNumber]: {
        ...prev[itemNumber],
        [field]: value
      }
    }))
  }

  const handleEditDimension = (itemNumber, dimension, value) => {
    setEditedItems(prev => ({
      ...prev,
      [itemNumber]: {
        ...prev[itemNumber],
        dimensions: {
          ...prev[itemNumber].dimensions,
          [dimension]: value
        }
      }
    }))
  }

  const handleEditWeight = (itemNumber, field, value) => {
    setEditedItems(prev => ({
      ...prev,
      [itemNumber]: {
        ...prev[itemNumber],
        weight: {
          ...prev[itemNumber].weight,
          [field]: value
        }
      }
    }))
  }

  const handleEditTags = (itemNumber, tags) => {
    setEditedItems(prev => ({
      ...prev,
      [itemNumber]: {
        ...prev[itemNumber],
        tags: tags
      }
    }))
  }

  const toggleSelectItem = (itemNumber) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemNumber]: !prev[itemNumber]
    }))
  }

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(v => v)
    const newSelected = {}
    Object.keys(selectedItems).forEach(key => {
      newSelected[key] = !allSelected
    })
    setSelectedItems(newSelected)
  }

  const analyzedGroupIndices = new Set(item?.analyzedGroupIndices || [])
  const unanalyzedGroups = item?.photoGroups?.filter(group => !analyzedGroupIndices.has(group.itemNumber)) || []
  const hasUnanalyzedGroups = unanalyzedGroups.length > 0

  const approvedItemNumbers = new Set(
    (item?.approvedItems || []).map(approvedItem => approvedItem.itemNumber)
  )
  const newAiItems = (item?.ai || []).filter(
    aiItem => !approvedItemNumbers.has(aiItem.itemNumber)
  )

  const isApproved = item && item.status === 'approved'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-[#F8F5F0] border-t-[#e6c35a] rounded-full animate-spin"></div>
          </div>
          <p className="text-[#707072] mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading photos...
          </p>
        </div>
      </div>
    )
  }

  if (error || !item) {
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
              {error || 'Item not found'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Go Back
            </button>
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
          onClick={() => navigate(-1)}
          className="text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Job
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Item Gallery
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.photoGroups?.length || 0} item(s) • {item.photos?.length || 0} photo(s)
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'approved' ? 'bg-green-100 text-green-800' :
                  item.status === 'needs_review' ? 'bg-orange-100 text-orange-800' :
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
          </div>
          <div className="flex flex-wrap gap-3">
            {job && (
              <button
                onClick={handleToggleOnlineSale}
                disabled={isTogglingOnlineSale}
                className={`px-6 py-3 rounded-lg font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${job.isOnlineSaleActive
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isTogglingOnlineSale ? '⏳ Updating...' : job.isOnlineSaleActive ? '🟢 Online Sale: ON' : '🔴 Online Sale: OFF'}
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              + Add New Item
            </button>
            {isApproved && (
              <button
                onClick={() => setShowReopenModal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                🔄 Reopen Item
              </button>
            )}
          </div>
        </div>

        <StatusBanners
          item={item}
          job={job}
          hasUnanalyzedGroups={hasUnanalyzedGroups}
          unanalyzedGroups={unanalyzedGroups}
          isApproved={isApproved}
        />

        <ApprovedItemsList
          item={item}
          job={job}
          onMarkAsSold={handleMarkAsSold}
          onReload={loadItem}
        />

        <UnanalyzedItemsList
          unanalyzedGroups={unanalyzedGroups}
          item={item}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {job && (
          <SaleTimeframesSection
            job={job}
            onUpdate={loadItem}
          />
        )}

        {job && (
          <HaulerVideosSection
            job={job}
            onUpdate={loadItem}
          />
        )}

        {analyzeError && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Analysis Failed
                </p>
                <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {analyzeError}
                </p>
              </div>
              <button
                onClick={() => setAnalyzeError('')}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <AIReviewSection
          item={item}
          newAiItems={newAiItems}
          editedItems={editedItems}
          selectedItems={selectedItems}
          onEditItem={handleEditItem}
          onEditDimension={handleEditDimension}
          onEditWeight={handleEditWeight}
          onEditTags={handleEditTags}
          onToggleSelect={toggleSelectItem}
          onToggleSelectAll={toggleSelectAll}
          onBatchApprove={handleBatchApprove}
          isApproving={isApproving}
          approveError={approveError}
          setApproveError={setApproveError}
        />

        {(!item.photoGroups || item.photoGroups.length === 0) && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              No items uploaded yet
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Add New Item
            </button>
          </div>
        )}
      </div>

      <AnalyzingModal
        isOpen={isAnalyzing}
        itemCount={unanalyzedGroups.length}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadError={uploadError}
        setUploadError={setUploadError}
      />

      <ReopenModal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        onReopen={handleReopen}
        isReopening={isReopening}
        reopenError={reopenError}
        setReopenError={setReopenError}
      />
    </div>
  )
}

export default AgentItemGalleryPage