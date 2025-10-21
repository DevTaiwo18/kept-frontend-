import { apiCall } from './api'

const CART_UPDATE_EVENT = 'cartUpdated'

let cartCache = null
let cacheTimestamp = null
const CACHE_DURATION = 30000

const dispatchCartUpdate = () => {
  window.dispatchEvent(new Event(CART_UPDATE_EVENT))
}

export const addToCart = async (itemId) => {
  const result = await apiCall('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  })
  cartCache = result
  cacheTimestamp = Date.now()
  dispatchCartUpdate()
  return result
}

export const getCart = async (forceRefresh = false) => {
  if (!forceRefresh && cartCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cartCache
  }
  
  const result = await apiCall('/cart')
  cartCache = result
  cacheTimestamp = Date.now()
  return result
}

export const removeFromCart = async (itemId) => {
  const result = await apiCall(`/cart/remove/${itemId}`, {
    method: 'DELETE'
  })
  cartCache = result
  cacheTimestamp = Date.now()
  dispatchCartUpdate()
  return result
}

export const clearCart = async () => {
  const result = await apiCall('/cart/clear', {
    method: 'DELETE'
  })
  cartCache = { items: [], total: 0, count: 0 }
  cacheTimestamp = Date.now()
  dispatchCartUpdate()
  return result
}

export const getCachedCart = () => {
  return cartCache
}

export const invalidateCartCache = () => {
  cartCache = null
  cacheTimestamp = null
}

export const onCartUpdate = (callback) => {
  window.addEventListener(CART_UPDATE_EVENT, callback)
  return () => window.removeEventListener(CART_UPDATE_EVENT, callback)
}