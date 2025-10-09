import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const mockOpenBids = [
    { 
      id: 1, 
      location: '123 Oak St, Cincinnati', 
      items: 'Furniture, appliances, misc household', 
      estimate: 'Full clearout needed',
      deadline: '2 days'
    },
    { 
      id: 2, 
      location: '456 Maple Ave, Dayton', 
      items: 'Garage tools, outdoor equipment', 
      estimate: 'Partial clearout',
      deadline: '5 days'
    },
    { 
      id: 3, 
      location: '789 Pine Rd, Columbus', 
      items: 'Donation items (20+ boxes)', 
      estimate: 'Donation pickup only',
      deadline: '1 week'
    }
  ]

  const mockMyJobs = [
    { 
      id: 1, 
      client: 'Johnson Estate', 
      address: '123 Oak St, Cincinnati', 
      date: 'Oct 30, 2025', 
      status: 'Scheduled',
      contact: '(513) 555-0100'
    },
    { 
      id: 2, 
      client: 'Brown Residence', 
      address: '789 Pine Rd, Columbus', 
      date: 'Nov 5, 2025', 
      status: 'Awaiting Receipt',
      contact: '(614) 555-0200'
    }
  ]

  const mockDocs = [
    { id: 1, type: 'Donation Receipt', client: 'Johnson Estate', date: 'Oct 15, 2025' },
    { id: 2, type: 'Hauling Invoice', client: 'Chen Family', date: 'Oct 10, 2025' }
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
            Vendor Dashboard
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage bids, jobs, and documentation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Open Bids to Review</p>
            <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>3</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Jobs Awarded (This Week)</p>
            <p className="text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>1</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Pickups (7d)</p>
            <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>2</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-[#707072]/20 overflow-x-auto">
          {['opportunities', 'my jobs', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-all whitespace-nowrap ${
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

        {activeTab === 'opportunities' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Open Bid Opportunities
            </h2>
            <div className="space-y-4">
              {mockOpenBids.map(bid => (
                <div key={bid.id} className="p-4 bg-[#F8F5F0] rounded-lg border-l-4 border-[#e6c35a]">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {bid.location}
                      </h3>
                      <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>Items:</strong> {bid.items}
                      </p>
                      <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>Estimate:</strong> {bid.estimate}
                      </p>
                      <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Deadline: {bid.deadline}
                      </p>
                    </div>
                    <button className="px-6 py-2 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Submit Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my jobs' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              My Jobs
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#707072]/20">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Client</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Address</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Contact</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMyJobs.map(job => (
                    <tr key={job.id} className="border-b border-[#707072]/10 hover:bg-[#F8F5F0]">
                      <td className="py-3 px-2 text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.client}</td>
                      <td className="py-3 px-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.address}</td>
                      <td className="py-3 px-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.date}</td>
                      <td className="py-3 px-2 text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>{job.contact}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'Scheduled' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button className="px-3 py-1 bg-[#e6c35a] text-black rounded text-xs font-medium hover:bg-[#edd88c]">
                          Upload Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Documents
            </h2>
            <div className="space-y-3">
              {mockDocs.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-4 bg-[#F8F5F0] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{doc.type}</p>
                    <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {doc.client} • {doc.date}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-medium hover:bg-[#edd88c]">
                    Download
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

export default VendorDashboardPage