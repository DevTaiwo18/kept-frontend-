import { apiCall } from './api'

export const createClientJob = async (jobData) => {
  return apiCall('/client-jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  })
}

export const getClientJobs = async () => {
  return apiCall('/client-jobs')
}

export const getClientJobById = async (jobId) => {
  return apiCall(`/client-jobs/${jobId}`)
}

export const updateJobStatus = async (jobId, stage, note) => {
  await apiCall(`/client-jobs/${jobId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ progressStage: stage })
  })

  if (note && note.trim()) {
    await apiCall(`/client-jobs/${jobId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ stage, note })
    })
  }
  
  return { success: true }
}