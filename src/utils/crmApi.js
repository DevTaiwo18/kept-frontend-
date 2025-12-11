import { getAuth } from './auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getHeaders = () => {
  const auth = getAuth()
  return {
    'Content-Type': 'application/json',
    ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {})
  }
}

// Get contacts with pagination and filters
export const getContacts = async (params = {}) => {
  const queryParams = new URLSearchParams()

  // Always fetch all contacts
  queryParams.append('fetchAll', 'true')

  if (params.limit) queryParams.append('limit', params.limit)
  if (params.type) queryParams.append('type', params.type)
  if (params.search) queryParams.append('search', params.search)
  if (params.startAfter) queryParams.append('startAfter', params.startAfter)
  if (params.startAfterId) queryParams.append('startAfterId', params.startAfterId)
  if (params.tags) queryParams.append('tags', params.tags)

  const url = `${API_BASE}/crm/contacts?${queryParams.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to fetch contacts')
  }

  return response.json()
}

// Get CRM stats (total counts, etc.)
export const getCrmStats = async () => {
  const response = await fetch(`${API_BASE}/crm/stats`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to fetch CRM stats')
  }

  return response.json()
}

// Send bulk email to selected contacts
export const sendBulkEmail = async (contactIds, subject, message) => {
  const response = await fetch(`${API_BASE}/crm/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      contactIds,
      subject,
      message
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to send emails')
  }

  return response.json()
}

// Get single contact details
export const getContactById = async (contactId) => {
  const response = await fetch(`${API_BASE}/crm/contacts/${contactId}`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to fetch contact')
  }

  return response.json()
}
