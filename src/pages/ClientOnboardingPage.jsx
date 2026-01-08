import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import { getClientJobs } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientOnboardingPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') 
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await getClientJobs()
      setProjects(data.jobs || [])
    } catch (error) {
      console.error('Error loading projects:', error)
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

  const stageCounts = stages.map(stage => ({
    ...stage,
    count: projects.filter(p => p.stage === stage.key).length
  }))

  const calculateKeptHouseCommission = (grossSales) => {
    let commission = 0
    
    if (grossSales <= 7500) {
      commission = grossSales * 0.50
    } else if (grossSales <= 20000) {
      commission = (7500 * 0.50) + ((grossSales - 7500) * 0.40)
    } else {
      commission = (7500 * 0.50) + (12500 * 0.40) + ((grossSales - 20000) * 0.30)
    }
    
    return Math.round(commission * 100) / 100
  }

  const calculateProjectFinancials = (project) => {
    const gross = project.finance?.gross || 0
    const serviceFee = (project.serviceFee && project.serviceFee > 0) ? project.serviceFee : 0
    const hauling = project.finance?.haulingCost || 0
    const depositPaid = (project.depositAmount && project.depositAmount > 0 && project.depositPaidAt) ? project.depositAmount : 0
    
    const keptHouseCommission = calculateKeptHouseCommission(gross)
    const net = gross - serviceFee - keptHouseCommission - hauling + depositPaid

    return {
      gross,
      serviceFee,
      keptHouseCommission,
      totalFees: serviceFee + keptHouseCommission,
      hauling,
      depositPaid,
      net
    }
  }

  const totalRevenue = projects.reduce((sum, p) => sum + (p.finance?.gross || 0), 0)
  
  const totalKeptHouseCommission = projects.reduce((sum, p) => {
    const gross = p.finance?.gross || 0
    return sum + calculateKeptHouseCommission(gross)
  }, 0)
  
  const totalServiceFees = projects.reduce((sum, p) => {
    const serviceFee = (p.serviceFee && p.serviceFee > 0) ? p.serviceFee : 0
    return sum + serviceFee
  }, 0)
  
  const totalFees = totalServiceFees + totalKeptHouseCommission
  
  const totalHauling = projects.reduce((sum, p) => sum + (p.finance?.haulingCost || 0), 0)
  
  const totalDeposits = projects.reduce((sum, p) => {
    const deposit = (p.depositAmount && p.depositAmount > 0 && p.depositPaidAt) ? p.depositAmount : 0
    return sum + deposit
  }, 0)
  
  const totalNet = totalRevenue - totalFees - totalHauling + totalDeposits

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getAllTransactions = () => {
    const transactions = []
    
    projects.forEach(project => {
      if (project.finance?.daily && project.finance.daily.length > 0) {
        project.finance.daily.forEach(transaction => {
          transactions.push({
            ...transaction,
            projectName: project.contractSignor,
            projectAddress: project.propertyAddress,
            type: 'sale'
          })
        })
      }
      
      if (project.depositAmount && project.depositAmount > 0 && project.depositPaidAt) {
        transactions.push({
          label: 'Initial Deposit Payment',
          amount: project.depositAmount,
          at: project.depositPaidAt,
          projectName: project.contractSignor,
          projectAddress: project.propertyAddress,
          type: 'deposit'
        })
      }
    })
    
    return transactions.sort((a, b) => new Date(b.at) - new Date(a.at))
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-[#e6c35a] truncate max-w-[120px] sm:max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Welcome, {auth?.user?.name}
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Track your estate sale progress and financials
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl shadow-md text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              No Projects Yet
            </h3>
            <p className="text-sm sm:text-base text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Get started by creating your first estate sale project.
            </p>
            <button
              onClick={() => navigate('/client/new-project')}
              className="w-full sm:w-auto px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start New Project
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    activeTab === 'overview'
                      ? 'bg-[#e6c35a] text-black'
                      : 'bg-white text-[#707072] hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${
                    activeTab === 'revenue'
                      ? 'bg-[#e6c35a] text-black'
                      : 'bg-white text-[#707072] hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Revenue & Sales
                </button>
              </div>

              <button
                onClick={() => navigate('/client/new-project')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-sm sm:text-base whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Start New Project
              </button>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Total Projects
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {projects.length}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Active Sales
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {projects.filter(p => p.stage === 'online_sale' || p.stage === 'estate_sale').length}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md sm:col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Total Revenue
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Projects by Stage
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                    {stageCounts.map((stage) => (
                      <div 
                        key={stage.key} 
                        className={`text-center p-2 sm:p-3 rounded-lg ${
                          stage.count > 0 ? 'bg-[#e6c35a]/20 border-2 border-[#e6c35a]' : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        <p className="text-xl sm:text-2xl font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {stage.count}
                        </p>
                        <p className={`text-xs font-semibold ${stage.count > 0 ? 'text-[#101010]' : 'text-[#707072]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {stage.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                  <h3 className="text-lg sm:text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    My Projects
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {projects.map((project) => (
                      <div 
                        key={project._id}
                        className="p-3 sm:p-4 bg-[#F8F5F0] rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/client/project/${project._id}`)}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-[#101010] text-base sm:text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {project.contractSignor}
                              </h4>
                              {project.status === 'awaiting_deposit' && project.serviceFee && project.serviceFee > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Payment Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {project.propertyAddress}
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                              <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Due: {new Date(project.desiredCompletionDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Revenue: {formatCurrency(project.finance?.gross)}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-[#e6c35a]/20 text-[#101010] rounded text-xs font-semibold whitespace-nowrap self-start" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {stages.find(s => s.key === project.stage)?.label || project.stage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'revenue' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Gross Revenue
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Total Fees
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalFees)}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Hauling Costs
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalHauling)}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Deposits Paid
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalDeposits)}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-[#e6c35a] sm:col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Net Payout
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {formatCurrency(totalNet)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-[#101010] mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Revenue by Project
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {projects.map((project) => {
                      const financials = calculateProjectFinancials(project)
                      
                      return (
                        <div 
                          key={project._id}
                          className="p-3 sm:p-4 bg-[#F8F5F0] rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/client/project/${project._id}`)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                            <div>
                              <h4 className="font-bold text-[#101010] mb-1 text-base sm:text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {project.contractSignor}
                              </h4>
                              <p className="text-xs sm:text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {project.propertyAddress}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-[#e6c35a]/20 text-[#101010] rounded text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {stages.find(s => s.key === project.stage)?.label || project.stage}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Gross</p>
                              <p className="text-base sm:text-lg font-bold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(financials.gross)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Fees</p>
                              <p className="text-base sm:text-lg font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(financials.totalFees)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Hauling</p>
                              <p className="text-base sm:text-lg font-bold text-orange-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(financials.hauling)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Deposit</p>
                              <p className="text-base sm:text-lg font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(financials.depositPaid)}
                              </p>
                            </div>
                            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Net</p>
                              <p className="text-base sm:text-lg font-bold text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatCurrency(financials.net)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                  <h3 className="text-lg sm:text-xl font-bold text-[#101010] mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Recent Transactions
                  </h3>
                  <div className="space-y-2">
                    {getAllTransactions().slice(0, 20).map((transaction, index) => (
                      <div 
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-[#F8F5F0] rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#101010] text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {transaction.label}
                            </p>
                            {transaction.type === 'deposit' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Deposit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {transaction.projectName} • {formatDate(transaction.at)}
                          </p>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                    
                    {getAllTransactions().length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          No transactions yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ClientOnboardingPage