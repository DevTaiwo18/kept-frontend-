import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getItemById, uploadItemPhotos } from '../utils/itemsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientItemGalleryPage() {
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

  const handleLogout = () => {
    clearAuth()
    navigate('/')
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
    } catch (err) {
      setError(err.message || 'Failed to load item')
    } finally {
      setIsLoading(false)
    }
  }

  const canUpload = item && (item.status === 'draft' || item.status === 'needs_review')
  const isApproved = item && item.status === 'approved'

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

    if (!canUpload) {
      setUploadError('This item is approved. Contact your agent to add more photos.')
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
      console.error('Upload failed:', err)
      setUploadError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const getPhotosForGroup = (group) => {
    if (!item || !item.photos) return []
    return item.photos.slice(group.startIndex, group.endIndex + 1)
  }

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
        <button
          onClick={() => navigate(-1)}
          className="text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Project
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
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'needs_review' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                  }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.status === 'draft' ? 'Awaiting Review' :
                  item.status === 'needs_review' ? 'Needs Review' :
                    item.status === 'approved' ? 'Approved' :
                      item.status}
              </span>
            </div>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              + Add New Item
            </button>
          )}
        </div>

        {item.status === 'draft' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              ✓ <strong>Photos uploaded!</strong> Our team will review and list these items soon. You can continue adding more items until your agent approves.
            </p>
          </div>
        )}

        {item.status === 'needs_review' && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              📝 Additional review needed
            </p>
            <p className="text-sm text-orange-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your agent has reopened this item for updates. You can upload additional items or make changes as needed.
            </p>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              ✓ Items approved and ready for listing!
            </p>
          </div>
        )}

        {item.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              ⏳ <strong>Under review:</strong> Your agent is currently reviewing these photos.
            </p>
          </div>
        )}

        {item.photoGroups && item.photoGroups.length > 0 ? (
          <div className="space-y-8">
            {item.photoGroups.map((group, groupIdx) => {
              const groupPhotos = getPhotosForGroup(group)
              const approvedItem = item.approvedItems?.find(ai => ai.itemNumber === group.itemNumber)
              const isSold = approvedItem && item.soldPhotoIndices?.some(idx => 
                idx >= group.startIndex && idx <= group.endIndex
              )

              return (
                <div key={groupIdx} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {group.title}
                      </h2>
                      <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {group.photoCount} photo(s)
                      </p>
                    </div>
                    {isSold && (
                      <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        SOLD ✓
                      </span>
                    )}
                    {approvedItem && !isSold && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ${approvedItem.price || '0'}
                      </span>
                    )}
                  </div>

                  {approvedItem && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      {approvedItem.description && (
                        <p className="text-sm text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {approvedItem.description}
                        </p>
                      )}
                      {approvedItem.category && (
                        <span className="inline-block text-xs bg-[#e6c35a]/20 px-3 py-1 rounded text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {approvedItem.category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupPhotos.map((photo, photoIdx) => {
                      const actualPhotoIndex = group.startIndex + photoIdx
                      const isPhotoSold = item.soldPhotoIndices?.includes(actualPhotoIndex)

                      return (
                        <div key={photoIdx} className="relative group">
                          <img
                            src={photo}
                            alt={`${group.title} - Photo ${photoIdx + 1}`}
                            className={`w-full h-64 object-cover rounded-lg border-2 transition-all cursor-pointer ${
                              isPhotoSold
                                ? 'border-gray-300 opacity-60 grayscale'
                                : 'border-gray-200 hover:border-[#e6c35a]'
                            }`}
                            onClick={() => !isPhotoSold && window.open(photo, '_blank')}
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
        ) : (
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
                    💡 <strong>Tip:</strong> For best marketplace results, we recommend at least 4 clear photos per item showing different angles.
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
                    disabled={selectedFiles.length === 0 || !canUpload}
                    className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}

export default ClientItemGalleryPage