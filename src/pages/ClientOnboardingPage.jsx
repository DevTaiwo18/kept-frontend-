import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import { getClientJobs } from '../utils/clientJobsApi'
import logo from '../assets/Kept House _transparent logo .png'

function ClientOnboardingPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Count projects by stage
  const stageCounts = stages.map(stage => ({
    ...stage,
    count: projects.filter(p => p.stage === stage.key).length
  }))

  // Calculate total revenue
  const totalRevenue = projects.reduce((sum, p) => sum + (p.finance?.gross || 0), 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Welcome, {auth?.user?.name}
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Track your estate sale progress and financials
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <h3 className="text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              No Projects Yet
            </h3>
            <p className="text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Get started by creating your first estate sale project.
            </p>
            <button
              onClick={() => navigate('/client/new-project')}
              className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start New Project
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-end">
              <button
                onClick={() => navigate('/client/new-project')}
                className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Start New Project
              </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Projects
                </p>
                <p className="text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {projects.length}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Active Sales
                </p>
                <p className="text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {projects.filter(p => p.stage === 'online_sale' || p.stage === 'estate_sale').length}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Revenue
                </p>
                <p className="text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>

            {/* Projects by Stage */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Projects by Stage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {stageCounts.map((stage) => (
                  <div 
                    key={stage.key} 
                    className={`text-center p-3 rounded-lg ${
                      stage.count > 0 ? 'bg-[#e6c35a]/20 border-2 border-[#e6c35a]' : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <p className="text-2xl font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {stage.count}
                    </p>
                    <p className={`text-xs font-semibold ${stage.count > 0 ? 'text-[#101010]' : 'text-[#707072]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {stage.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects List */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                My Projects
              </h3>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project._id}
                    className="p-4 bg-[#F8F5F0] rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/client/project/${project._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {project.contractSignor}
                        </h4>
                        <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {project.propertyAddress}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Due: {new Date(project.desiredCompletionDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Revenue: {formatCurrency(project.finance?.gross)}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-[#e6c35a]/20 text-[#101010] rounded text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stages.find(s => s.key === project.stage)?.label || project.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ClientOnboardingPage