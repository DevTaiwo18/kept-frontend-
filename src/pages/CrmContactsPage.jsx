import { useState, useEffect } from 'react'
import { getContacts, getCrmStats, sendBulkEmail } from '../utils/crmApi'
import AdminLayout from '../components/AdminLayout'

// Type grouping - map API types to main categories
const TYPE_GROUPS = {
  buyer: ['lead', 'prospect', 'shopper', 'buyer', 'interested', 'subscriber'],
  vendor: ['vendor', 'seller', 'consigner', 'partner'],
  client: ['client', 'customer', 'member', 'vip']
}

// Get the display category for a contact type
const getTypeCategory = (type) => {
  if (!type) return 'buyer' // Default to buyer for leads
  const lowerType = type.toLowerCase()
  for (const [category, types] of Object.entries(TYPE_GROUPS)) {
    if (types.includes(lowerType)) return category
  }
  return 'buyer' // Default unmatched types to buyer
}

// Get badge styling based on category
const getTypeBadgeStyle = (type) => {
  const category = getTypeCategory(type)
  switch (category) {
    case 'buyer':
      return 'bg-green-100 text-green-800'
    case 'vendor':
      return 'bg-purple-100 text-purple-800'
    case 'client':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Pre-made email templates (no greeting - backend adds personalized greeting)
const EMAIL_TEMPLATES = {
  buyer: {
    name: 'Buyers / Shoppers',
    icon: '🛍️',
    subject: 'Upcoming Estate Sale - Don\'t Miss Out!',
    message: `We wanted to reach out and let you know about an exciting upcoming estate sale!

📅 Date: [DATE]
🕐 Time: 9:00 AM - 4:00 PM
📍 Location: [ADDRESS]

This sale features:
• Vintage furniture and antiques
• Fine china and collectibles
• Designer clothing and accessories
• Home décor and artwork
• And much more!

Early bird access is available for our VIP list members.

Questions? Reply to this email or call us at (513) 555-1234.

We hope to see you there!

Best regards,
The Kept House Team`
  },
  vendor: {
    name: 'Vendors / Sellers',
    icon: '🏠',
    subject: 'Partner with Kept House for Your Estate Sale',
    message: `Thank you for your interest in Kept House Estate Sales!

We specialize in professionally managed estate sales that maximize value for our clients. Here's what sets us apart:

✓ Full-service estate liquidation
✓ Professional pricing and staging
✓ Extensive marketing reach
✓ Transparent reporting
✓ Compassionate service during difficult transitions

We'd love to discuss how we can help you with your upcoming estate sale.

Would you be available for a free consultation this week? Simply reply to this email or call us at (513) 555-1234 to schedule.

Looking forward to hearing from you!

Best regards,
The Kept House Team`
  },
  client: {
    name: 'Clients / Customers',
    icon: '⭐',
    subject: 'Thank You from Kept House!',
    message: `Thank you for being a valued member of the Kept House family!

We truly appreciate your support and wanted to reach out with some exciting updates:

🎉 What's New:
• New estate sales added weekly
• Exclusive early access for loyal customers
• Special member-only discounts

📅 Upcoming Events:
• [EVENT 1]
• [EVENT 2]

As a thank you for your continued support, enjoy 10% off your next purchase when you mention this email!

We look forward to seeing you at our next sale.

Warmly,
The Kept House Team`
  },
  everyone: {
    name: 'Everyone',
    icon: '📧',
    subject: 'News from Kept House Estate Sales',
    message: `Greetings from Kept House Estate Sales!

We wanted to share some exciting news with you:

📢 Announcement:
[YOUR MESSAGE HERE]

📅 Upcoming Sales:
• [SALE 1 - DATE & LOCATION]
• [SALE 2 - DATE & LOCATION]

Whether you're looking to buy unique treasures or need help with an estate sale, we're here for you!

Visit our website at keptestate.com to see our latest listings.

Questions? Reply to this email or call us at (513) 555-1234.

Best regards,
The Kept House Team`
  }
}

function CrmContactsPage() {
  const [allContacts, setAllContacts] = useState([]) // Store all fetched contacts
  const [stats, setStats] = useState({ total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('') // 'with_email', 'no_email', or ''
  const [tagsFilter, setTagsFilter] = useState('')

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredContacts, setFilteredContacts] = useState([]) // Filtered contacts before pagination
  const itemsPerPage = 50 // Show 50 per page on frontend

  // Selection
  const [selectedIds, setSelectedIds] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailData, setEmailData] = useState({ subject: '', message: '' })
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    loadContacts()
    loadStats()
  }, [])

  // Client-side filtering when filters change
  useEffect(() => {
    if (allContacts.length > 0) {
      let filtered = allContacts

      // Filter by type category
      if (typeFilter) {
        filtered = filtered.filter(contact => {
          const category = getTypeCategory(contact.type)
          return category === typeFilter
        })
      }

      // Filter by email status
      if (emailFilter === 'with_email') {
        filtered = filtered.filter(contact => contact.email)
      } else if (emailFilter === 'no_email') {
        filtered = filtered.filter(contact => !contact.email)
      }

      setFilteredContacts(filtered)
      setCurrentPage(1) // Reset to page 1 when filters change
    }
  }, [typeFilter, emailFilter, allContacts])

  // Calculate paginated contacts
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex)


  const loadStats = async () => {
    try {
      const data = await getCrmStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const loadContacts = async (params = {}) => {
    try {
      setIsLoading(true)
      setError('')

      const queryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(tagsFilter && { tags: tagsFilter }),
        ...params
      }

      const data = await getContacts(queryParams)
      const fetchedContacts = data.contacts || []
      setAllContacts(fetchedContacts)

      // Log all unique types from the API for debugging
      const uniqueTypes = [...new Set(fetchedContacts.map(c => c.type).filter(Boolean))]
      console.log('=== CRM Contact Types from API ===')
      console.log('Unique types found:', uniqueTypes)
      console.log('Type counts:', uniqueTypes.map(t => ({ type: t, count: fetchedContacts.filter(c => c.type === t).length })))

      setFilteredContacts(fetchedContacts) // Initialize filtered with all contacts

      // Update stats total if available
      if (data.total || fetchedContacts.length) {
        setStats(prev => ({ ...prev, total: data.total || fetchedContacts.length }))
      }
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    setSelectedIds([])
    setSelectAll(false)
    loadContacts()
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      setSelectedIds([])
      setSelectAll(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      setSelectedIds([])
      setSelectAll(false)
    }
  }

  // Select all on current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
      setSelectAll(false)
    } else {
      setSelectedIds(paginatedContacts.map(c => c.id))
      setSelectAll(true)
    }
  }

  // Select ALL filtered contacts (across all pages)
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredContacts.map(c => c.id)
    setSelectedIds(allFilteredIds)
    setSelectAll(true)
  }

  const handleSelectContact = (contactId) => {
    if (selectedIds.includes(contactId)) {
      setSelectedIds(prev => prev.filter(id => id !== contactId))
      setSelectAll(false)
    } else {
      const newSelected = [...selectedIds, contactId]
      setSelectedIds(newSelected)
      if (newSelected.length === paginatedContacts.length) {
        setSelectAll(true)
      }
    }
  }

  const handleOpenEmailModal = () => {
    if (selectedIds.length === 0) return
    setEmailData({ subject: '', message: '' })
    setSendError('')
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      setSendError('Please fill in both subject and message')
      return
    }

    try {
      setIsSending(true)
      setSendError('')
      await sendBulkEmail(selectedIds, emailData.subject, emailData.message)
      setShowEmailModal(false)
      setSelectedIds([])
      setSelectAll(false)

      // Show success message
      const successMsg = document.createElement('div')
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      successMsg.textContent = `✓ Email sent to ${selectedIds.length} contact${selectedIds.length > 1 ? 's' : ''}!`
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (err) {
      setSendError(err.message || 'Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSourceFromAttributions = (contact) => {
    if (contact.attributions && contact.attributions.length > 0) {
      return contact.attributions[0].source || contact.attributions[0].medium || '-'
    }
    return contact.source || '-'
  }

  // Get contacts with email for selection count
  const contactsWithEmail = filteredContacts.filter(c => c.email)
  const selectedWithEmail = selectedIds.filter(id => {
    const contact = filteredContacts.find(c => c.id === id)
    return contact?.email
  })

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            CRM Contacts
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manage your leads and contacts • {stats.total?.toLocaleString() || 0} total contacts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Total Contacts</p>
            <p className="text-2xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats.total?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Leads</p>
            <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats.leads?.toLocaleString() || stats.total?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>With Email</p>
            <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats.withEmail?.toLocaleString() || contactsWithEmail.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Selected</p>
            <p className="text-2xl font-bold text-[#e6c35a]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedIds.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Type Filter - Categories */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setSelectedIds([])
                setSelectAll(false)
              }}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">All Contacts</option>
              <option value="buyer">Buyers (Leads, Shoppers)</option>
              <option value="vendor">Vendors (Sellers)</option>
              <option value="client">Clients (Customers)</option>
            </select>

            {/* Email Filter */}
            <select
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value)
                setSelectedIds([])
                setSelectAll(false)
              }}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">All Emails</option>
              <option value="with_email">With Email</option>
              <option value="no_email">No Email</option>
            </select>

            {/* Tags Filter */}
            <input
              type="text"
              placeholder="Filter by tags..."
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Select All Banner */}
        {!isLoading && filteredContacts.length > 0 && selectedIds.length < filteredContacts.length && (
          <div className="bg-[#F8F5F0] border border-[#e6c35a]/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {filteredContacts.length} contacts available ({contactsWithEmail.length} with email)
              </span>
            </div>
            <button
              onClick={handleSelectAllFiltered}
              className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Select All {filteredContacts.length} Contacts
            </button>
          </div>
        )}

        {/* Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''} selected
                {selectedWithEmail.length < selectedIds.length && (
                  <span className="text-blue-700 font-normal"> ({selectedWithEmail.length} with email)</span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedIds.length < filteredContacts.length && (
                <button
                  onClick={handleSelectAllFiltered}
                  className="px-4 py-2 bg-[#e6c35a] text-black rounded-lg text-sm font-semibold hover:bg-[#edd88c] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Select All {filteredContacts.length}
                </button>
              )}
              <button
                onClick={() => { setSelectedIds([]); setSelectAll(false); }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear Selection
              </button>
              <button
                onClick={handleOpenEmailModal}
                disabled={selectedWithEmail.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
          </div>
        )}

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-[#F8F5F0] border-t-[#e6c35a] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading contacts...</p>
            </div>
          ) : paginatedContacts.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[#707072] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>No Contacts Found</p>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#e6c35a] focus:ring-[#e6c35a]"
                  />
                </div>
                <div className="col-span-3 text-xs font-semibold text-[#707072] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Contact</div>
                <div className="col-span-3 text-xs font-semibold text-[#707072] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Email / Phone</div>
                <div className="col-span-2 text-xs font-semibold text-[#707072] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Type</div>
                <div className="col-span-2 text-xs font-semibold text-[#707072] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Source</div>
                <div className="col-span-1 text-xs font-semibold text-[#707072] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Added</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {paginatedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      selectedIds.includes(contact.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#e6c35a] focus:ring-[#e6c35a]"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#e6c35a] flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {(contact.contactName || contact.firstName || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {contact.contactName || contact.firstName || 'Unknown'}
                        </p>
                        {contact.lastName && (
                          <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {contact.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email / Phone */}
                    <div className="col-span-3">
                      {contact.email ? (
                        <p className="text-sm text-[#101010] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {contact.email}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic" style={{ fontFamily: 'Inter, sans-serif' }}>No email</p>
                      )}
                      {contact.phone && (
                        <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {contact.phone}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <div className="col-span-2 flex items-center gap-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getTypeBadgeStyle(contact.type)}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {getTypeCategory(contact.type)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({contact.type || 'lead'})
                      </span>
                    </div>

                    {/* Source */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {getSourceFromAttributions(contact)}
                      </span>
                    </div>

                    {/* Date Added */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatDate(contact.dateAdded)}
                      </span>
                    </div>

                    {/* Tags (Mobile) */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="col-span-full lg:hidden flex flex-wrap gap-1 mt-2">
                        {contact.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts • Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                ← Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-white border border-gray-200 text-[#101010] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#101010] text-white p-6 flex justify-between items-center rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Send Bulk Email
                </h3>
                <p className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sending to {selectedWithEmail.length} contact{selectedWithEmail.length > 1 ? 's' : ''} with email
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-white hover:text-[#e6c35a] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {sendError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {sendError}
                  </p>
                </div>
              )}

              {/* Template Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Use Template
                </label>
                <select
                  onChange={(e) => {
                    const template = EMAIL_TEMPLATES[e.target.value]
                    if (template) {
                      setEmailData({ subject: template.subject, message: template.message })
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] bg-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a template...</option>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.icon} {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Message *
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Type your message here..."
                />
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Use {'{{name}}'} to personalize with contact's name
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEmailModal(false)}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default CrmContactsPage
