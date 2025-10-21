const AUTH_UPDATE_EVENT = 'authUpdated'

const dispatchAuthUpdate = () => {
  window.dispatchEvent(new Event(AUTH_UPDATE_EVENT))
}

export const saveAuth = (token, user) => {
  localStorage.setItem('kh_token', token)
  localStorage.setItem('kh_user', JSON.stringify(user))
  dispatchAuthUpdate()
}

export const getAuth = () => {
  const token = localStorage.getItem('kh_token')
  const user = localStorage.getItem('kh_user')
  
  if (token && user) {
    return {
      token,
      user: JSON.parse(user)
    }
  }
  
  return null
}

export const clearAuth = () => {
  localStorage.removeItem('kh_token')
  localStorage.removeItem('kh_user')
  dispatchAuthUpdate()
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('kh_token')
}

export const onAuthUpdate = (callback) => {
  window.addEventListener(AUTH_UPDATE_EVENT, callback)
  return () => window.removeEventListener(AUTH_UPDATE_EVENT, callback)
}