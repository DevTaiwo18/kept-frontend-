import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

function ClientOnboardingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const stages = [
    'Walkthrough',
    'Staging/Prep',
    'Online Sale',
    'Estate Sale',
    'Donations',
    'Hauling',
    'Payout',
    'Closing'
  ]
  const currentStage = 3

  const mockUploads = [
    { id: 1, item: 'Antique Chair', status: 'Pending Approval', uploaded: '1 day ago' },
    { id: 2, item: 'Crystal Vase', status: 'Pending Approval', uploaded: '2 days ago' }
  ]

  const mockReceipts = [
    { id: 1, organization: 'Goodwill', date: 'Oct 15, 2025', items: 12 },
    { id: 2, organization: 'Salvation Army', date: 'Oct 10, 2025', items: 8 }
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
            Welcome, {auth?.user?.name}
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Track your estate sale progress and financials
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Project Progress
          </h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[#e6c35a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stages[currentStage]}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {Math.round((currentStage / stages.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#F8F5F0]">
              <div 
                style={{ width: `${(currentStage / stages.length) * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#e6c35a]"
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
            {stages.map((stage, i) => (
              <div 
                key={i} 
                className={`text-center p-2 rounded text-xs ${
                  i <= currentStage ? 'bg-[#e6c35a]/20 text-[#101010] font-semibold' : 'bg-gray-100 text-[#707072]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {stage}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-[#edd88c]/20 rounded-lg">
            <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>Next Milestone:</strong> Estate Sale on Oct 26–27, 2025
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-[#707072]/20 overflow-x-auto">
          {['overview', 'my items', 'finance', 'documents'].map(tab => (
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

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Sales to Date</p>
                <p className="text-3xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>$3,420</p>
                <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>View daily breakdown →</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Estimated Payout</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>$2,710</p>
                <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>After fees & costs</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Items Online</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>86</p>
                <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>9 pending approval</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Donations & Receipts</p>
                <p className="text-3xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>2</p>
                <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>PDF receipts available</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  My Uploads (Pending Approval)
                </h3>
                {mockUploads.length > 0 ? (
                  <div className="space-y-3">
                    {mockUploads.map(upload => (
                      <div key={upload.id} className="flex justify-between items-center p-3 bg-[#F8F5F0] rounded-lg">
                        <div>
                          <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{upload.item}</p>
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {upload.uploaded}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {upload.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#707072] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>No pending uploads</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Hauling / Bids
                </h3>
                <div className="p-4 bg-[#edd88c]/20 rounded-lg">
                  <p className="text-sm text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <strong>Winning Vendor:</strong> ABC Hauling Co.
                  </p>
                  <p className="text-sm text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <strong>Scheduled:</strong> Oct 30, 2025 at 9:00 AM
                  </p>
                  <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Countdown: 5 days remaining
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Messages
              </h3>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Contact Account Manager
                </button>
                <button className="px-6 py-3 bg-white border-2 border-[#707072]/30 text-[#101010] rounded-lg font-medium hover:bg-gray-50 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Open FAQ Bot
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'my items' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>My Items view coming soon...</p>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Finance view coming soon...</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Donation Receipts
            </h3>
            <div className="space-y-3">
              {mockReceipts.map(receipt => (
                <div key={receipt.id} className="flex justify-between items-center p-4 bg-[#F8F5F0] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{receipt.organization}</p>
                    <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {receipt.date} • {receipt.items} items
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-medium hover:bg-[#edd88c]">
                    Download PDF
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

export default ClientOnboardingPage