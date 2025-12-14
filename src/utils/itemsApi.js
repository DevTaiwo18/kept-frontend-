import { apiCall } from './api'

export const createItem = async (jobId) => {
  return apiCall('/items', {
    method: 'POST',
    body: JSON.stringify({ jobId })
  })
}

export const getJobItems = async (jobId) => {
  return apiCall(`/items/job/${jobId}`)
}

export const getItemById = async (itemId) => {
  return apiCall(`/items/${itemId}`)
}

const API_URL = import.meta.env.VITE_API_URL || 'https://kept-api-vkc7.onrender.com/api'

export const uploadItemPhotos = async (itemId, files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided')
  }

  const formData = new FormData()

  files.forEach((file) => {
    if (file instanceof File) {
      formData.append('photos', file)
    } else {
      console.error('Invalid file object:', file)
    }
  })

  const token = localStorage.getItem('kh_token')

  const response = await fetch(`${API_URL}/items/${itemId}/photos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Failed to upload photos'
    }
  }

  return data
}

export const analyzeItem = async (itemId) => {
  return apiCall(`/items/${itemId}/ai/analyze`, {
    method: 'POST'
  })
}

export const approveItem = async (itemId, itemData) => {
  return apiCall(`/items/${itemId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(itemData)
  })
}

export const reopenItem = async (itemId, reason) => {
  return apiCall(`/items/${itemId}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  })
}

export const updateEstateSalePrice = async (itemId, itemNumber, estateSalePrice) => {
  return apiCall(`/items/${itemId}/estate-sale-price`, {
    method: 'PATCH',
    body: JSON.stringify({ itemNumber, estateSalePrice })
  })
}

export const markItemAsSold = async (itemId, itemNumber, estateSalePrice) => {
  return apiCall(`/items/${itemId}/mark-sold`, {
    method: 'PATCH',
    body: JSON.stringify({ itemNumber, estateSalePrice })
  })
}