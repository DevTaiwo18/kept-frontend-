import { getAuth } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://kept-api-vkc7.onrender.com/api'

export const uploadFiles = async (files) => {
  const formData = new FormData()

  files.forEach(file => {
    formData.append('files', file)
  })

  const auth = getAuth()
  const url = `${API_URL}/files/upload`

  console.log('📤 Uploading files to:', url)
  console.log('📤 Files:', files.map(f => f.name).join(', '))

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(auth?.token && { 'Authorization': `Bearer ${auth.token}` })
    },
    body: formData,
  })

  console.log('📤 Response status:', response.status)

  if (!response.ok) {
    const text = await response.text()
    console.error('📤 Upload error response:', text.substring(0, 200))

    let error = {}
    try {
      error = JSON.parse(text)
    } catch {
      error = { message: `Upload failed: ${response.status}` }
    }
    throw new Error(error.message || 'Failed to upload files')
  }

  return response.json()
}

export const deleteFile = async (cloudinaryId) => {
  return apiCall('/files/delete', {
    method: 'POST',
    body: JSON.stringify({ cloudinaryId })
  })
}