import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

function ShopperMarketplacePage() {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [searchQuery, setSearchQuery] = useState('')
  const auth = getAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const categories = ['Furniture', 'Tools', 'Jewelry', 'Art', 'Electronics', 'Outdoor', 'Appliances', 'Kitchen']

  const mockUpcomingSales = [
    { id: 1, title: 'Johnson Estate Sale', date: 'Oct 26-27', city: 'Cincinnati, OH' },
    { id: 2, title: 'Brown Family Sale', date: 'Nov 2-3', city: 'Dayton, OH' },
    { id: 3, title: 'Chen Residence Sale', date: 'Nov 9-10', city: 'Columbus, OH' }
  ]

  const mockTrendingItems = [
    { id: 1, name: 'Victorian Dining Table', price: '$450', image: '🪑' },
    { id: 2, name: 'Antique Mirror', price: '$220', image: '🪞' },
    { id: 3, name: 'Leather Recliner', price: '$180', image: '🛋️' },
    { id: 4, name: 'Tool Set', price: '$95', image: '🔧' }
  ]

  const mockSavedItems = [
    { id: 1, name: 'Crystal Vase', price: '$75' },
    { id: 2, name: 'Oak Bookshelf', price: '$320' }
  ]

  const mockOrders = [
    { id: 1, item: 'Antique Lamp', status: 'Awaiting pickup', pickup: 'Today 4-6pm' }
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
            Marketplace
          </h1>
          <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Browse estate sale items and upcoming events
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="mb-4">
            <input 
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button 
                key={cat}
                className="px-4 py-2 bg-[#F8F5F0] text-[#101010] rounded-lg font-medium hover:bg-[#e6c35a] hover:text-black transition-all whitespace-nowrap text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-[#707072]/20 overflow-x-auto">
          {['marketplace', 'my orders', 'saved'].map(tab => (
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

        {activeTab === 'marketplace' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Upcoming Sales
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockUpcomingSales.map(sale => (
                  <div key={sale.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {sale.title}
                    </h3>
                    <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      📅 {sale.date}
                    </p>
                    <p className="text-sm text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      📍 {sale.city}
                    </p>
                    <button className="w-full px-4 py-2 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all text-sm">
                      Add to Calendar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Trending Items
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockTrendingItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-6xl mb-3 text-center">{item.image}</div>
                    <h3 className="text-sm font-bold text-[#101010] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-[#e6c35a] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {item.price}
                    </p>
                    <button className="w-full px-3 py-2 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all text-xs">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button className="px-8 py-3 bg-[#101010] text-[#F8F5F0] rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Browse All Items
              </button>
            </div>
          </>
        )}

        {activeTab === 'my orders' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Order Status
            </h2>
            {mockOrders.length > 0 ? (
              <div className="space-y-4">
                {mockOrders.map(order => (
                  <div key={order.id} className="p-4 bg-[#edd88c]/20 rounded-lg border-l-4 border-[#e6c35a]">
                    <p className="font-semibold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {order.item}
                    </p>
                    <p className="text-sm text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Status: <span className="font-semibold">{order.status}</span>
                    </p>
                    <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Pickup: {order.pickup}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>No active orders</p>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Saved Items
            </h2>
            {mockSavedItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSavedItems.map(item => (
                  <div key={item.id} className="p-4 bg-[#F8F5F0] rounded-lg">
                    <h3 className="font-semibold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {item.price}
                    </p>
                    <button className="mt-3 w-full px-3 py-2 bg-[#e6c35a] text-black rounded-lg font-medium hover:bg-[#edd88c] transition-all text-sm">
                      View Item
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>No saved items</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopperMarketplacePage