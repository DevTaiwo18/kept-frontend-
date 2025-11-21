function UnanalyzedItemsList({ unanalyzedGroups, item, onAnalyze, isAnalyzing }) {
  const getPhotosForGroup = (group) => {
    if (!item || !item.photos) return []
    return item.photos.slice(group.startIndex, group.endIndex + 1)
  }

  if (unanalyzedGroups.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
          New Items ({unanalyzedGroups.length})
        </h3>
        <button
          onClick={onAnalyze}
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
  )
}

export default UnanalyzedItemsList