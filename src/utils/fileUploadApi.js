import { apiCall } from './api'

export const uploadFiles = async (files) => {
  const formData = new FormData()
  
  files.forEach(file => {
    formData.append('files', file)
  })

  return apiCall('/files/upload', {
    method: 'POST',
    body: formData,
  })
}

export const deleteFile = async (cloudinaryId) => {
  return apiCall('/files/delete', {
    method: 'POST',
    body: JSON.stringify({ cloudinaryId })
  })
}