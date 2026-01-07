import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Inventory() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'material',
    quantity: 0,
    unit: '個',
    min_quantity: 0,
    location: '',
    notes: '',
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/')
      setItems(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    material: { label: '資材', icon: '📦', color: 'blue' },
    tool: { label: '工具', icon: '🔧', color: 'orange' },
    consumable: { label: '消耗品', icon: '🧴', color: 'green' },
    safety: { label: '安全用品', icon: '🦺', color: 'yellow' },
  }

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockItems = items.filter(item => item.quantity <= item.min_quantity)

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name || '',
        category: item.category || 'material',
        quantity: item.quantity || 0,
        unit: item.unit || '個',
        min_quantity: item.min_quantity || 0,
        location: item.location || '',
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        category: 'material',
        quantity: 0,
        unit: '個',
        min_quantity: 0,
        location: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, formData)
      } else {
        await api.post('/inventory/', formData)
      }
      setShowModal(false)
      fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!editingItem || !confirm('この在庫を削除しますか？')) return
    try {
      await api.delete(`/inventory/${editingItem.id}`)
      setShowModal(false)
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleQuantityChange = async (item, delta) => {
    const newQuantity = Math.max(0, item.quantity + delta)
    try {
      await api.put(`/inventory/${item.id}`, { ...item, quantity: newQuantity })
      fetchItems()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(168, 85, 247, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.2)', bottom: '-5%', right: '-5%' }} />

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
              <h1 className="text-2xl font-bold text-white">在庫管理</h1>
              <p className="text-gray-400 text-sm">資材・工具の在庫管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-purple rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 在庫追加
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mb-6 border-l-4 border-red-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-red-400 font-semibold">在庫不足アラート</h3>
                <p className="text-gray-400 text-sm">
                  {lowStockItems.map(item => item.name).join(', ')} の在庫が少なくなっています
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Category Filter */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="検索（品名、保管場所）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Inventory List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-400">在庫データがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 glass-button glass-purple rounded-xl px-6 py-2 text-white"
            >
              最初の在庫を登録
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isLowStock = item.quantity <= item.min_quantity
              const cat = categories[item.category] || categories.material
              return (
                <div
                  key={item.id}
                  className={`glass-button rounded-2xl p-4 ${isLowStock ? 'border border-red-500/30' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${cat.color}-500/20 flex items-center justify-center text-2xl`}>
                        {cat.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{item.name}</h3>
                          {isLowStock && (
                            <span className="bg-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded">
                              在庫少
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className={`text-${cat.color}-400`}>{cat.label}</span>
                          {item.location && <span>📍 {item.location}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                        >
                          -
                        </button>
                        <div className="text-center min-w-[60px]">
                          <div className={`text-xl font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                            {item.quantity}
                          </div>
                          <div className="text-gray-500 text-xs">{item.unit}</div>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => openModal(item)}
                        className="glass-button rounded-lg px-3 py-1 text-gray-300 text-sm hover:bg-white/20"
                      >
                        編集
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && items.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {Object.entries(categories).map(([key, { label, icon, color }]) => (
                <div key={key}>
                  <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                    <span>{icon}</span> {label}
                  </div>
                  <div className={`text-${color}-400 text-2xl font-bold`}>
                    {items.filter(i => i.category === key).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-button rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingItem ? '在庫を編集' : '新規在庫登録'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">品名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="品名を入力"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">カテゴリ</label>
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
                <div>
                  <label className="block text-gray-400 text-sm mb-2">単位</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="個">個</option>
                    <option value="本">本</option>
                    <option value="枚">枚</option>
                    <option value="箱">箱</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="セット">セット</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">現在数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">最小在庫数</label>
                  <input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">保管場所</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="倉庫A"
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
                {editingItem && (
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
                  className="glass-button glass-purple rounded-xl px-4 py-2 text-white font-semibold"
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
