import { apiCall } from './api'

// ============ VENDOR CRUD ============

export const getVendors = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const endpoint = queryString ? `/vendors?${queryString}` : '/vendors'
  return apiCall(endpoint)
}

export const getVendorById = async (vendorId) => {
  return apiCall(`/vendors/${vendorId}`)
}

export const createVendor = async (vendorData) => {
  return apiCall('/vendors', {
    method: 'POST',
    body: JSON.stringify(vendorData)
  })
}

export const updateVendor = async (vendorId, vendorData) => {
  return apiCall(`/vendors/${vendorId}`, {
    method: 'PATCH',
    body: JSON.stringify(vendorData)
  })
}

export const deactivateVendor = async (vendorId) => {
  return apiCall(`/vendors/${vendorId}`, {
    method: 'DELETE'
  })
}

// ============ BIDS ============

export const submitBid = async (bidData) => {
  return apiCall('/vendors/bids', {
    method: 'POST',
    body: JSON.stringify(bidData)
  })
}

export const getVendorBids = async (vendorId, status = '') => {
  let endpoint = `/vendors/bids?vendorId=${vendorId}`
  if (status) endpoint += `&status=${status}`
  return apiCall(endpoint)
}

export const getBidsForJob = async (jobId, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const endpoint = queryString
    ? `/vendors/bids/${jobId}?${queryString}`
    : `/vendors/bids/${jobId}`
  return apiCall(endpoint)
}

export const acceptBid = async (bidId) => {
  return apiCall(`/vendors/bids/${bidId}/accept`, {
    method: 'PATCH'
  })
}

export const rejectBid = async (bidId) => {
  return apiCall(`/vendors/bids/${bidId}/reject`, {
    method: 'PATCH'
  })
}

export const markBidAsPaid = async (bidId, paidAmount) => {
  return apiCall(`/vendors/bids/${bidId}/pay`, {
    method: 'PATCH',
    body: JSON.stringify({ paidAmount })
  })
}

// Upload receipt for a specific bid (vendor uploads after job done)
export const uploadVendorReceipt = async (bidId, file) => {
  const formData = new FormData()
  formData.append('receipt', file)

  return apiCall(`/vendors/bids/${bidId}/receipt`, {
    method: 'POST',
    body: formData
  })
}

// ============ DONATION RECEIPTS ============

export const uploadDonationReceipt = async (jobId, file) => {
  const formData = new FormData()
  formData.append('receipt', file)
  formData.append('jobId', jobId)

  return apiCall('/vendors/donations/receipt', {
    method: 'POST',
    body: formData
  })
}

export const getDonationReceipts = async (jobId) => {
  return apiCall(`/vendors/donations/receipts/${jobId}`)
}

// Get all vendor receipts for a job (donation + hauling)
export const getJobReceipts = async (jobId) => {
  return apiCall(`/vendors/jobs/${jobId}/receipts`)
}

// ============ OPPORTUNITIES ============

export const getOpportunities = async (vendorId, stage = '') => {
  let endpoint = `/vendors/opportunities?vendorId=${vendorId}`
  if (stage) endpoint += `&stage=${stage}`
  return apiCall(endpoint)
}

// ============ JOB VIDEOS ============

export const getJobVideos = async (jobId) => {
  return apiCall(`/vendors/jobs/${jobId}/videos`)
}

// ============ ITEM DISPOSITION ============

export const getVendorJobItems = async (jobId) => {
  return apiCall(`/vendors/items/${jobId}`)
}

export const markItemsDonated = async (jobId, itemNumbers) => {
  return apiCall('/vendors/items/donated', {
    method: 'PATCH',
    body: JSON.stringify({ jobId, itemNumbers })
  })
}

export const markItemsHauled = async (jobId, itemNumbers) => {
  return apiCall('/vendors/items/hauled', {
    method: 'PATCH',
    body: JSON.stringify({ jobId, itemNumbers })
  })
}

// Mark donation work as complete (vendor signals they're done donating)
export const completeDonationWork = async (bidId) => {
  return apiCall(`/vendors/bids/${bidId}/complete-work`, {
    method: 'PATCH'
  })
}

// Mark hauling work as complete (vendor signals they're done hauling)
export const completeHaulingWork = async (bidId) => {
  return apiCall(`/vendors/bids/${bidId}/complete-work`, {
    method: 'PATCH'
  })
}
