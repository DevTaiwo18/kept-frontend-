import { apiCall } from './api'

export const createClientJob = async (jobData) => {
  return apiCall('/client-jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  })
}

export const uploadJobContract = async (jobId, contractFileUrl) => {
  return apiCall(`/client-jobs/${jobId}/upload-contract`, {
    method: 'POST',
    body: JSON.stringify({ contractFileUrl })
  })
}

export const signClientJobContract = async (jobId, signatureDataUrl) => {
  return apiCall(`/client-jobs/${jobId}/sign-contract`, {
    method: 'POST',
    body: JSON.stringify({ signatureDataUrl })
  })
}

export const markWelcomeEmailSent = async (jobId, contractFileUrl) => {
  return apiCall(`/client-jobs/${jobId}/mark-welcome-sent`, {
    method: 'POST',
    body: JSON.stringify({ contractFileUrl })
  })
}

export const requestClientJobDeposit = async (jobId, depositRequestData) => {
  return apiCall(`/client-jobs/${jobId}/request-deposit`, {
    method: 'POST',
    body: JSON.stringify(depositRequestData)
  })
}

export const updateClientJobDeposit = async (jobId, depositData) => {
  return apiCall(`/client-jobs/${jobId}/deposit`, {
    method: 'PUT',
    body: JSON.stringify(depositData)
  })
}

export const getClientJobs = async () => {
  return apiCall('/client-jobs')
}

export const getClientJobById = async (jobId) => {
  return apiCall(`/client-jobs/${jobId}`)
}

export const updateClientJobProgress = async (jobId, stage, note) => {
  return apiCall(`/client-jobs/${jobId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({
      progressStage: stage,
      note: note || ''
    })
  })
}

export const payClientJobDeposit = async (jobId) => {
  return apiCall(`/client-jobs/${jobId}/deposit/checkout`, {
    method: 'POST'
  })
}

export const uploadContract = async (jobId, file) => {
  const formData = new FormData()
  formData.append('contract', file)
  
  const response = await fetch(`${API_BASE_URL}/client-jobs/${jobId}/upload-contract`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload contract')
  }
  
  return response.json()
}

export const getDocuSignSigningUrl = async (jobId) => {
  return apiCall(`/docusign/signing-url/${jobId}`)
}

export const checkDocuSignContractStatus = async (jobId) => {
  return apiCall(`/docusign/check-status/${jobId}`)
}