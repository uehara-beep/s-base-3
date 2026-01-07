import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function SiteList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    site_address: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    manager_name: '',
    notes: '',
  })
  const [clients, setClients] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/clients/')
      ])
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setProjects([])
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      planning: 'bg-gray-500/30 text-gray-300',
      in_progress: 'bg-blue-500/30 text-blue-300',
      completed: 'bg-green-500/30 text-green-300',
      on_hold: 'bg-yellow-500/30 text-yellow-300',
    }
    const labels = {
      planning: '計画中',
      in_progress: '施工中',
      completed: '完了',
      on_hold: '中断',
    }
    return (
      <span className={`px-2 py-1 rounded-lg text-xs ${styles[status] || styles.planning}`}>
        {labels[status] || status}
      </span>
    )
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.site_address?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name || '',
        client_id: project.client_id || '',
        site_address: project.site_address || '',
        status: project.status || 'planning',
        start_date: project.start_date?.split('T')[0] || '',
        end_date: project.end_date?.split('T')[0] || '',
        manager_name: project.manager_name || '',
        notes: project.notes || '',
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        client_id: '',
        site_address: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        manager_name: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
      }
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data)
      } else {
        await api.post('/projects/', data)
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('保存に失敗しました')
    }
  }

  const calculateProgress = (project) => {
    if (!project.start_date || !project.end_date) return 0
    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
    const now = new Date()
    if (now < start) return 0
    if (now > end) return 100
    const total = end - start
    const elapsed = now - start
    return Math.round((elapsed / total) * 100)
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
              <h1 className="text-2xl font-bold text-white">現場一覧</h1>
              <p className="text-gray-400 text-sm">工事現場の管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-blue rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 現場追加
          </button>
        </div>

        {/* Filters */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="検索（現場名、住所）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
            >
              <option value="all">全ステータス</option>
              <option value="planning">計画中</option>
              <option value="in_progress">施工中</option>
              <option value="completed">完了</option>
              <option value="on_hold">中断</option>
            </select>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <p className="text-gray-400">現場データがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 glass-button glass-blue rounded-xl px-6 py-2 text-white"
            >
              最初の現場を登録
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project)
              return (
                <div
                  key={project.id}
                  onClick={() => openModal(project)}
                  className="glass-button rounded-2xl p-5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                    {getStatusBadge(project.status)}
                  </div>

                  {project.site_address && (
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                      <span>📍</span> {project.site_address}
                    </p>
                  )}

                  {project.manager_name && (
                    <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                      <span>👷</span> {project.manager_name}
                    </p>
                  )}

                  {/* Progress Bar */}
                  {project.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>進捗</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
                    <span>
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('ja-JP') : '未定'}
                      {' 〜 '}
                      {project.end_date ? new Date(project.end_date).toLocaleDateString('ja-JP') : '未定'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && projects.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">計画中</div>
                <div className="text-gray-300 text-2xl font-bold">
                  {projects.filter(p => p.status === 'planning').length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">施工中</div>
                <div className="text-blue-400 text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">完了</div>
                <div className="text-green-400 text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">中断</div>
                <div className="text-yellow-400 text-2xl font-bold">
                  {projects.filter(p => p.status === 'on_hold').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingProject ? '現場を編集' : '新規現場登録'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">現場名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="○○邸新築工事"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">得意先</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">選択してください</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">現場住所</label>
                <input
                  type="text"
                  value={formData.site_address}
                  onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="東京都..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">ステータス</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="planning">計画中</option>
                  <option value="in_progress">施工中</option>
                  <option value="completed">完了</option>
                  <option value="on_hold">中断</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">着工日</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">完工予定日</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">現場責任者</label>
                <input
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="担当者名"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">備考</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="glass-button rounded-xl px-4 py-2 text-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="glass-button glass-blue rounded-xl px-4 py-2 text-white font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
