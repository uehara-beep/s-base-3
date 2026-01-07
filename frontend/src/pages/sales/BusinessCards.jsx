import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function BusinessCards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [formData, setFormData] = useState({
    company_name: '',
    department: '',
    position: '',
    name: '',
    name_kana: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await api.get('/business-cards/')
      setCards(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching business cards:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCards = cards.filter(card =>
    card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedCards = filteredCards.reduce((groups, card) => {
    const company = card.company_name || 'その他'
    if (!groups[company]) {
      groups[company] = []
    }
    groups[company].push(card)
    return groups
  }, {})

  const openModal = (card = null) => {
    if (card) {
      setEditingCard(card)
      setFormData({
        company_name: card.company_name || '',
        department: card.department || '',
        position: card.position || '',
        name: card.name || '',
        name_kana: card.name_kana || '',
        email: card.email || '',
        phone: card.phone || '',
        mobile: card.mobile || '',
        address: card.address || '',
        notes: card.notes || '',
      })
    } else {
      setEditingCard(null)
      setFormData({
        company_name: '',
        department: '',
        position: '',
        name: '',
        name_kana: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingCard) {
        await api.put(`/business-cards/${editingCard.id}`, formData)
      } else {
        await api.post('/business-cards/', formData)
      }
      setShowModal(false)
      fetchCards()
    } catch (error) {
      console.error('Error saving business card:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!editingCard || !confirm('この名刺を削除しますか？')) return
    try {
      await api.delete(`/business-cards/${editingCard.id}`)
      setShowModal(false)
      fetchCards()
    } catch (error) {
      console.error('Error deleting business card:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      const response = await api.post('/business-cards/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response) {
        setFormData(prev => ({
          ...prev,
          ...response
        }))
      }
    } catch (error) {
      console.error('OCR scan error:', error)
      alert('名刺の読み取りに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(249, 115, 22, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">名刺管理</h1>
              <p className="text-gray-400 text-sm">取引先連絡先の管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-orange rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 名刺追加
          </button>
        </div>

        {/* Search */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <input
            type="text"
            placeholder="検索（名前、会社名、メールアドレス）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        {/* Cards List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : Object.keys(groupedCards).length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-gray-400">名刺データがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 glass-button glass-orange rounded-xl px-6 py-2 text-white"
            >
              最初の名刺を登録
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCards).sort((a, b) => a[0].localeCompare(b[0], 'ja')).map(([company, companyCards]) => (
              <div key={company} className="glass-button rounded-2xl p-4">
                <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  {company}
                  <span className="text-gray-500 text-sm font-normal">({companyCards.length}名)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => openModal(card)}
                      className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {card.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">{card.name}</div>
                          {card.department && (
                            <div className="text-gray-400 text-xs truncate">{card.department}</div>
                          )}
                          {card.position && (
                            <div className="text-gray-500 text-xs truncate">{card.position}</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {card.email && (
                          <div className="text-blue-400 text-sm truncate flex items-center gap-2">
                            <span>✉️</span>
                            {card.email}
                          </div>
                        )}
                        {card.phone && (
                          <div className="text-gray-400 text-sm truncate flex items-center gap-2">
                            <span>📞</span>
                            {card.phone}
                          </div>
                        )}
                        {card.mobile && (
                          <div className="text-gray-400 text-sm truncate flex items-center gap-2">
                            <span>📱</span>
                            {card.mobile}
                          </div>
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
        {!loading && cards.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">登録名刺数</div>
                <div className="text-white text-2xl font-bold">{cards.length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">会社数</div>
                <div className="text-white text-2xl font-bold">{Object.keys(groupedCards).length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">メール登録率</div>
                <div className="text-white text-2xl font-bold">
                  {cards.length > 0 ? Math.round((cards.filter(c => c.email).length / cards.length) * 100) : 0}%
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
              {editingCard ? '名刺を編集' : '新規名刺登録'}
            </h3>

            {/* OCR Scan Button */}
            {!editingCard && (
              <div className="mb-4">
                <label className="block glass-button glass-blue rounded-xl p-4 text-center cursor-pointer hover:bg-white/20">
                  <span className="text-white">📷 名刺を撮影してスキャン</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-gray-400 text-sm mb-2">会社名 *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="株式会社○○"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">部署</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="営業部"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">役職</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="部長"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">氏名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">ふりがな</label>
                  <input
                    type="text"
                    value={formData.name_kana}
                    onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="やまだ たろう"
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
                  placeholder="example@company.co.jp"
                />
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
                  <label className="block text-gray-400 text-sm mb-2">携帯番号</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="090-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">住所</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="東京都..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">メモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="備考"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {editingCard && (
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
                  className="glass-button glass-orange rounded-xl px-4 py-2 text-white font-semibold"
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
