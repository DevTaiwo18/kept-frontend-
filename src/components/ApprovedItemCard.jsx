import { useState } from 'react'

function ApprovedItemCard({ approvedItem, item, job, onMarkAsSold }) {
  const [estateSalePrice, setEstateSalePrice] = useState('')
  const [isMarking, setIsMarking] = useState(false)
  const [error, setError] = useState('')

  const photoIndices = approvedItem.photoIndices || []
  const isSold = photoIndices.some(photoIdx => item.soldPhotoIndices?.includes(photoIdx))
  const isDonated = photoIndices.some(photoIdx => item.donatedPhotoIndices?.includes(photoIdx))
  const isHauled = photoIndices.some(photoIdx => item.hauledPhotoIndices?.includes(photoIdx))

  // Only show estate sale controls if job is in estate_sale stage and item is not sold/donated/hauled
  const isInEstateSaleStage = job?.stage === 'estate_sale'
  const showEstateSaleControls = job && isInEstateSaleStage && !isSold && !isDonated && !isHauled

  const handleMarkAsSold = async () => {
    if (!estateSalePrice || parseFloat(estateSalePrice) <= 0) {
      setError('Please enter a valid sale price')
      return
    }

    try {
      setIsMarking(true)
      setError('')
      await onMarkAsSold(approvedItem.itemNumber, parseFloat(estateSalePrice))
      setEstateSalePrice('')
    } catch (err) {
      setError(err.message || 'Failed to mark as sold')
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
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
            <div>
              <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                SOLD ✓
              </span>
              {approvedItem.estateSalePrice && (
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sold for: ${approvedItem.estateSalePrice}
                </span>
              )}
            </div>
          ) : isDonated ? (
            <div>
              <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm block" style={{ fontFamily: 'Inter, sans-serif' }}>
                DONATED ✓
              </span>
            </div>
          ) : isHauled ? (
            <div>
              <span className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm block" style={{ fontFamily: 'Inter, sans-serif' }}>
                HAULED ✓
              </span>
            </div>
          ) : (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              ${approvedItem.price || '0'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {photoIndices.map((photoIdx, photoIndex) => {
          const isPhotoSold = item.soldPhotoIndices?.includes(photoIdx)
          const isPhotoDonated = item.donatedPhotoIndices?.includes(photoIdx)
          const isPhotoHauled = item.hauledPhotoIndices?.includes(photoIdx)
          const isPhotoUnavailable = isPhotoSold || isPhotoDonated || isPhotoHauled
          return (
            <div key={photoIndex} className="relative group">
              <img
                src={item.photos[photoIdx]}
                alt={`${approvedItem.title} - Photo ${photoIndex + 1}`}
                className={`w-full h-48 object-cover rounded-lg border-2 transition-all cursor-pointer ${
                  isPhotoUnavailable
                    ? 'border-gray-300 opacity-60 grayscale'
                    : 'border-gray-200 hover:border-[#e6c35a]'
                }`}
                onClick={() => !isPhotoUnavailable && window.open(item.photos[photoIdx], '_blank')}
              />
              {isPhotoSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                    SOLD
                  </div>
                </div>
              )}
              {isPhotoDonated && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                    DONATED
                  </div>
                </div>
              )}
              {isPhotoHauled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <div className="bg-orange-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                    HAULED
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none"></div>
            </div>
          )
        })}
      </div>

      {showEstateSaleControls && (
        <div className="border-t-2 border-gray-100 pt-4">
          <h5 className="text-sm font-bold text-[#101010] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            🏠 Estate Transition Controls
          </h5>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Actual Sale Price ($)
              </label>
              <input
                type="number"
                value={estateSalePrice}
                onChange={(e) => setEstateSalePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                disabled={isMarking}
              />
              <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Online price: ${approvedItem.price || '0'}
              </p>
            </div>
            <button
              onClick={handleMarkAsSold}
              disabled={isMarking || !estateSalePrice}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isMarking ? '⏳ Marking...' : '✓ Mark as Sold'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovedItemCard