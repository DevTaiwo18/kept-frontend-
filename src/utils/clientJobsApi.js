import { apiCall } from './api'

export const createClientJob = async (jobData) => {
  return apiCall('/client-jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
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
