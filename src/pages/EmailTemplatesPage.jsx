import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, clearAuth } from '../utils/auth'
import logo from '../assets/Kept House _transparent logo .png'

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
      description: 'Send a warm welcome to new clients',
      defaultSubject: 'Welcome to Kept House Estate Sales!',
      defaultMessage: `Hello {{client_name}},

Thank you for choosing Kept House Estate Sales! We're excited to help you with your estate sale at {{property_address}}.

Our team is dedicated to making this process as smooth and stress-free as possible. We'll be in touch soon with next steps.

If you have any questions, feel free to reach out at any time.

Best regards,
{{agent_name}}
Kept House Estate Sales`
    },
    { 
      key: 'progress_report', 
      name: 'Progress Update', 
      icon: '📊',
      description: 'Share project progress with clients',
      defaultSubject: 'Update on Your Estate Sale Progress',
      defaultMessage: `Hello {{client_name}},

I wanted to give you a quick update on your estate sale at {{property_address}}.

Current Status: {{current_stage}}

{{update_details}}

We're making great progress and will continue to keep you informed every step of the way.

Please don't hesitate to reach out if you have any questions.

Best regards,
{{agent_name}}
Kept House Estate Sales`
    },
    { 
      key: 'closeout', 
      name: 'Final Summary', 
      icon: '✅',
      description: 'Send completion summary and final details',
      defaultSubject: 'Your Estate Sale - Final Summary',
      defaultMessage: `Hello {{client_name}},

Your estate sale at {{property_address}} has been completed successfully!

Here's your final summary:

Total Sales: {{total_sales}}
Your Net Proceeds: {{net_proceeds}}

{{closeout_details}}

It has been a pleasure working with you. If you need anything else or have questions about your final statement, please let us know.

Thank you for trusting Kept House Estate Sales!

Best regards,
{{agent_name}}
Kept House Estate Sales`
    }
  ]

  const handleLogout = () => {
    clearAuth()
    navigate('/admin')
  }

  const handleBack = () => {
    if (jobData?._id) {
      navigate(`/agent/job/${jobData._id}`)
    } else {
      navigate('/dashboard/agent')
    }
  }

  const handleSelectTemplate = (templateType) => {
    const template = templateType
    
    // Auto-fill recipient info if we have job data
    const recipientEmail = jobData?.contactEmail || jobData?.client?.email || ''
    const recipientName = jobData?.contractSignor || jobData?.client?.name || ''
    
    setEmailData({
      to: recipientEmail,
      recipientName: recipientName,
      subject: template.defaultSubject,
      message: template.defaultMessage
    })
    
    setSelectedTemplate(template)
    setShowComposeModal(true)
  }

  const handlePreview = () => {
    // Create preview with replaced placeholders
    let previewSubject = emailData.subject
    let previewMessage = emailData.message
    
    const replacements = {
      'client_name': emailData.recipientName || '[Client Name]',
      'property_address': jobData?.propertyAddress || '[Property Address]',
      'agent_name': auth?.user?.name || '[Agent Name]',
      'current_stage': jobData?.stage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '[Current Stage]',
      'total_sales': jobData?.finance?.gross ? `$${jobData.finance.gross.toLocaleString()}` : '[Total Sales]',
      'net_proceeds': '[Net Proceeds]',
      'update_details': '[Your update details here]',
      'closeout_details': '[Closeout details here]'
    }
    
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      previewSubject = previewSubject.replace(regex, replacements[key])
      previewMessage = previewMessage.replace(regex, replacements[key])
    })
    
    setPreviewData({
      subject: previewSubject,
      text: previewMessage,
      html: previewMessage.replace(/\n/g, '<br>')
    })
    setShowPreviewModal(true)
  }

  const handleSend = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert('Please fill in all required fields')
      return
    }

    if (!confirm(`Send this email to ${emailData.to}?`)) {
      return
    }

    try {
      setIsSending(true)
      // TODO: Implement actual email sending API call
      // await sendEmail(emailData)
      
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Email sent successfully!')
      setShowComposeModal(false)
      handleBack()
    } catch (err) {
      alert(err.message || 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('message-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = emailData.message
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    
    setEmailData({
      ...emailData,
      message: before + `{{${placeholder}}}` + after
    })
    
    // Set cursor position after inserted placeholder
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length + 4
    }, 0)
  }

  const availablePlaceholders = [
    { key: 'client_name', label: 'Client Name' },
    { key: 'property_address', label: 'Property' },
    { key: 'agent_name', label: 'Your Name' },
    { key: 'current_stage', label: 'Stage' }
  ]

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#101010] text-[#F8F5F0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Kept House" className="h-10 sm:h-12 w-auto" />
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleBack}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-white border-2 border-[#e6c35a] text-black rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#e6c35a] transition-all whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="hidden sm:inline">← Back</span>
                <span className="sm:hidden">←</span>
              </button>
              <span className="text-xs sm:text-sm text-[#e6c35a] truncate max-w-[80px] sm:max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                {auth?.user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-[#707072] text-[#F8F5F0] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Compose Modal */}
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
                <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                  <label className="block text-sm font-semibold text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Message *
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>Quick Insert:</span>
                    {availablePlaceholders.map(placeholder => (
                      <button
                        key={placeholder.key}
                        type="button"
                        onClick={() => insertPlaceholder(placeholder.key)}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold hover:bg-blue-200 transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        title={`Insert ${placeholder.label}`}
                      >
                        {placeholder.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="message-textarea"
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows="16"
                  className="w-full px-4 py-3 border border-[#707072]/30 rounded-lg focus:outline-none focus:border-[#e6c35a] focus:ring-2 focus:ring-[#e6c35a]/20 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Type your message here..."
                />
                <p className="mt-2 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  💡 Tip: Use the buttons above to insert dynamic fields. Edit the message as needed before sending.
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

      {/* Preview Modal */}
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
                  className="flex-1 px-6 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Looks Good - Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplatesPage