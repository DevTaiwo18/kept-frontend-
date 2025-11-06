import { apiCall } from './api'

const TEMPLATE_UPDATE_EVENT = 'templateUpdated'

let templateCache = null
let cacheTimestamp = null
const CACHE_DURATION = 30000

const dispatchTemplateUpdate = () => {
  window.dispatchEvent(new Event(TEMPLATE_UPDATE_EVENT))
}

export const getEmailTemplates = async (forceRefresh = false) => {
  if (!forceRefresh && templateCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return templateCache
  }

  const result = await apiCall('/email-templates')
  templateCache = result
  cacheTimestamp = Date.now()
  return result
}

export const getEmailTemplateByKey = async (key) => {
  return apiCall(`/email-templates/${key}`)
}

export const createOrUpdateEmailTemplate = async (data) => {
  const result = await apiCall('/email-templates', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  templateCache = null
  cacheTimestamp = null
  dispatchTemplateUpdate()
  return result
}

export const previewEmailTemplate = async (key, context = {}) => {
  return apiCall(`/email-templates/${key}/preview`, {
    method: 'POST',
    body: JSON.stringify({ context })
  })
}

export const getTemplateVersions = async (key) => {
  return apiCall(`/email-templates/${key}/versions`)
}

export const rollbackEmailTemplate = async (key, version) => {
  const result = await apiCall(`/email-templates/${key}/rollback`, {
    method: 'POST',
    body: JSON.stringify({ version })
  })
  dispatchTemplateUpdate()
  return result
}

export const toggleEmailTemplate = async (key, isActive) => {
  const result = await apiCall(`/email-templates/${key}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ isActive })
  })
  dispatchTemplateUpdate()
  return result
}

export const getCachedTemplates = () => {
  return templateCache
}

export const invalidateTemplateCache = () => {
  templateCache = null
  cacheTimestamp = null
}

export const onTemplateUpdate = (callback) => {
  window.addEventListener(TEMPLATE_UPDATE_EVENT, callback)
  return () => window.removeEventListener(TEMPLATE_UPDATE_EVENT, callback)
}
