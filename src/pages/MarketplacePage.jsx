import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMarketplaceItems } from '../utils/marketplaceApi'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

const CATEGORIES = [
  'All',
  'Furniture',
  'Tools',
  'Jewelry',
  'Art',
  'Electronics',
  'Outdoor',
  'Appliances',
  'Kitchen',
  'Collectibles',
  'Books/Media',
  'Clothing',
  'Misc'
]

const SORT_OPTIONS = [
  { value: 'new', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
]

function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'new')
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
  const [appliedMinPrice, setAppliedMinPrice] = useState(searchParams.get('min') || '')
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(searchParams.get('max') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const params = {
          page,
          limit: 24,
          sort: sortBy
        }

        if (searchQuery.trim()) params.q = searchQuery.trim()
        if (category !== 'All') params.category = category
        if (appliedMinPrice) params.min = appliedMinPrice
        if (appliedMaxPrice) params.max = appliedMaxPrice

        const response = await getMarketplaceItems(params)

        setItems(response.items || [])
        setTotal(response.total || 0)
      } catch (error) {
        
      } finally {
        setLoading(false)
      }
    }

    fetchItems()

    const params = {}
    if (searchQuery) params.q = searchQuery
    if (category !== 'All') params.category = category
    if (sortBy !== 'new') params.sort = sortBy
    if (appliedMinPrice) params.min = appliedMinPrice
    if (appliedMaxPrice) params.max = appliedMaxPrice
    if (page > 1) params.page = page
    setSearchParams(params)
  }, [page, category, sortBy, appliedMinPrice, appliedMaxPrice, searchQuery])

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setPage(1)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('All')
    setSortBy('new')
    setMinPrice('')
    setMaxPrice('')
    setAppliedMinPrice('')
    setAppliedMaxPrice('')
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  const totalPages = Math.ceil(total / 24)
  const hasActiveFilters = searchQuery || category !== 'All' || appliedMinPrice || appliedMaxPrice || sortBy !== 'new'

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 
            className="text-4xl font-bold text-[#101010]" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Estate Marketplace
          </h1>
        </div>

        <div className="mb-8 space-y-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search items..."
            className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  category === cat
                    ? 'bg-[#e6c35a] text-black'
                    : 'bg-white border-2 border-[#707072]/30 text-[#101010] hover:border-[#e6c35a]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <MarketplaceItemCard key={item._id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Previous
                </button>

                <span 
                  className="text-[#101010] font-semibold" 
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p 
              className="text-xl text-[#707072] mb-4" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {hasActiveFilters ? 'No items match your filters' : 'No items available at the moment'}
            </p>
            <p 
              className="text-sm text-[#707072] mb-6" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {hasActiveFilters ? 'Try adjusting your search or filters' : 'Check back soon for new estate items'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketplacePage