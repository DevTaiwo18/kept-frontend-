import { apiCall } from './api'

export const getOrder = async (orderId) => {
  return apiCall(`/orders/${orderId}`)
}

export const listMyOrders = async () => {
  return apiCall('/orders')
}

export const saveDeliveryDetails = async (orderId, deliveryData) => {
  return apiCall(`/orders/${orderId}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify(deliveryData)
  })
}