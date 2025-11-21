import { useState } from 'react'

function AIItemCard({ 
  aiItem, 
  item, 
  editedItems, 
  selectedItems, 
  onEditItem, 
  onEditDimension, 
  onEditWeight, 
  onEditTags, 
  onToggleSelect 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const groupPhotos = aiItem.photoIndices.map(idx => item.photos[idx])
  const firstPhoto = groupPhotos[0]
  const isSelected = selectedItems[aiItem.itemNumber] || false
  const editedItem = editedItems[aiItem.itemNumber] || {}

  return (
    <div
      className={`border-2 rounded-lg overflow-hidden transition-all ${
        isSelected ? 'border-[#e6c35a] bg-white' : 'border-gray-200 bg-gray-50'
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
            checked={isSelected}
            onChange={() => onToggleSelect(aiItem.itemNumber)}
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
            value={editedItem.title || ''}
            onChange={(e) => onEditItem(aiItem.itemNumber, 'title', e.target.value)}
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
              value={editedItem.category || ''}
              onChange={(e) => onEditItem(aiItem.itemNumber, 'category', e.target.value)}
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
              value={editedItem.price || ''}
              onChange={(e) => onEditItem(aiItem.itemNumber, 'price', e.target.value)}
              className="w-full px-3 py-2 border border-[#707072]/30 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="0.00"
            />
            {(editedItem.priceLow || editedItem.priceHigh) && (
              <p className="text-xs text-[#707072] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                AI Range: ${editedItem.priceLow || 0} - ${editedItem.priceHigh || 0}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-[#101010] hover:text-[#e6c35a] font-semibold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isExpanded ? '▲ Less' : '▼ More Details'}
        </button>

        {isExpanded && (
          <div className="pt-2 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Description
              </label>
              <textarea
                rows="3"
                value={editedItem.description || ''}
                onChange={(e) => onEditItem(aiItem.itemNumber, 'description', e.target.value)}
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
                  value={editedItem.dimensions?.length || ''}
                  onChange={(e) => onEditDimension(aiItem.itemNumber, 'length', e.target.value)}
                  className="w-full px-2 py-2 border border-[#707072]/30 rounded-lg text-xs focus:outline-none focus:border-[#e6c35a]"
                  placeholder="L"
                />
                <input
                  type="number"
                  value={editedItem.dimensions?.width || ''}
                  onChange={(e) => onEditDimension(aiItem.itemNumber, 'width', e.target.value)}
                  className="w-full px-2 py-2 border border-[#707072]/30 rounded-lg text-xs focus:outline-none focus:border-[#e6c35a]"
                  placeholder="W"
                />
                <input
                  type="number"
                  value={editedItem.dimensions?.height || ''}
                  onChange={(e) => onEditDimension(aiItem.itemNumber, 'height', e.target.value)}
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
                  value={editedItem.weight?.value || ''}
                  onChange={(e) => onEditWeight(aiItem.itemNumber, 'value', e.target.value)}
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
                  value={editedItem.material || ''}
                  onChange={(e) => onEditItem(aiItem.itemNumber, 'material', e.target.value)}
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
                value={editedItem.tags?.join(', ') || ''}
                onChange={(e) => onEditTags(aiItem.itemNumber, e.target.value.split(',').map(t => t.trim()).filter(t => t))}
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
}

export default AIItemCard