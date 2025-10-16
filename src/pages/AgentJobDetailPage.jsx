import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobById, updateJobStatus } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function AgentJobDetailPage() {
  const { id } = useParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updateError, setUpdateError] = useState('')

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getClientJobById(id)
      setJob(data.job)
      setNewStatus(data.job.stage)
    } catch (err) {
      setError(err.message || 'Failed to load job details')
    } finally {
      setIsLoading(false)
    }
  }

  const stages = [
    { key: 'walkthrough', label: 'Walkthrough' },
    { key: 'staging', label: 'Staging/Prep' },
    { key: 'online_sale', label: 'Online Sale' },
    { key: 'estate_sale', label: 'Estate Sale' },
    { key: 'donations', label: 'Donations' },
    { key: 'hauling', label: 'Hauling' },
    { key: 'payout_processing', label: 'Payout Processing' },
    { key: 'closing', label: 'Closing' }
  ]

  const handleStatusUpdate = async () => {
    if (!statusNote.trim()) {
      alert('Please add a note about this status change')
      return
    }

    try {
      setIsUpdating(true)
      await updateJobStatus(id, newStatus, statusNote)
      await loadJob()
      setShowStatusModal(false)
      setStatusNote('')
    } catch (err) {
      alert(err.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStageIndex = (stage) => {
    return stages.findIndex(s => s.key === stage)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Loading job details...
        </p>
      </div>
    )
  }

  if (error || !job) {
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
              {error || 'Job not found'}
            </p>
            <button
              onClick={() => navigate('/dashboard/agent')}
              className="mt-4 px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentStageIndex = getStageIndex(job.stage)
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100

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
          onClick={() => navigate('/dashboard/agent')}
          className="text-[#707072] hover:text-[#101010] mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {job.contractSignor}
            </h1>
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {job.propertyAddress}
            </p>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Update Status
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Project Progress
          </h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stages[currentStageIndex]?.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#F8F5F0]">
              <div 
                style={{ width: `${progressPercentage}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#e6c35a] transition-all duration-500"
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
            {stages.map((stage, i) => (
              <div 
                key={stage.key} 
                className={`text-center p-2 rounded text-xs ${
                  i <= currentStageIndex ? 'bg-[#e6c35a]/20 text-[#101010] font-semibold' : 'bg-gray-100 text-[#707072]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {stage.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Client Details */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Client Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Client Name</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {job.client?.name || job.contractSignor}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Phone</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {job.contactPhone}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Email</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {job.contactEmail}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Desired Completion</p>
                <p className="text-sm text-[#101010] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(job.desiredCompletionDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Tracker */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Gross Sales</span>
                <span className="text-sm font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(job.finance.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Fees</span>
                <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(job.finance.fees)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Hauling Cost</span>
                <span className="text-sm font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  -{formatCurrency(job.finance.haulingCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-[#e6c35a]/10 -mx-6 px-6 mt-2">
                <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Net Payout</span>
                <span className="text-base font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(job.finance.net)}
                </span>
              </div>
            </div>

            {job.finance.daily && job.finance.daily.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Daily Breakdown
                </p>
                {job.finance.daily.map((day, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Day {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatCurrency(day.sales)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Services Requested
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(job.services).map(([key, value]) => 
              value && (
                <span 
                  key={key} 
                  className="px-3 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-xs font-semibold"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              )
            )}
          </div>
        </div>

        {/* Special Requests */}
        {(job.specialRequests.notForSale || job.specialRequests.restrictedAreas) && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Special Requests
            </h3>
            <div className="space-y-4">
              {job.specialRequests.notForSale && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Items Not for Sale
                  </p>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.specialRequests.notForSale}
                  </p>
                </div>
              )}
              {job.specialRequests.restrictedAreas && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Restricted Areas
                  </p>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.specialRequests.restrictedAreas}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* The Story */}
        {(job.story.owner || job.story.inventory || job.story.property) && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Story
            </h3>
            <div className="space-y-4">
              {job.story.owner && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    About the Owner
                  </p>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.story.owner}
                  </p>
                </div>
              )}
              {job.story.inventory && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Inventory Overview
                  </p>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.story.inventory}
                  </p>
                </div>
              )}
              {job.story.property && (
                <div>
                  <p className="text-xs font-semibold text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Property Details
                  </p>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.story.property}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage Notes */}
        {job.stageNotes && job.stageNotes.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Status History & Notes
            </h3>
            <div className="space-y-3">
              {job.stageNotes.slice().reverse().map((note, i) => (
                <div key={i} className="p-4 bg-[#F8F5F0] rounded-lg border-l-4 border-[#e6c35a]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {stages.find(s => s.key === note.stage)?.label || note.stage}
                    </span>
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formatDateTime(note.at)}
                    </span>
                  </div>
                  <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {note.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Update Project Status
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {stages.map(stage => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Add Note *
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="Describe what was done or next steps..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setStatusNote('')
                  setNewStatus(job.stage)
                }}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="w-full sm:flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentJobDetailPage