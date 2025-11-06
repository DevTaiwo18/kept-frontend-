import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import { getClientJobs } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function AgentDashboardPage() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      const data = await getClientJobs()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
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
    { key: 'payout_processing', label: 'Payout' },
    { key: 'closing', label: 'Closing' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStageLabel = (stageKey) => {
    return stages.find(s => s.key === stageKey)?.label || stageKey
  }

  const filteredJobs = jobs.filter(job => {
    const stageMatch = filter === 'all' || job.stage === filter
    
    const searchLower = searchQuery.toLowerCase()
    const searchMatch = !searchQuery || 
      job.contractSignor?.toLowerCase().includes(searchLower) ||
      job.propertyAddress?.toLowerCase().includes(searchLower)
    
    return stageMatch && searchMatch
  })

  const stageColors = {
    walkthrough: 'bg-blue-100 text-blue-800',
    staging: 'bg-purple-100 text-purple-800',
    online_sale: 'bg-green-100 text-green-800',
    estate_sale: 'bg-yellow-100 text-yellow-800',
    donations: 'bg-orange-100 text-orange-800',
    hauling: 'bg-red-100 text-red-800',
    payout_processing: 'bg-indigo-100 text-indigo-800',
    closing: 'bg-gray-100 text-gray-800'
  }

  const awaitingDepositJobs = jobs.filter(j => j.status === 'awaiting_deposit')

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/admin/orders')}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-[#e6c35a] text-black rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#edd88c] transition-all whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="hidden sm:inline">📦 Orders</span>
                <span className="sm:hidden">📦</span>
              </button>
              <span className="text-xs sm:text-sm text-[#e6c35a] truncate max-w-[80px] sm:max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name} (Agent)
              </span>
              <button 
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Agent Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage all client projects and track progress
          </p>
        </div>

        {awaitingDepositJobs.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-yellow-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {awaitingDepositJobs.length} Project{awaitingDepositJobs.length > 1 ? 's' : ''} Awaiting Deposit
                </h3>
                <p className="text-xs sm:text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {awaitingDepositJobs.filter(j => !j.serviceFee).length > 0 && 
                    `${awaitingDepositJobs.filter(j => !j.serviceFee).length} need deposit request. `}
                  {awaitingDepositJobs.filter(j => j.serviceFee && !j.depositPaidAt).length > 0 && 
                    `${awaitingDepositJobs.filter(j => j.serviceFee && !j.depositPaidAt).length} awaiting client payment.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Total Projects</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {jobs.length}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Active Sales</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {jobs.filter(j => j.stage === 'online_sale' || j.stage === 'estate_sale').length}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Awaiting Deposit</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {awaitingDepositJobs.length}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {formatCurrency(jobs.reduce((sum, j) => sum + (j.finance?.gross || 0), 0))}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search client name or property address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 text-sm sm:text-base"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707072]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#707072] hover:text-[#101010]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md mb-6 overflow-x-auto">
          <div className="flex flex-nowrap gap-2 min-w-max sm:min-w-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-[#e6c35a] text-black' 
                  : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              All ({jobs.length})
            </button>
            {stages.map(stage => {
              const count = jobs.filter(j => j.stage === stage.key).length
              return (
                <button
                  key={stage.key}
                  onClick={() => setFilter(stage.key)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    filter === stage.key 
                      ? 'bg-[#e6c35a] text-black' 
                      : 'bg-gray-100 text-[#707072] hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {stage.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl shadow-md text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              No Jobs Found
            </h3>
            <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {filter === 'all' ? 'No projects available yet.' : `No projects in ${getStageLabel(filter)} stage.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#101010] text-[#F8F5F0]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Property Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Completion Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-[#F8F5F0] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {job.contractSignor}
                          </p>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {job.client?.email || job.contactEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {job.propertyAddress}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${stageColors[job.stage] || 'bg-gray-100 text-gray-800'}`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {getStageLabel(job.stage)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {job.status === 'awaiting_deposit' ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {!job.serviceFee ? 'Needs Deposit' : 'Awaiting Payment'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatCurrency(job.finance?.gross)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDate(job.desiredCompletionDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/agent/job/${job._id}`)}
                          className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <div key={job._id} className="p-4 hover:bg-[#F8F5F0] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.contractSignor}
                      </p>
                      <p className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {job.propertyAddress}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span 
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${stageColors[job.stage] || 'bg-gray-100 text-gray-800'}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {getStageLabel(job.stage)}
                      </span>
                      {job.status === 'awaiting_deposit' ? (
                        <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {!job.serviceFee ? 'Needs Deposit' : 'Awaiting Payment'}
                        </span>
                      ) : (
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Revenue</p>
                      <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatCurrency(job.finance?.gross)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</p>
                      <p className="text-xs sm:text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatDate(job.desiredCompletionDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/agent/job/${job._id}`)}
                    className="w-full px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Manage Job
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboardPage