const API_URL = 'http://localhost:4000/api'

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kh_token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Something went wrong'
    }
  }

  return data
}

export const register = async (formData) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
}

export const login = async (credentials) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export const getCurrentUser = async () => {
  return apiCall('/auth/me')
}