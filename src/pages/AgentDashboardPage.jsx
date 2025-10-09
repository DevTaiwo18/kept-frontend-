import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

function AgentDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  const mockApprovals = [
    { id: 1, client: 'Sarah Johnson', item: 'Victorian Dining Table', uploaded: '2 hours ago' },
    { id: 2, client: 'Mike Chen', item: 'Antique Lamp Set', uploaded: '5 hours ago' },
    { id: 3, client: 'Lisa Brown', item: 'Leather Sofa', uploaded: '1 day ago' }
  ]

  const mockJobs = [
    { client: 'Johnson Estate', address: '123 Oak St', stage: 'Online Sale', nextDate: 'Oct 26', agent: 'Alex' },
    { client: 'Chen Family', address: '456 Maple Ave', stage: 'Staging/Prep', nextDate: 'Oct 28', agent: 'Maria' },
    { client: 'Brown Residence', address: '789 Pine Rd', stage: 'Donations', nextDate: 'Oct 30', agent: 'You' }
  ]

  const mockTasks = [
    { task: 'Donation pickup - Johnson Estate', date: 'Fri 3pm' },
    { task: 'Walkthrough - New client', date: 'Mon 10am' },
    { task: 'Final payout - Chen Family', date: 'Wed 2pm' }
  ]

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
            Agent Dashboard
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage jobs, approvals, and client communications
          </p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-[#707072]/20 overflow-x-auto">
          {['overview', 'jobs', 'approvals', 'messages'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'border-b-2 border-[#e6c35a] text-[#101010]' 
                  : 'text-[#707072] hover:text-[#101010]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Active Jobs</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>4</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Items Awaiting Approval</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>12</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Walkthroughs (7d)</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>3</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Today's Sales (All Jobs)</p>
                <p className="text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>$1,240</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Approvals Queue
                </h3>
                {mockApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {mockApprovals.map(approval => (
                      <div key={approval.id} className="flex justify-between items-center p-3 bg-[#F8F5F0] rounded-lg">
                        <div>
                          <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{approval.item}</p>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {approval.client} • {approval.uploaded}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-[#e6c35a] text-black rounded text-xs font-medium hover:bg-[#edd88c]">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-[#707072] text-white rounded text-xs font-medium hover:bg-gray-600">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#707072] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>No pending approvals</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tasks & Notes (This Week)
                </h3>
                <div className="space-y-3">
                  {mockTasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#F8F5F0] rounded-lg">
                      <input type="checkbox" className="mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{task.task}</p>
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{task.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Jobs in Progress
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#707072]/20">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Client</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Address</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Stage</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Next Date</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockJobs.map((job, i) => (
                      <tr key={i} className="border-b border-[#707072]/10 hover:bg-[#F8F5F0]">
                        <td className="py-3 px-2 text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.client}</td>
                        <td className="py-3 px-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.address}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-[#e6c35a]/20 text-[#101010] rounded text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {job.stage}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.nextDate}</td>
                        <td className="py-3 px-2 text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <button className="px-4 py-3 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Create Job
                </button>
                <button className="px-4 py-3 bg-white border-2 border-[#707072]/30 text-[#101010] rounded-lg font-medium hover:bg-gray-50 transition-all text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Add Item
                </button>
                <button className="px-4 py-3 bg-white border-2 border-[#707072]/30 text-[#101010] rounded-lg font-medium hover:bg-gray-50 transition-all text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Invite Client
                </button>
                <button className="px-4 py-3 bg-white border-2 border-[#707072]/30 text-[#101010] rounded-lg font-medium hover:bg-gray-50 transition-all text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Record Sales
                </button>
                <button className="px-4 py-3 bg-white border-2 border-[#707072]/30 text-[#101010] rounded-lg font-medium hover:bg-gray-50 transition-all text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Start Bid
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Jobs view coming soon...</p>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Approvals view coming soon...</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Messages view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboardPage