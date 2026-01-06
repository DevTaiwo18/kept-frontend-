import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth } from '../utils/auth'
import { sendTemplateEmail } from '../utils/emailTemplatesApi'
import { markWelcomeEmailSent } from '../utils/clientJobsApi'
import { uploadFiles } from '../utils/fileUploadApi'
import AdminLayout from '../components/AdminLayout'

function EmailTemplatesPage() {
  const auth = getAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const jobData = location.state?.job

  const [showComposeModal, setShowComposeModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [sendError, setSendError] = useState('')
  const [emailData, setEmailData] = useState({
    to: jobData?.contactEmail || jobData?.client?.email || '',
    recipientName: jobData?.contractSignor || jobData?.client?.name || '',
    subject: '',
    message: ''
  })

  const templateTypes = [
    {
      key: 'welcome',
      name: 'Welcome Email',
      icon: '👋',
      description: 'Send a warm welcome with contract attached',
      defaultSubject: 'Welcome to Kept House Estate Transitions!',
      defaultMessage: `Hello [Client Name],

Thank you for choosing Kept House Estate Transitions! We're excited to help you with your estate transition at [Property Address].

IMPORTANT - Your Contract Agreement

I've attached your contract agreement to this email. Please review it carefully.

Ready to Sign? You Have Two Options:

Option 1: Sign Instantly on Our Platform (RECOMMENDED)
Sign in to your Kept House account right now and sign the contract immediately:
https://keptestate.com/login

Option 2: Wait for DocuSign Email
You will also receive a separate email from DocuSign within the next few minutes with a signing link. This may take 5-10 minutes to arrive.

We recommend using Option 1 (our platform) for instant signing!

Once you've signed the contract, we'll proceed with the next steps to activate your project.

Our team is dedicated to making this process as smooth and stress-free as possible. We'll be in touch soon with next steps.

If you have any questions or need help signing, feel free to reach out at any time.

Best regards,
[Your Name]
Kept House Estate Transitions`
    },
    {
      key: 'progress_report',
      name: 'Progress Update',
      icon: '📊',
      description: 'Share project progress with clients',
      defaultSubject: 'Update on Your Estate Transition Progress',
      defaultMessage: `Hello [Client Name],

I wanted to give you a quick update on your estate transition at [Property Address].

Current Status: [Current Stage]

[Add your update details here]

We're making great progress and will continue to keep you informed every step of the way.

Please don't hesitate to reach out if you have any questions.

Best regards,
[Your Name]
Kept House Estate Transitions`
    },
    {
      key: 'closeout',
      name: 'Final Summary',
      icon: '✅',
      description: 'Send completion summary and final details',
      defaultSubject: 'Your Estate Transition - Final Summary',
      defaultMessage: `Hello [Client Name],

Your estate transition at [Property Address] has been completed successfully!

[Add your final summary details here]

It has been a pleasure working with you. If you need anything else or have questions about your final statement, please let us know.

Thank you for trusting Kept House Estate Transitions!

Best regards,
[Your Name]
Kept House Estate Transitions`
    }
  ]

  const handleBack = () => {
    if (jobData?._id) {
      navigate(`/agent/job/${jobData._id}`)
    } else {
      navigate('/dashboard/agent')
    }
  }

  const handleSelectTemplate = (templateType) => {
    const template = templateType
    const recipientEmail = jobData?.contactEmail || jobData?.client?.email || ''
    const recipientName = jobData?.contractSignor || jobData?.client?.name || ''

    let message = template.defaultMessage
    message = message.replace(/\[Client Name\]/g, recipientName || '[Client Name]')
    message = message.replace(/\[Property Address\]/g, jobData?.propertyAddress || '[Property Address]')
    message = message.replace(/\[Your Name\]/g, auth?.user?.name || '[Your Name]')
    message = message.replace(/\[Current Stage\]/g, jobData?.stage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '[Current Stage]')

    setEmailData({
      to: recipientEmail,
      recipientName: recipientName,
      subject: template.defaultSubject,
      message: message
    })

    setAttachments([])
    setUploadError('')
    setSendError('')
    setSelectedTemplate(template)
    setShowComposeModal(true)
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    setUploadError('')

    if (selectedTemplate.key === 'welcome') {
      const nonPdfFiles = files.filter(file => !file.name.toLowerCase().endsWith('.pdf'))
      if (nonPdfFiles.length > 0) {
        setUploadError('⚠️ Only PDF files are accepted for contract attachments. Please convert your document to PDF before uploading.')
        return
      }
    }

    const validFiles = files.filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        setUploadError('Files must be under 25MB')
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setIsUploading(true)

      const response = await uploadFiles(validFiles)

      if (response.success) {
        setUploadedFiles(prev => [...prev, ...response.files])
        setAttachments(prev => [...prev, ...validFiles])
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePreview = () => {
    setPreviewData({
      subject: emailData.subject,
      text: emailData.message,
      html: emailData.message.replace(/\n/g, '<br>')
    })
    setShowPreviewModal(true)
  }

  const handleSend = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      setSendError('Please fill in all required fields')
      return
    }

    if (selectedTemplate.key === 'welcome' && uploadedFiles.length === 0) {
      setSendError('Please attach a PDF contract file before sending the welcome email')
      return
    }

    try {
      setIsSending(true)
      setSendError('')
      setShowComposeModal(false)
      setShowPreviewModal(false)

      const payload = {
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.message,
        html: emailData.message.replace(/\n/g, '<br>'),
        jobId: jobData?._id,
        context: {
          clientName: emailData.recipientName || 'Valued Client',
          agentName: auth?.user?.name || 'Kept House Team',
          propertyAddress: jobData?.propertyAddress || 'Your Property',
        }
      }

      if (uploadedFiles.length > 0) {
        payload.attachments = uploadedFiles.map(file => ({
          filename: file.filename,
          path: file.path,
        }))
      }

      await sendTemplateEmail(selectedTemplate.key, payload)

      if (selectedTemplate.key === 'welcome' && jobData?._id) {
        try {
          const contractFileUrl = uploadedFiles.length > 0 ? uploadedFiles[0].path : null
          await markWelcomeEmailSent(jobData._id, contractFileUrl)
        } catch (err) {
          console.error('Failed to mark welcome email as sent:', err)
        }
      }

      setIsSending(false)

      const successMsg = document.createElement('div')
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      successMsg.textContent = '✓ Email sent successfully!'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)

      handleBack()
    } catch (err) {
      console.error('Send error:', err)
      setSendError(err.message || 'Failed to send email')
      setIsSending(false)
      setShowComposeModal(true)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-6 text-[#707072] hover:text-[#101010] flex items-center gap-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back
        </button>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101010] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Send Email
          </h1>
          <p className="text-sm sm:text-base text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {jobData ? `Sending to ${jobData.contractSignor || 'client'}` : 'Choose a template and compose your message'}
          </p>
        </div>

        {jobData && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Recipient Information
                </h3>
                <p className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>{jobData.contractSignor}</strong> - {jobData.contactEmail}
                </p>
                <p className="text-xs text-blue-700 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Property: {jobData.propertyAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {templateTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => handleSelectTemplate(type)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all text-left group"
            >
              <div className="p-6">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="text-xl font-bold text-[#101010] mb-2 group-hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {type.name}
                </h3>
                <p className="text-sm text-[#707072] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {type.description}
                </p>
                <div className="flex items-center gap-2 text-[#e6c35a] font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span>Use This Template</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isSending && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="animate-bounce">
                  <svg className="w-20 h-20 mx-auto text-[#e6c35a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-transparent border-t-[#e6c35a] rounded-full animate-spin"></div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-[#101010] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sending Email
            </h3>

            <p className="text-sm text-[#707072] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Please wait while we deliver your message...
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-[#e6c35a] rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="mt-6 p-4 bg-[#F8F5F0] rounded-lg text-left">
              <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Sending to:</p>
              <p className="text-sm font-semibold text-[#101010] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                {emailData.to}
              </p>
              {attachments.length > 0 && (
                <p className="text-xs text-[#707072] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  📎 {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showComposeModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#101010] text-white p-6 flex justify-between items-center rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-white hover:text-[#e6c35a] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {sendError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ⚠️ {sendError}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    To (Email Address) *
                  </label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={emailData.recipientName}
                    onChange={(e) => setEmailData({ ...emailData, recipientName: e.target.value })}
                    className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Client Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#101010] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Message *
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows="14"
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Type your message here..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Attachments {selectedTemplate.key === 'welcome' && <span className="text-red-600">*</span>}
                  </label>
                  <label className={`px-4 py-2 bg-white border-2 text-black rounded-lg text-sm font-semibold transition-all ${isUploading ? 'border-gray-300 cursor-not-allowed opacity-50' : 'border-[#e6c35a] hover:bg-[#e6c35a] cursor-pointer'}`}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept={selectedTemplate.key === 'welcome' ? '.pdf' : '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls'}
                      disabled={isUploading}
                    />
                    {isUploading ? '⏳ Uploading...' : '📎 Attach Files'}
                  </label>
                </div>

                {selectedTemplate.key === 'welcome' && (
                  <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      📄 PDF Contract Required
                    </p>
                    <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Please attach the contract as a PDF file. The client will receive a DocuSign email to sign electronically.
                    </p>
                  </div>
                )}

                {uploadError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {uploadError}
                    </p>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 flex-1">
                          {uploadedFiles[index] ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#101010] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {file.name}
                            </p>
                            <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {formatFileSize(file.size)} {uploadedFiles[index] && <span className="text-green-600">• Ready to send</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="ml-3 text-red-600 hover:text-red-800 transition-colors"
                          title="Remove"
                          disabled={isUploading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  💡 {selectedTemplate.key === 'welcome' ? 'PDF files only for contract attachments (Max 25MB)' : 'You can attach contracts, reports, photos, or any documents (Max 25MB per file)'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowComposeModal(false)}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePreview}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#e6c35a] transition-all disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Preview
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#101010] text-white p-6 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Email Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:text-[#e6c35a] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#F8F5F0] p-4 rounded-lg">
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>To:</p>
                <p className="text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {emailData.to} {emailData.recipientName && `(${emailData.recipientName})`}
                </p>
              </div>

              <div className="bg-[#F8F5F0] p-4 rounded-lg">
                <p className="text-xs text-[#707072] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Subject:</p>
                <p className="text-base font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {previewData.subject}
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900 font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    📎 Attachments ({attachments.length})
                  </p>
                  <div className="space-y-1">
                    {attachments.map((file, i) => (
                      <p key={i} className="text-sm text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                        • {file.name} ({formatFileSize(file.size)})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-[#707072] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Message:</p>
                <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
                  <pre className="whitespace-pre-wrap text-sm text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {previewData.text}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#707072] text-[#101010] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false)
                    handleSend()
                  }}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isSending ? 'Sending...' : 'Looks Good - Send Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </AdminLayout>
  )
}

export default EmailTemplatesPage