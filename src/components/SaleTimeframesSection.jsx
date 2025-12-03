import { useState } from 'react'
import { updateSaleTimeframes } from '../utils/clientJobsApi'

function SaleTimeframesSection({ job, onUpdate, isInFinalStage }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    onlineSaleStartDate: job?.onlineSaleStartDate ? new Date(job.onlineSaleStartDate).toISOString().split('T')[0] : '',
    onlineSaleEndDate: job?.onlineSaleEndDate ? new Date(job.onlineSaleEndDate).toISOString().split('T')[0] : '',
    estateSaleDate: job?.estateSaleDate ? new Date(job.estateSaleDate).toISOString().split('T')[0] : '',
    estateSaleStartTime: job?.estateSaleStartTime || '',
    estateSaleEndTime: job?.estateSaleEndTime || ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      
      await updateSaleTimeframes(job._id, {
        onlineSaleStartDate: formData.onlineSaleStartDate || null,
        onlineSaleEndDate: formData.onlineSaleEndDate || null,
        estateSaleDate: formData.estateSaleDate || null,
        estateSaleStartTime: formData.estateSaleStartTime || null,
        estateSaleEndTime: formData.estateSaleEndTime || null
      })
      
      await onUpdate()
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update timeframes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      onlineSaleStartDate: job?.onlineSaleStartDate ? new Date(job.onlineSaleStartDate).toISOString().split('T')[0] : '',
      onlineSaleEndDate: job?.onlineSaleEndDate ? new Date(job.onlineSaleEndDate).toISOString().split('T')[0] : '',
      estateSaleDate: job?.estateSaleDate ? new Date(job.estateSaleDate).toISOString().split('T')[0] : '',
      estateSaleStartTime: job?.estateSaleStartTime || '',
      estateSaleEndTime: job?.estateSaleEndTime || ''
    })
    setIsEditing(false)
    setError('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
          📅 Sale Timeframes
        </h3>
        {!isEditing && !isInFinalStage && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ✏️ Edit Dates
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </p>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-bold text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              🌐 Online Sale Period
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-blue-700 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Start Date
                </p>
                <p className="text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(job?.onlineSaleStartDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  End Date
                </p>
                <p className="text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(job?.onlineSaleEndDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-bold text-purple-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              🏠 Estate Sale Event
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-purple-700 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Date
                </p>
                <p className="text-purple-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(job?.estateSaleDate)}
                </p>
              </div>
              {(job?.estateSaleStartTime || job?.estateSaleEndTime) && (
                <div>
                  <p className="text-xs text-purple-700 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Hours
                  </p>
                  <p className="text-purple-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job?.estateSaleStartTime || '?'} - {job?.estateSaleEndTime || '?'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-bold text-blue-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              🌐 Online Sale Period
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.onlineSaleStartDate}
                  onChange={(e) => handleChange('onlineSaleStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.onlineSaleEndDate}
                  onChange={(e) => handleChange('onlineSaleEndDate', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-bold text-purple-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              🏠 Estate Sale Event
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sale Date
                </label>
                <input
                  type="date"
                  value={formData.estateSaleDate}
                  onChange={(e) => handleChange('estateSaleDate', e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.estateSaleStartTime}
                    onChange={(e) => handleChange('estateSaleStartTime', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.estateSaleEndTime}
                    onChange={(e) => handleChange('estateSaleEndTime', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-[#e6c35a] focus:ring-1 focus:ring-[#e6c35a]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isSaving ? '⏳ Saving...' : '✓ Save Timeframes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaleTimeframesSection