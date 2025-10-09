export const saveAuth = (token, user) => {
  localStorage.setItem('kh_token', token)
  localStorage.setItem('kh_user', JSON.stringify(user))
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
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('kh_token')
}