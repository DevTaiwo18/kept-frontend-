import { useState } from 'react'

function UploadModal({ isOpen, onClose, onUpload, isUploading, uploadError, setUploadError }) {
  const [selectedFiles, setSelectedFiles] = useState([])

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

    await onUpload(selectedFiles)
    setSelectedFiles([])
  }

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([])
      setUploadError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
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
                onClick={handleClose}
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
  )
}

export default UploadModal