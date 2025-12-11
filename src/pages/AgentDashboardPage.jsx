import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuth } from '../utils/auth'
import { getClientJobs } from '../utils/clientJobsApi'
import AdminLayout from '../components/AdminLayout'

function AgentDashboardPage() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const auth = getAuth()
  const navigate = useNavigate()

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

  const jobsNeedingWelcomeEmail = jobs.filter(j => !j.welcomeEmailSentAt)

  const jobsNeedingContract = jobs.filter(j => j.welcomeEmailSentAt && !j.contractFileUrl && !j.contractSignedByClient)

  const jobsWaitingForSignature = jobs.filter(j => j.contractFileUrl && !j.contractSignedByClient)

  const jobsNeedingDepositRequest = jobs.filter(j => j.contractSignedByClient && !j.serviceFee)

  const jobsAwaitingPayment = jobs.filter(j => j.serviceFee && !j.depositPaidAt)

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Agent Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage all client projects and track progress
          </p>
        </div>

        {/* Priority: Send Welcome Email First */}
        {jobsNeedingWelcomeEmail.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📧 {jobsNeedingWelcomeEmail.length} Project{jobsNeedingWelcomeEmail.length > 1 ? 's' : ''} Need Welcome Email
                </h3>
                <p className="text-xs sm:text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Send personalized welcome email with contract to get started
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps Notifications */}
        {jobsNeedingWelcomeEmail.length === 0 && jobsNeedingContract.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-purple-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📄 {jobsNeedingContract.length} Project{jobsNeedingContract.length > 1 ? 's' : ''} Need Contract Upload
                </h3>
                <p className="text-xs sm:text-sm text-purple-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Upload signed contract for client to review
                </p>
              </div>
            </div>
          </div>
        )}

        {jobsNeedingWelcomeEmail.length === 0 && jobsNeedingContract.length === 0 && jobsWaitingForSignature.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ⏳ {jobsWaitingForSignature.length} Project{jobsWaitingForSignature.length > 1 ? 's' : ''} Awaiting Client Signature
                </h3>
                <p className="text-xs sm:text-sm text-amber-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Waiting for client to review and sign contract
                </p>
              </div>
            </div>
          </div>
        )}

        {jobsNeedingWelcomeEmail.length === 0 && jobsNeedingContract.length === 0 &&
          jobsWaitingForSignature.length === 0 && jobsNeedingDepositRequest.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-yellow-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    💰 {jobsNeedingDepositRequest.length} Project{jobsNeedingDepositRequest.length > 1 ? 's' : ''} Need Deposit Request
                  </h3>
                  <p className="text-xs sm:text-sm text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Set service fee and deposit amount
                  </p>
                </div>
              </div>
            </div>
          )}

        {jobsNeedingWelcomeEmail.length === 0 && jobsNeedingContract.length === 0 &&
          jobsWaitingForSignature.length === 0 && jobsNeedingDepositRequest.length === 0 &&
          jobsAwaitingPayment.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-green-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ✓ {jobsAwaitingPayment.length} Project{jobsAwaitingPayment.length > 1 ? 's' : ''} Awaiting Client Payment
                  </h3>
                  <p className="text-xs sm:text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Deposit request sent, waiting for client to complete payment
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
              {jobsAwaitingPayment.length}
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
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${filter === 'all'
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
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${filter === stage.key
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
                        {!job.welcomeEmailSentAt ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Send Email
                          </span>
                        ) : !job.contractSignedByClient ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {!job.contractFileUrl ? 'Upload Contract' : 'Awaiting Signature'}
                          </span>
                        ) : job.contractSignedByClient && !job.serviceFee ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            Request Deposit
                          </span>
                        ) : job.serviceFee && !job.depositPaidAt ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Awaiting Payment
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
                      {!job.welcomeEmailSentAt ? (
                        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Send Email
                        </span>
                      ) : !job.contractSignedByClient ? (
                        <span className="px-2 sm:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {!job.contractFileUrl ? 'Upload Contract' : 'Awaiting Signature'}
                        </span>
                      ) : job.contractSignedByClient && !job.serviceFee ? (
                        <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Request Deposit
                        </span>
                      ) : job.serviceFee && !job.depositPaidAt ? (
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Awaiting Payment
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
    </AdminLayout>
  )
}

export default AgentDashboardPage