function StatusBanners({ item, job, hasUnanalyzedGroups, unanalyzedGroups, isApproved }) {
  // Show combined banners side by side when both sale status and approved status need to show
  // Show online sale banners when:
  // - job is in online_sale stage, OR
  // - job is in estate_sale stage (can toggle back to online)
  const showOnlineSaleBanners = job?.stage === 'online_sale' || job?.stage === 'estate_sale'
  const showSaleOffBanner = job && showOnlineSaleBanners && !job.isOnlineSaleActive && isApproved
  const showSaleOnBanner = job && showOnlineSaleBanners && job.isOnlineSaleActive && isApproved

  return (
    <>
      {/* Combined Sale Status + Approved Status Banners - Side by side on large screens */}
      {isApproved && (showSaleOffBanner || showSaleOnBanner) && (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sale Status Banner */}
          {showSaleOffBanner && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-yellow-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    🔴 Online Sale is Currently OFF
                  </h3>
                  <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Items are approved but not visible to clients. Click "🟢 Online Sale: ON" above to make items available for purchase.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showSaleOnBanner && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-green-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ✓ Online Sale is ACTIVE
                  </h3>
                  <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Approved items are now visible and available for clients to purchase online.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approved Items Banner */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-green-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ✓ Items approved and ready for listing
                </h3>
                <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.approvedItems?.length || 0} item(s) approved. You can add more items on behalf of the client. New uploads will require re-analysis and approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Status Banners */}
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

      {/* Standalone approved banner - only shown when no sale status banner is present */}
      {isApproved && !job && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-green-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                ✓ Items approved and ready for listing
              </h3>
              <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.approvedItems?.length || 0} item(s) approved. You can add more items on behalf of the client. New uploads will require re-analysis and approval.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StatusBanners