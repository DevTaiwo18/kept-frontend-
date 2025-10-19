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
        const approvedPhotoIndices = new Set(
          (data.approvedItems || []).map(item => item.photoIndex)
        )
        
        const newAiItems = data.ai.filter(
          aiItem => !approvedPhotoIndices.has(aiItem.photoIndex)
        )
        
        const edited = {}
        const selected = {}
        newAiItems.forEach((aiItem, index) => {
          const originalIndex = data.ai.indexOf(aiItem)
          edited[originalIndex] = {
            title: aiItem.title || '',
            description: aiItem.description || '',
            category: aiItem.category || '',
            priceLow: aiItem.priceLow || '',
            priceHigh: aiItem.priceHigh || '',
            price: aiItem.price || ''
          }
          selected[originalIndex] = true 
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

  const analyzedIndices = new Set(item?.analyzedPhotoIndices || [])
  const unanalyzedPhotos = item?.photos?.filter((_, idx) => !analyzedIndices.has(idx)) || []
  const hasUnanalyzedPhotos = unanalyzedPhotos.length > 0
  const canUpload = true
  const canAnalyze = item && (item.status === 'draft' || item.status === 'needs_review') && hasUnanalyzedPhotos
  
  const approvedPhotoIndices = new Set(
    (item?.approvedItems || []).map(item => item.photoIndex)
  )
  const newAiItems = (item?.ai || []).filter(
    aiItem => !approvedPhotoIndices.has(aiItem.photoIndex)
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

  const handleEditItem = (index, field, value) => {
    setEditedItems(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }))
  }

  const toggleSelectItem = (index) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: !prev[index]
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
      Object.keys(selectedItems).forEach(index => {
        if (selectedItems[index]) {
          itemsToApprove.push({
            photoIndex: parseInt(index),
            ...editedItems[index]
          })
        }
      })

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

  const selectedCount = Object.values(selectedItems).filter(v => v).length
  const totalNewItems = newAiItems.length

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
                {item.photos?.length || 0} photo(s)
              </p>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'approved' ? 'bg-green-100 text-green-800' :
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
              + Upload Photos
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
              Ask the client to upload all photos for this project before running AI. You can also upload on their behalf. When everything looks good, run AI analysis below.
            </p>
          </div>
        )}

        {item.status === 'draft' && item.ai && item.ai.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              ⚠️ Review AI results before approving
            </p>
            <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Review AI details below. Edit anything (title, category, price), then select items to approve. Once approved, client uploads are locked.
            </p>
          </div>
        )}

        {item.status === 'needs_review' && hasUnanalyzedPhotos && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔄 New photos need AI analysis
            </p>
            <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {unanalyzedPhotos.length} new photo(s) uploaded. Run AI analysis below to process only the new photos. Previously approved items remain unchanged.
            </p>
          </div>
        )}

        {item.status === 'needs_review' && !hasUnanalyzedPhotos && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔄 Item reopened for changes
            </p>
            <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              This item was reopened. Review and approve the analyzed items below. You can also upload more photos if needed.
            </p>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              ✓ Items approved and ready for listing
            </p>
            <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.approvedItems?.length || 0} item(s) approved. You can add more photos on behalf of the client. New uploads will require re-analysis and approval.
            </p>
          </div>
        )}

        {item.approvedItems && item.approvedItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Previously Approved Items ({item.approvedItems.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {item.approvedItems.map((approvedItem, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={item.photos[approvedItem.photoIndex]}
                    alt={approvedItem.title || `Item ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-lg border-2 border-green-200 hover:border-[#e6c35a] transition-all cursor-pointer"
                    onClick={() => window.open(item.photos[approvedItem.photoIndex], '_blank')}
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    ✓ Approved
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg p-3 flex flex-col justify-end">
                    <p className="text-white text-sm font-bold line-clamp-2 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {approvedItem.title || 'Untitled'}
                    </p>
                    {approvedItem.description && (
                      <p className="text-white/90 text-xs line-clamp-2 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {approvedItem.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ${approvedItem.price || '0'}
                      </p>
                      {approvedItem.category && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {approvedItem.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasUnanalyzedPhotos && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                New Photos ({unanalyzedPhotos.length})
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-[#101010] text-[#F8F5F0] rounded-lg font-semibold hover:bg-[#707072] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                🤖 Analyze {unanalyzedPhotos.length} New Photo{unanalyzedPhotos.length !== 1 ? 's' : ''}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {item.photos.map((photo, idx) => {
                if (analyzedIndices.has(idx)) return null
                return (
                  <div key={idx} className="relative group">
                    <img 
                      src={photo} 
                      alt={`New Photo ${idx + 1}`} 
                      className="w-full h-64 object-cover rounded-lg border-2 border-blue-200 hover:border-[#e6c35a] transition-all cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                      New
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
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
                        ✓ AI Analysis Complete! {totalNewItems} new item{totalNewItems !== 1 ? 's' : ''} to review
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
                  {newAiItems.map((aiItem, displayIndex) => {
                    const originalIndex = item.ai.indexOf(aiItem)
                    return (
                    <div 
                      key={originalIndex} 
                      className={`border-2 rounded-lg overflow-hidden transition-all ${
                        selectedItems[originalIndex] ? 'border-[#e6c35a] bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={aiItem.photoUrl || item.photos[aiItem.photoIndex]} 
                          alt={`Item ${displayIndex + 1}`}
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => window.open(aiItem.photoUrl || item.photos[aiItem.photoIndex], '_blank')}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedItems[originalIndex] || false}
                            onChange={() => toggleSelectItem(originalIndex)}
                            className="w-5 h-5 rounded border-2 border-white cursor-pointer"
                          />
                        </div>
                        {aiItem.confidence && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {Math.round(aiItem.confidence * 100)}%
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
                            value={editedItems[originalIndex]?.title || ''}
                            onChange={(e) => handleEditItem(originalIndex, 'title', e.target.value)}
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
                              value={editedItems[originalIndex]?.category || ''}
                              onChange={(e) => handleEditItem(originalIndex, 'category', e.target.value)}
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
                              value={editedItems[originalIndex]?.price || ''}
                              onChange={(e) => handleEditItem(originalIndex, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                              placeholder="0.00"
                            />
                            {(editedItems[originalIndex]?.priceLow || editedItems[originalIndex]?.priceHigh) && (
                              <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                AI Range: ${editedItems[originalIndex]?.priceLow || 0} - ${editedItems[originalIndex]?.priceHigh || 0}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedItem(expandedItem === originalIndex ? null : originalIndex)}
                          className="w-full text-xs text-[#101010] hover:text-[#e6c35a] font-semibold"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {expandedItem === originalIndex ? '▲ Less' : '▼ More Details'}
                        </button>

                        {expandedItem === originalIndex && (
                          <div className="pt-2 border-t border-gray-200 space-y-2">
                            <div>
                              <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Description
                              </label>
                              <textarea
                                rows="3"
                                value={editedItems[originalIndex]?.description || ''}
                                onChange={(e) => handleEditItem(originalIndex, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a] resize-none"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                                placeholder="Item description"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
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
                      disabled={isApproving || selectedCount === 0}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {isApproving ? 'Approving...' : `✓ Approve ${selectedCount} Selected Item${selectedCount !== 1 ? 's' : ''}`}
                    </button>

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

        {item.photos && item.photos.length > 0 && (isApproved || !item.ai || item.ai.length === 0) && !item.approvedItems?.length && (
          <div>
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Uploaded Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {item.photos.map((photo, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 hover:border-[#e6c35a] transition-all cursor-pointer"
                    onClick={() => window.open(photo, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.photos && item.photos.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              No photos uploaded yet
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Upload Photos
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
                  Analyzing {unanalyzedPhotos.length} photo{unanalyzedPhotos.length !== 1 ? 's' : ''}...
                </p>
                <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Our AI is examining each image individually to generate accurate descriptions, categories, and pricing estimates.
                  {item.analyzedPhotoIndices && item.analyzedPhotoIndices.length > 0 && (
                    <span className="block mt-1 text-green-700 font-semibold">
                      {item.analyzedPhotoIndices.length} photo(s) already analyzed and will be skipped.
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 mb-4 border-2 border-[#e6c35a]">
                <p className="text-sm font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ⚠️ Please Do Not Close This Tab
                </p>
                <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {unanalyzedPhotos.length > 20 
                    ? 'Large photo batches may take several minutes to analyze.'
                    : 'This process typically takes 30-60 seconds.'}
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
              Upload More Photos
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

export default AgentItemGalleryPage