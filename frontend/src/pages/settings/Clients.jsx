import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Clients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_kana: '',
    category: 'general',
    postal_code: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    contact_person: '',
    notes: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/')
      setClients(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    general: { label: '元請け', color: 'blue' },
    subcontractor: { label: '下請け', color: 'green' },
    supplier: { label: '仕入先', color: 'orange' },
    other: { label: 'その他', color: 'gray' },
  }

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        code: client.code || '',
        name: client.name || '',
        name_kana: client.name_kana || '',
        category: client.category || 'general',
        postal_code: client.postal_code || '',
        address: client.address || '',
        phone: client.phone || '',
        fax: client.fax || '',
        email: client.email || '',
        contact_person: client.contact_person || '',
        notes: client.notes || '',
      })
    } else {
      setEditingClient(null)
      setFormData({
        code: '',
        name: '',
        name_kana: '',
        category: 'general',
        postal_code: '',
        address: '',
        phone: '',
        fax: '',
        email: '',
        contact_person: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData)
      } else {
        await api.post('/clients/', formData)
      }
      setShowModal(false)
      fetchClients()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!editingClient || !confirm('この得意先を削除しますか？')) return
    try {
      await api.delete(`/clients/${editingClient.id}`)
      setShowModal(false)
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(156, 163, 175, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">元請けマスタ</h1>
              <p className="text-gray-400 text-sm">得意先・取引先の管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-gray rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 得意先追加
          </button>
        </div>

        {/* Search */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <input
            type="text"
            placeholder="検索（会社名、コード）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        {/* Client List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredClients.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🏢</div>
            <p className="text-gray-400">得意先データがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 glass-button glass-gray rounded-xl px-6 py-2 text-white"
            >
              最初の得意先を登録
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const cat = categories[client.category] || categories.general
              return (
                <div
                  key={client.id}
                  onClick={() => openModal(client)}
                  className="glass-button rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${cat.color}-500/20 flex items-center justify-center text-2xl`}>
                        🏢
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{client.name}</h3>
                          <span className={`bg-${cat.color}-500/30 text-${cat.color}-300 text-xs px-2 py-0.5 rounded`}>
                            {cat.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          {client.code && <span className="text-gray-500">{client.code}</span>}
                          {client.contact_person && <span>👤 {client.contact_person}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {client.phone && (
                        <div className="text-gray-400">📞 {client.phone}</div>
                      )}
                      {client.address && (
                        <div className="text-gray-500 text-xs mt-1">📍 {client.address}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        {!loading && clients.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              {Object.entries(categories).map(([key, { label, color }]) => (
                <div key={key}>
                  <div className="text-gray-400 text-sm">{label}</div>
                  <div className={`text-${color}-400 text-2xl font-bold`}>
                    {clients.filter(c => c.category === key).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingClient ? '得意先を編集' : '新規得意先登録'}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">コード</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="C001"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">区分</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    {Object.entries(categories).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">会社名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="株式会社〇〇"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">ふりがな</label>
                <input
                  type="text"
                  value={formData.name_kana}
                  onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="かぶしきがいしゃ〇〇"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">郵便番号</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="123-4567"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">住所</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="東京都..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">電話番号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="03-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">FAX</label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="03-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="info@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">担当者名</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="山田太郎"
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

            <div className="flex justify-between mt-6">
              <div>
                {editingClient && (
                  <button
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="glass-button rounded-xl px-4 py-2 text-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="glass-button glass-gray rounded-xl px-4 py-2 text-white font-semibold"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
