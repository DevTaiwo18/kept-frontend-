import { useState, useEffect } from 'react'
import { addHaulerVideo, deleteHaulerVideo, getHaulerVideos } from '../utils/clientJobsApi'

function HaulerVideosSection({ job, onUpdate }) {
  const [videos, setVideos] = useState([])
  const [isAddingVideo, setIsAddingVideo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const [videoFile, setVideoFile] = useState(null)
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    if (job && job._id) {
      loadVideos()
    }
  }, [job])

  const loadVideos = async () => {
    try {
      setIsLoading(true)
      const data = await getHaulerVideos(job._id)
      setVideos(data.videos || [])
    } catch (err) {
      console.error('Failed to load videos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('Video file must be less than 500MB')
        return
      }
      setVideoFile(file)
      setError('')
    }
  }

  const handleAddVideo = async () => {
    if (!videoFile) {
      setError('Please select a video file')
      return
    }

    if (!newVideo.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setIsUploading(true)
      setError('')

      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('title', newVideo.title)
      if (newVideo.description) {
        formData.append('description', newVideo.description)
      }

      await addHaulerVideo(job._id, formData)
      await loadVideos()
      await onUpdate()
      
      setNewVideo({ title: '', description: '' })
      setVideoFile(null)
      setIsAddingVideo(false)
    } catch (err) {
      setError(err.message || 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteHaulerVideo(job._id, videoId)
      await loadVideos()
      await onUpdate()
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message || 'Failed to delete video')
      setDeleteConfirm(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-2">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Hauler Videos</h3>
        <button
          onClick={() => setIsAddingVideo(!isAddingVideo)}
          className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-all text-sm"
        >
          {isAddingVideo ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-xs text-red-500 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {isAddingVideo && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-bold text-purple-900 mb-3">Upload New Video</h4>
          
          {isUploading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-purple-900 font-semibold">Uploading video...</p>
              <p className="text-xs text-purple-700 mt-1">This may take a few minutes</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1">
                  Video File (Max 500MB)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
                {videoFile && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="Full House Walkthrough"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none"
                />
              </div>
              <button
                onClick={handleAddVideo}
                disabled={!videoFile}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Video
              </button>
            </div>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-2">No videos uploaded yet</p>
          <p className="text-sm text-gray-500">Upload videos to help haulers assess the job</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const videoId = video._id || 'video-' + index
            const videoTitle = video.title || 'Video ' + (index + 1)
            const videoUrl = video.url || ''
            const videoDesc = video.description || ''
            const uploadDate = video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : ''
            
            return (
              <div key={videoId} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-yellow-500 transition-all">
                <div className="aspect-video bg-gray-900 relative">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-base font-bold text-gray-900 mb-2">{videoTitle}</h4>
                  {videoDesc && (
                    <p className="text-sm text-gray-600 mb-3">{videoDesc}</p>
                  )}
                  {uploadDate && (
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded: {uploadDate}
                    </p>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(videoId)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all"
                  >
                    Delete Video
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Video?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HaulerVideosSection