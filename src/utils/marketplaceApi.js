import { apiCall } from './api'

export const getMarketplaceItems = async (query = {}) => {
  const params = new URLSearchParams(query).toString()
  return apiCall(`/marketplace/items${params ? `?${params}` : ''}`)
}

export const searchMarketplaceItems = async (query = {}) => {
  const params = new URLSearchParams(query).toString()
  return apiCall(`/marketplace/items/search${params ? `?${params}` : ''}`)
}

export const getMarketplaceItem = async (itemId) => {
  return apiCall(`/marketplace/items/${itemId}`)
}

export const getRelatedMarketplaceItems = async (itemId) => {
  return apiCall(`/marketplace/items/${itemId}/related`)
}