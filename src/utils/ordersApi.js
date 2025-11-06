import { apiCall } from './api'

export const getOrder = async (orderId) => {
  return apiCall(`/orders/${orderId}`)
}

export const listMyOrders = async () => {
  return apiCall('/orders')
}

export const saveDeliveryDetails = async (orderId, deliveryData) => {
  return apiCall(`/orders/${orderId}/delivery`, {
    method: 'POST',
    body: JSON.stringify(deliveryData)
  })
}

export const listAllOrders = async (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.append('page', params.page)
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.status) queryParams.append('status', params.status)
  if (params.fulfillmentStatus) queryParams.append('fulfillmentStatus', params.fulfillmentStatus)
  
  const queryString = queryParams.toString()
  return apiCall(`/orders/admin/all${queryString ? `?${queryString}` : ''}`)
}

export const getOrderById = async (orderId) => {
  return apiCall(`/orders/admin/${orderId}`)
}

export const updateOrderStatus = async (orderId, updateData) => {
  return apiCall(`/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  })
}