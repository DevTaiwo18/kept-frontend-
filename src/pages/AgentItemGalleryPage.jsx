import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getItemById, uploadItemPhotos, analyzeItem, approveItem, reopenItem } from '../utils/itemsApi'
import logo from '../assets/Kept House _transparent logo .png'

function AgentItemGalleryPage() {
  const { id } = useParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [approveError, setApproveError] = useState('')
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [isReopening, setIsReopening] = useState(false)
  const [reopenError, setReopenError] = useState('')
  const [editedItems, setEditedItems] = useState({})
  const [selectedItems, setSelectedItems] = useState({})
  const [expandedItem, setExpandedItem] = useState(null)

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  useEffect(() => {
    loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getItemById(id)
      setItem(data)

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

  const analyzedGroupIndices = new Set(item?.analyzedGroupIndices || [])
  const unanalyzedGroups = item?.photoGroups?.filter(group => !analyzedGroupIndices.has(group.itemNumber)) || []
  const hasUnanalyzedGroups = unanalyzedGroups.length > 0
  const canUpload = true
  const canAnalyze = item && (item.status === 'draft' || item.status === 'needs_review') && hasUnanalyzedGroups

  const approvedItemNumbers = new Set(
    (item?.approvedItems || []).map(approvedItem => approvedItem.itemNumber)
  )
  const newAiItems = (item?.ai || []).filter(
    aiItem => !approvedItemNumbers.has(aiItem.itemNumber)
  )

  const canApprove = item && (item.status === 'draft' || item.status === 'needs_review') && newAiItems.length > 0
  const isApproved = item && item.status === 'approved'

  const handleAnalyze = async () => {
    if (!canAnalyze) return

    try {
      setIsAnalyzing(true)
      setAnalyzeError('')
      const response = await analyzeItem(id)
      await loadItem()
      setIsAnalyzing(false)
    } catch (err) {
      setIsAnalyzing(false)
      setAnalyzeError(err.message || 'Failed to analyze item')
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

  const handleBatchApprove = async () => {
    if (!canApprove) return

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

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      setReopenError('Please provide a reason for reopening this item')
      return
    }

    try {
      setIsReopening(true)
      setReopenError('')
      await reopenItem(id, reopenReason)
      await loadItem()
      setShowReopenModal(false)
      setReopenReason('')
    } catch (err) {
      setReopenError(err.message || 'Failed to reopen item')
    } finally {
      setIsReopening(false)
    }
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

    try {
      setIsUploading(true)
      setUploadError('')
      await uploadItemPhotos(id, selectedFiles)
      await loadItem()
      setShowUploadModal(false)
      setSelectedFiles([])
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const getPhotosForGroup = (group) => {
    if (!item || !item.photos) return []
    return item.photos.slice(group.startIndex, group.endIndex + 1)
  }

  const selectedCount = Object.values(selectedItems).filter(v => v).length
  const totalNewItems = newAiItems.length

  const allSelectedHavePrice = Object.keys(selectedItems).every(itemNumber => {
    if (!selectedItems[itemNumber]) return true
    const price = editedItems[itemNumber]?.price
    return price && price.toString().trim() !== '' && parseFloat(price) > 0
  })

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
          <div className="flex gap-3">
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

        {item.status === 'draft' && !item.ai && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              📸 Ready to analyze
            </p>
            <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Client has uploaded items. When all items are uploaded, run AI analysis below to generate listings.
            </p>
          </div>
        )}

        {item.status === 'draft' && item.ai && item.ai.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              ⚠️ Review AI results before approving
            </p>
            <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Review AI details below. Edit anything (title, category, price, dimensions), then select items to approve.
            </p>
          </div>
        )}

        {item.status === 'needs_review' && hasUnanalyzedGroups && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.approvedItems && item.approvedItems.length > 0 ? '🔄 New items need AI analysis' : '📸 Ready to analyze'}
            </p>
            <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.approvedItems && item.approvedItems.length > 0
                ? `${unanalyzedGroups.length} new item(s) uploaded. Run AI analysis below to process only the new items. Previously approved items remain unchanged.`
                : `${unanalyzedGroups.length} item(s) uploaded. Run AI analysis below to get started.`
              }
            </p>
          </div>
        )}

        {item.status === 'needs_review' && !hasUnanalyzedGroups && item.approvedItems && item.approvedItems.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔄 Item reopened for changes
            </p>
            <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              This item was reopened. Review and approve the analyzed items below. You can also upload more items if needed.
            </p>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              ✓ Items approved and ready for listing
            </p>
            <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.approvedItems?.length || 0} item(s) approved. You can add more items on behalf of the client. New uploads will require re-analysis and approval.
            </p>
          </div>
        )}

        {isApproved && item.approvedItems && item.approvedItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Approved & Listed Items
            </h3>
            <div className="space-y-6">
              {item.approvedItems.map((approvedItem, idx) => {
                const photoIndices = approvedItem.photoIndices || []
                const isSold = photoIndices.some(photoIdx => item.soldPhotoIndices?.includes(photoIdx))

                return (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {approvedItem.title || `Item ${approvedItem.itemNumber}`}
                        </h4>
                        {approvedItem.description && (
                          <p className="text-sm text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {approvedItem.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          {approvedItem.category && (
                            <span className="text-xs bg-[#e6c35a]/20 px-3 py-1 rounded text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {approvedItem.category}
                            </span>
                          )}
                          {approvedItem.material && (
                            <span className="text-xs bg-blue-100 px-3 py-1 rounded text-blue-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {approvedItem.material}
                            </span>
                          )}
                          <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {photoIndices.length} photo(s)
                          </span>
                        </div>
                        {approvedItem.dimensions && (approvedItem.dimensions.length || approvedItem.dimensions.width || approvedItem.dimensions.height) && (
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            📏 {approvedItem.dimensions.length || '?'}" × {approvedItem.dimensions.width || '?'}" × {approvedItem.dimensions.height || '?'}"
                            {approvedItem.weight?.value && ` • ⚖️ ${approvedItem.weight.value} ${approvedItem.weight.unit || 'lbs'}`}
                          </p>
                        )}
                        {approvedItem.tags && approvedItem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {approvedItem.tags.map((tag, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {isSold ? (
                          <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                            SOLD ✓
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                            ${approvedItem.price || '0'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {photoIndices.map((photoIdx, photoIndex) => {
                        const isPhotoSold = item.soldPhotoIndices?.includes(photoIdx)
                        return (
                          <div key={photoIndex} className="relative group">
                            <img
                              src={item.photos[photoIdx]}
                              alt={`${approvedItem.title} - Photo ${photoIndex + 1}`}
                              className={`w-full h-48 object-cover rounded-lg border-2 transition-all cursor-pointer ${isPhotoSold
                                  ? 'border-gray-300 opacity-60 grayscale'
                                  : 'border-gray-200 hover:border-[#e6c35a]'
                                }`}
                              onClick={() => !isPhotoSold && window.open(item.photos[photoIdx], '_blank')}
                            />
                            {isPhotoSold && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                                <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  SOLD
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {hasUnanalyzedGroups && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                New Items ({unanalyzedGroups.length})
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-[#101010] text-[#F8F5F0] rounded-lg font-semibold hover:bg-[#707072] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                🤖 Analyze {unanalyzedGroups.length} New Item{unanalyzedGroups.length !== 1 ? 's' : ''}
              </button>
            </div>
            <div className="space-y-4">
              {unanalyzedGroups.map((group) => {
                const groupPhotos = getPhotosForGroup(group)
                return (
                  <div key={group.itemNumber} className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200">
                    <h4 className="text-md font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {group.title}
                    </h4>
                    <p className="text-sm text-[#707072] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {group.photoCount} photo(s)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {groupPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`${group.title} - Photo ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg border-2 border-blue-200 hover:border-[#e6c35a] transition-all cursor-pointer"
                            onClick={() => window.open(photo, '_blank')}
                          />
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                            New
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {newAiItems.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Review AI Analysis
              </h3>
            </div>

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

            {newAiItems.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ✓ AI Analysis Complete! {totalNewItems} item{totalNewItems !== 1 ? 's' : ''} analyzed
                      </p>
                      <p className="text-xs text-green-700 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {selectedCount} selected for approval
                        {item.approvedItems && item.approvedItems.length > 0 && ` • ${item.approvedItems.length} already approved`}
                      </p>
                    </div>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs px-3 py-1.5 bg-white border border-green-300 rounded text-green-800 hover:bg-green-50"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {Object.values(selectedItems).every(v => v) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newAiItems.map((aiItem) => {
                    const groupPhotos = aiItem.photoIndices.map(idx => item.photos[idx])
                    const firstPhoto = groupPhotos[0]
                    
                    return (
                      <div
                        key={aiItem.itemNumber}
                        className={`border-2 rounded-lg overflow-hidden transition-all ${selectedItems[aiItem.itemNumber] ? 'border-[#e6c35a] bg-white' : 'border-gray-200 bg-gray-50'
                          }`}
                      >
                        <div className="relative">
                          <img
                            src={firstPhoto}
                            alt={`Item ${aiItem.itemNumber}`}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => window.open(firstPhoto, '_blank')}
                          />
                          <div className="absolute top-2 left-2">
                            <input
                              type="checkbox"
                              checked={selectedItems[aiItem.itemNumber] || false}
                              onChange={() => toggleSelectItem(aiItem.itemNumber)}
                              className="w-5 h-5 rounded border-2 border-white cursor-pointer"
                            />
                          </div>
                          {aiItem.confidence && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {Math.round(aiItem.confidence * 100)}%
                            </div>
                          )}
                          {groupPhotos.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-[#e6c35a] text-black text-xs px-2 py-1 rounded font-bold">
                              {groupPhotos.length} photos
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Title
                            </label>
                            <input
                              type="text"
                              value={editedItems[aiItem.itemNumber]?.title || ''}
                              onChange={(e) => handleEditItem(aiItem.itemNumber, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                              placeholder="Item title"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Category
                              </label>
                              <select
                                value={editedItems[aiItem.itemNumber]?.category || ''}
                                onChange={(e) => handleEditItem(aiItem.itemNumber, 'category', e.target.value)}
                                className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                <option value="">Select</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Tools">Tools</option>
                                <option value="Jewelry">Jewelry</option>
                                <option value="Art">Art</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Outdoor">Outdoor</option>
                                <option value="Appliances">Appliances</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Collectibles">Collectibles</option>
                                <option value="Books/Media">Books/Media</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Misc">Misc</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Final Price ($)
                              </label>
                              <input
                                type="number"
                                value={editedItems[aiItem.itemNumber]?.price || ''}
                                onChange={(e) => handleEditItem(aiItem.itemNumber, 'price', e.target.value)}
                                className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                                placeholder="0.00"
                              />
                              {(editedItems[aiItem.itemNumber]?.priceLow || editedItems[aiItem.itemNumber]?.priceHigh) && (
                                <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  AI Range: ${editedItems[aiItem.itemNumber]?.priceLow || 0} - ${editedItems[aiItem.itemNumber]?.priceHigh || 0}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedItem(expandedItem === aiItem.itemNumber ? null : aiItem.itemNumber)}
                            className="w-full text-xs text-[#101010] hover:text-[#e6c35a] font-semibold"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {expandedItem === aiItem.itemNumber ? '▲ Less' : '▼ More Details'}
                          </button>

                          {expandedItem === aiItem.itemNumber && (
                            <div className="pt-2 border-t border-gray-200 space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Description
                                </label>
                                <textarea
                                  rows="3"
                                  value={editedItems[aiItem.itemNumber]?.description || ''}
                                  onChange={(e) => handleEditItem(aiItem.itemNumber, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a] resize-none"
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                  placeholder="Item description"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Dimensions (L × W × H in inches)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    value={editedItems[aiItem.itemNumber]?.dimensions?.length || ''}
                                    onChange={(e) => handleEditDimension(aiItem.itemNumber, 'length', e.target.value)}
                                    className="w-full px-2 py-2 border border-[#707072]/30 rounded-lg text-xs focus:outline-none focus:border-[#e6c35a]"
                                    placeholder="L"
                                  />
                                  <input
                                    type="number"
                                    value={editedItems[aiItem.itemNumber]?.dimensions?.width || ''}
                                    onChange={(e) => handleEditDimension(aiItem.itemNumber, 'width', e.target.value)}
                                    className="w-full px-2 py-2 border border-[#707072]/30 rounded-lg text-xs focus:outline-none focus:border-[#e6c35a]"
                                    placeholder="W"
                                  />
                                  <input
                                    type="number"
                                    value={editedItems[aiItem.itemNumber]?.dimensions?.height || ''}
                                    onChange={(e) => handleEditDimension(aiItem.itemNumber, 'height', e.target.value)}
                                    className="w-full px-2 py-2 border border-[#707072]/30 rounded-lg text-xs focus:outline-none focus:border-[#e6c35a]"
                                    placeholder="H"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Weight (lbs)
                                  </label>
                                  <input
                                    type="number"
                                    value={editedItems[aiItem.itemNumber]?.weight?.value || ''}
                                    onChange={(e) => handleEditWeight(aiItem.itemNumber, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a]"
                                    placeholder="0"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Material
                                  </label>
                                  <input
                                    type="text"
                                    value={editedItems[aiItem.itemNumber]?.material || ''}
                                    onChange={(e) => handleEditItem(aiItem.itemNumber, 'material', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a]"
                                    placeholder="Wood, Metal, etc."
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Tags (comma-separated)
                                </label>
                                <input
                                  type="text"
                                  value={editedItems[aiItem.itemNumber]?.tags?.join(', ') || ''}
                                  onChange={(e) => handleEditTags(aiItem.itemNumber, e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                  className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a]"
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                  placeholder="Mid-Century Modern, Teak, Danish Design"
                                />
                                <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Use specific tags like "Herman Miller" not generic like "Furniture"
                                </p>
                              </div>
                              
                              {groupPhotos.length > 1 && (
                                <div>
                                  <label className="block text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    All Photos ({groupPhotos.length})
                                  </label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {groupPhotos.map((photo, idx) => (
                                      <img
                                        key={idx}
                                        src={photo}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded border border-gray-300 cursor-pointer hover:border-[#e6c35a]"
                                        onClick={() => window.open(photo, '_blank')}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {canApprove && (
                  <div className="sticky bottom-0 bg-[#F8F5F0] pt-4 pb-2">
                    {item.status === 'needs_review' && item.approvedItems && item.approvedItems.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          💡 <strong>Tip:</strong> Approving will add {selectedCount} new item{selectedCount !== 1 ? 's' : ''} to your existing {item.approvedItems.length} approved item{item.approvedItems.length !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleBatchApprove}
                      disabled={isApproving || selectedCount === 0 || !allSelectedHavePrice}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {isApproving ? 'Approving...' : `✓ Approve ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
                    </button>

                    {!allSelectedHavePrice && selectedCount > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                          ⚠️ <strong>Missing Prices:</strong> Please enter a final price for all selected items before approving.
                        </p>
                      </div>
                    )}

                    {approveError && (
                      <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 text-xl">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Approval Failed
                            </p>
                            <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {approveError}
                            </p>
                          </div>
                          <button
                            onClick={() => setApproveError('')}
                            className="text-red-400 hover:text-red-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {item.photoGroups && item.photoGroups.length > 0 &&
          item.status === 'draft' &&
          !item.ai &&
          !item.approvedItems?.length &&
          !hasUnanalyzedGroups && (
            <div>
              <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Uploaded Items
              </h3>
              <div className="space-y-6">
                {item.photoGroups.map((group) => {
                  const groupPhotos = getPhotosForGroup(group)
                  return (
                    <div key={group.itemNumber} className="bg-white p-6 rounded-xl shadow-md">
                      <h4 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {group.title}
                      </h4>
                      <p className="text-sm text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {group.photoCount} photo(s)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {groupPhotos.map((photo, photoIdx) => (
                          <div key={photoIdx} className="relative group">
                            <img
                              src={photo}
                              alt={`${group.title} - Photo ${photoIdx + 1}`}
                              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-[#e6c35a] transition-all cursor-pointer"
                              onClick={() => window.open(photo, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        {(!item.photoGroups || item.photoGroups.length === 0) && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              No items uploaded yet
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Add New Item
              </button>
            )}
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-[#101010]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F5F0] rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-[#e6c35a]">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#707072]/20 border-t-[#e6c35a] rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                    🤖
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#101010] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                AI Analysis in Progress
              </h3>

              <div className="bg-white/60 rounded-lg p-4 mb-4 border-2 border-[#e6c35a]/30">
                <p className="text-base text-[#101010] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Analyzing {unanalyzedGroups.length} item{unanalyzedGroups.length !== 1 ? 's' : ''}...
                </p>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Our AI is examining each item to generate accurate descriptions, categories, pricing, dimensions, and smart tags.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 mb-4 border-2 border-[#e6c35a]">
                <p className="text-sm font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ⚠️ Please Do Not Close This Tab
                </p>
                <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  This process typically takes 30-60 seconds.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReopenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Reopen Item for Edits
            </h3>

            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>⚠️ Important:</strong> Reopening this item will change its status to "Needs Review" and re-enable photo uploads and AI analysis.
              </p>
            </div>

            {reopenError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {reopenError}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Reason for Reopening *
              </label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="e.g., Need to add more photos, pricing adjustment required, etc."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowReopenModal(false)
                  setReopenReason('')
                  setReopenError('')
                }}
                disabled={isReopening}
                className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={isReopening || !reopenReason.trim()}
                className="w-full sm:flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isReopening ? 'Reopening...' : 'Reopen Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
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
                    💡 <strong>Agent Upload:</strong> You're uploading on behalf of the client. These photos will be grouped together as a new item. Upload at least 4 clear photos showing different angles for best AI results.
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
                      {selectedFiles.length} file(s) selected
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

export default AgentItemGalleryPage