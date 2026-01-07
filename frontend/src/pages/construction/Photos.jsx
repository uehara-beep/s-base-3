import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Photos() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    project_id: '',
    category: 'progress',
    description: '',
    taken_at: new Date().toISOString().split('T')[0],
    file: null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [photosRes, projectsRes] = await Promise.all([
        api.get('/photos/'),
        api.get('/projects/')
      ])
      setPhotos(Array.isArray(photosRes.data) ? photosRes.data : [])
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setPhotos([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    progress: { label: '施工中', color: 'blue' },
    before: { label: '施工前', color: 'gray' },
    after: { label: '施工後', color: 'green' },
    safety: { label: '安全', color: 'yellow' },
    defect: { label: '不具合', color: 'red' },
    other: { label: 'その他', color: 'purple' },
  }

  const filteredPhotos = photos.filter(photo =>
    selectedProject === 'all' || photo.project_id === parseInt(selectedProject)
  )

  const groupedPhotos = filteredPhotos.reduce((groups, photo) => {
    const date = photo.taken_at?.split('T')[0] || 'unknown'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(photo)
    return groups
  }, {})

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadData({ ...uploadData, file })
    }
  }

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('写真を選択してください')
      return
    }

    const formData = new FormData()
    formData.append('file', uploadData.file)
    formData.append('project_id', uploadData.project_id)
    formData.append('category', uploadData.category)
    formData.append('description', uploadData.description)
    formData.append('taken_at', uploadData.taken_at)

    try {
      setUploading(true)
      await api.post('/photos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowUploadModal(false)
      setUploadData({
        project_id: '',
        category: 'progress',
        description: '',
        taken_at: new Date().toISOString().split('T')[0],
        file: null,
      })
      fetchData()
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId) => {
    if (!confirm('この写真を削除しますか？')) return
    try {
      await api.delete(`/photos/${photoId}`)
      setSelectedPhoto(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/construction')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">工事写真</h1>
              <p className="text-gray-400 text-sm">現場写真の管理</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="glass-button glass-green rounded-xl px-4 py-2 text-white font-semibold"
          >
            📷 写真追加
          </button>
        </div>

        {/* Filter */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-gray-400 text-sm">現場で絞り込み:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
            >
              <option value="all">すべての現場</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <div className="text-gray-500 text-sm ml-auto">
              {filteredPhotos.length} 枚
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : Object.keys(groupedPhotos).length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-gray-400">写真がありません</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 glass-button glass-green rounded-xl px-6 py-2 text-white"
            >
              最初の写真をアップロード
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPhotos)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, datePhotos]) => (
                <div key={date}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    {date === 'unknown' ? '日付不明' : new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    <span className="text-gray-500 text-sm font-normal">({datePhotos.length}枚)</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {datePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="glass-button rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      >
                        <div className="aspect-square bg-white/5 flex items-center justify-center">
                          {photo.thumbnail_url ? (
                            <img
                              src={photo.thumbnail_url}
                              alt={photo.description}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">🖼️</span>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded bg-${categories[photo.category]?.color || 'gray'}-500/30 text-${categories[photo.category]?.color || 'gray'}-300`}>
                              {categories[photo.category]?.label || photo.category}
                            </span>
                          </div>
                          {photo.description && (
                            <p className="text-gray-400 text-xs truncate">{photo.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Stats */}
        {!loading && photos.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {Object.entries(categories).map(([key, { label, color }]) => (
                <div key={key}>
                  <div className="text-gray-400 text-xs">{label}</div>
                  <div className={`text-${color}-400 text-xl font-bold`}>
                    {photos.filter(p => p.category === key).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-button rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">写真アップロード</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">写真を選択 *</label>
                <label className="block glass-button rounded-xl p-8 text-center cursor-pointer hover:bg-white/10 border-2 border-dashed border-white/20">
                  {uploadData.file ? (
                    <div className="text-green-400">
                      <span className="text-2xl">✓</span>
                      <p className="text-sm mt-2">{uploadData.file.name}</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <span className="text-3xl">📷</span>
                      <p className="text-sm mt-2">クリックして写真を選択</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">現場</label>
                <select
                  value={uploadData.project_id}
                  onChange={(e) => setUploadData({ ...uploadData, project_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">選択してください</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">カテゴリ</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    {Object.entries(categories).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">撮影日</label>
                  <input
                    type="date"
                    value={uploadData.taken_at}
                    onChange={(e) => setUploadData({ ...uploadData, taken_at: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">説明</label>
                <input
                  type="text"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="写真の説明"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="glass-button rounded-xl px-4 py-2 text-gray-300"
                disabled={uploading}
              >
                キャンセル
              </button>
              <button
                onClick={handleUpload}
                className="glass-button glass-green rounded-xl px-4 py-2 text-white font-semibold"
                disabled={uploading}
              >
                {uploading ? 'アップロード中...' : 'アップロード'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className={`text-sm px-2 py-1 rounded bg-${categories[selectedPhoto.category]?.color || 'gray'}-500/30 text-${categories[selectedPhoto.category]?.color || 'gray'}-300`}>
                  {categories[selectedPhoto.category]?.label || selectedPhoto.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1"
                >
                  削除
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-white text-2xl hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl overflow-hidden">
              {selectedPhoto.file_url ? (
                <img
                  src={selectedPhoto.file_url}
                  alt={selectedPhoto.description}
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-6xl">🖼️</div>
              )}
            </div>
            {selectedPhoto.description && (
              <p className="text-white mt-4 text-center">{selectedPhoto.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-2 text-center">
              {selectedPhoto.taken_at && new Date(selectedPhoto.taken_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
