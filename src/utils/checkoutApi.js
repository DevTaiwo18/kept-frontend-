import { apiCall } from './api';

export async function calculateCheckoutTotals(deliveryData) {
  return apiCall('/checkout/calculate-totals', {
    method: 'POST',
    body: JSON.stringify(deliveryData)
  });
}

export async function createCheckoutSession(deliveryData) {
  return apiCall('/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify(deliveryData)
  });
}