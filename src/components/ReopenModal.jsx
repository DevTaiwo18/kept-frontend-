import { useState } from 'react'

function ReopenModal({ isOpen, onClose, onReopen, isReopening, reopenError, setReopenError }) {
  const [reopenReason, setReopenReason] = useState('')

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      setReopenError('Please provide a reason for reopening this item')
      return
    }

    await onReopen(reopenReason)
    setReopenReason('')
  }

  const handleClose = () => {
    if (!isReopening) {
      setReopenReason('')
      setReopenError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
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
            onClick={handleClose}
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
  )
}

export default ReopenModal