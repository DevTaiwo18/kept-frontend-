import { apiCall } from './api';

export async function createCheckoutSession() {
  return apiCall('/checkout/create-session', { method: 'POST' });
}
