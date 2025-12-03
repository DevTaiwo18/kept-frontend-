import AIItemCard from './AIItemCard'

function AIReviewSection({
  item,
  newAiItems,
  editedItems,
  selectedItems,
  onEditItem,
  onEditDimension,
  onEditWeight,
  onEditTags,
  onToggleSelect,
  onToggleSelectAll,
  onBatchApprove,
  isApproving,
  approveError,
  setApproveError,
  isInFinalStage
}) {
  const selectedCount = Object.values(selectedItems).filter(v => v).length
  const totalNewItems = newAiItems.length

  const allSelectedHavePrice = Object.keys(selectedItems).every(itemNumber => {
    if (!selectedItems[itemNumber]) return true
    const price = editedItems[itemNumber]?.price
    return price && price.toString().trim() !== '' && parseFloat(price) > 0
  })

  if (newAiItems.length === 0) return null

  return (
    <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Review AI Analysis
        </h3>
      </div>

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
            {!isInFinalStage && (
              <button
                onClick={onToggleSelectAll}
                className="text-xs px-3 py-1.5 bg-white border border-green-300 rounded text-green-800 hover:bg-green-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {Object.values(selectedItems).every(v => v) ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newAiItems.map((aiItem) => (
            <AIItemCard
              key={aiItem.itemNumber}
              aiItem={aiItem}
              item={item}
              editedItems={editedItems}
              selectedItems={selectedItems}
              onEditItem={onEditItem}
              onEditDimension={onEditDimension}
              onEditWeight={onEditWeight}
              onEditTags={onEditTags}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>

        <div className="sticky bottom-0 bg-[#F8F5F0] pt-4 pb-2">
          {item.status === 'needs_review' && item.approvedItems && item.approvedItems.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 <strong>Tip:</strong> Approving will add {selectedCount} new item{selectedCount !== 1 ? 's' : ''} to your existing {item.approvedItems.length} approved item{item.approvedItems.length !== 1 ? 's' : ''}.
              </p>
            </div>
          )}

          {!isInFinalStage && (
            <button
              onClick={onBatchApprove}
              disabled={isApproving || selectedCount === 0 || !allSelectedHavePrice}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isApproving ? 'Approving...' : `✓ Approve ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
            </button>
          )}

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
      </div>
    </div>
  )
}

export default AIReviewSection