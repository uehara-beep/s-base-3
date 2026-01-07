import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function QuoteCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [activeTab, setActiveTab] = useState('cover') // cover, details, conditions, confirmation

  // 表紙データ
  const [coverData, setCoverData] = useState({
    client_id: '',
    project_name: '',
    site_name: '',
    site_address: '',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    notes: '',
  })

  // 内訳データ
  const [items, setItems] = useState([
    { id: 1, category: '', description: '', specification: '', quantity: 1, unit: '式', unit_price: 0, cost_price: 0 }
  ])

  // 条件書データ
  const [conditions, setConditions] = useState([
    { id: 1, category: '工事範囲', content: '' },
    { id: 2, category: '支払条件', content: '' },
    { id: 3, category: '工期', content: '' },
  ])

  // 確認書データ（負担区分）
  const [confirmationItems, setConfirmationItems] = useState([
    { id: 1, item: '仮設工事', client: false, company: true, paid_supply: false },
    { id: 2, item: '電気工事', client: false, company: true, paid_supply: false },
    { id: 3, item: '給排水工事', client: false, company: true, paid_supply: false },
    { id: 4, item: '産廃処理', client: false, company: true, paid_supply: false },
    { id: 5, item: '諸経費', client: false, company: true, paid_supply: false },
  ])
  const [specialNotes, setSpecialNotes] = useState('')

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
    }
  }

  // 内訳の操作
  const handleAddItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1
    setItems([...items, { id: newId, category: '', description: '', specification: '', quantity: 1, unit: '式', unit_price: 0, cost_price: 0 }])
  }

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // 条件書の操作
  const handleAddCondition = () => {
    const newId = Math.max(...conditions.map(c => c.id), 0) + 1
    setConditions([...conditions, { id: newId, category: '', content: '' }])
  }

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id))
    }
  }

  const handleConditionChange = (id, field, value) => {
    setConditions(conditions.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  // 確認書の操作
  const handleAddConfirmationItem = () => {
    const newId = Math.max(...confirmationItems.map(c => c.id), 0) + 1
    setConfirmationItems([...confirmationItems, { id: newId, item: '', client: false, company: false, paid_supply: false }])
  }

  const handleRemoveConfirmationItem = (id) => {
    if (confirmationItems.length > 1) {
      setConfirmationItems(confirmationItems.filter(c => c.id !== id))
    }
  }

  const handleConfirmationChange = (id, field, value) => {
    setConfirmationItems(confirmationItems.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  // 計算
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0)
    const costTotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.cost_price) || 0), 0)
    const taxAmount = Math.floor(subtotal * 0.1)
    const totalAmount = subtotal + taxAmount
    const profit = subtotal - costTotal
    const profitRate = subtotal > 0 ? (profit / subtotal * 100) : 0
    return { subtotal, taxAmount, totalAmount, costTotal, profit, profitRate }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  // Excel取込
  const handleExcelImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ファイル形式チェック
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Excel形式(.xlsx, .xls)のファイルを選択してください')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      const response = await api.post('/quotes/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const data = response.data
      console.log('Excel import response:', data)

      if (data && data.success) {
        // 表紙データ
        if (data.cover) {
          setCoverData(prev => ({
            ...prev,
            project_name: data.cover.project_name || prev.project_name,
            site_name: data.cover.site_name || prev.site_name,
            site_address: data.cover.site_address || prev.site_address,
            quote_date: data.cover.quote_date || prev.quote_date,
          }))
        }
        // 内訳データ
        if (data.items && data.items.length > 0) {
          setItems(data.items.map((item, idx) => ({
            id: idx + 1,
            category: item.category || '',
            description: item.description || item.name || '',
            specification: item.specification || item.spec || '',
            quantity: item.quantity || 1,
            unit: item.unit || '式',
            unit_price: item.unit_price || 0,
            cost_price: item.cost_price || 0,
          })))
        }
        // 条件書データ
        if (data.conditions && data.conditions.length > 0) {
          setConditions(data.conditions.map((c, idx) => ({
            id: idx + 1,
            category: c.category || '',
            content: c.content || '',
          })))
        }
        // 確認書データ
        if (data.confirmation && data.confirmation.items && data.confirmation.items.length > 0) {
          setConfirmationItems(data.confirmation.items.map((c, idx) => ({
            id: idx + 1,
            item: c.item || '',
            client: c.client || false,
            company: c.company || false,
            paid_supply: c.paid_supply || false,
          })))
        }
        if (data.confirmation && data.confirmation.special_notes) {
          setSpecialNotes(data.confirmation.special_notes)
        }

        alert(data.message || 'Excelファイルを読み込みました')
      } else {
        alert('Excelファイルの読み込みに失敗しました')
      }
    } catch (error) {
      console.error('Excel import error:', error)
      const errorMsg = error.response?.data?.detail || 'Excelファイルの読み込みに失敗しました'
      alert(errorMsg)
    } finally {
      setLoading(false)
      // ファイル入力をリセット
      e.target.value = ''
    }
  }

  // 保存
  const handleSubmit = async (status = 'draft') => {
    const { subtotal, taxAmount, totalAmount, costTotal, profit, profitRate } = calculateTotals()

    const quoteData = {
      ...coverData,
      client_id: coverData.client_id ? parseInt(coverData.client_id) : null,
      status,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      cost_amount: costTotal,
      profit_amount: profit,
      profit_rate: profitRate,
      items: items.map((item, idx) => ({
        item_order: idx + 1,
        category: item.category,
        description: item.description,
        specification: item.specification,
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit,
        unit_price: parseFloat(item.unit_price) || 0,
        cost_price: parseFloat(item.cost_price) || 0,
        amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0),
        cost_amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.cost_price) || 0),
      })),
      conditions: conditions.map(c => ({
        category: c.category,
        content: c.content,
      })),
      confirmation: {
        items: confirmationItems.map(c => ({
          item: c.item,
          client: c.client,
          company: c.company,
          paid_supply: c.paid_supply,
        })),
        special_notes: specialNotes,
      }
    }

    try {
      setLoading(true)
      await api.post('/quotes/', quoteData)
      navigate('/sales/quotes')
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('見積の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, totalAmount, costTotal, profit, profitRate } = calculateTotals()

  const tabs = [
    { id: 'cover', label: '表紙', icon: '📄' },
    { id: 'details', label: '内訳', icon: '📋' },
    { id: 'conditions', label: '条件書', icon: '📝' },
    { id: 'confirmation', label: '確認書', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(249, 115, 22, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/quotes')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">見積作成</h1>
              <p className="text-gray-400 text-sm">新規見積書の作成</p>
            </div>
          </div>

          {/* Excel取込ボタン（メイン機能） */}
          <label className="glass-button glass-blue rounded-xl px-6 py-3 text-white font-semibold cursor-pointer hover:bg-blue-500/40 flex items-center gap-2">
            <span className="text-xl">📥</span>
            <span>Excel取込</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />
          </label>
        </div>

        {/* 金額サマリー */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-xs mb-1">税抜金額</div>
              <div className="text-white text-lg font-bold">{formatCurrency(subtotal)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">消費税</div>
              <div className="text-gray-300 text-lg">{formatCurrency(taxAmount)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">税込金額</div>
              <div className="text-orange-400 text-xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">粗利</div>
              <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(profit)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">粗利率</div>
              <div className={`text-lg font-bold ${profitRate >= 20 ? 'text-green-400' : profitRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {profitRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500/30 text-orange-300 border-2 border-orange-400'
                  : 'glass-button text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="glass-button rounded-2xl p-6 mb-6">
          {/* 表紙タブ */}
          {activeTab === 'cover' && (
            <div className="space-y-6">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <span>📄</span> 表紙（基本情報）
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">得意先 *</label>
                  <select
                    value={coverData.client_id}
                    onChange={(e) => setCoverData({ ...coverData, client_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">選択してください</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">見積日</label>
                  <input
                    type="date"
                    value={coverData.quote_date}
                    onChange={(e) => setCoverData({ ...coverData, quote_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">工事名 *</label>
                <input
                  type="text"
                  value={coverData.project_name}
                  onChange={(e) => setCoverData({ ...coverData, project_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="〇〇邸新築工事"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">現場名</label>
                  <input
                    type="text"
                    value={coverData.site_name}
                    onChange={(e) => setCoverData({ ...coverData, site_name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="〇〇邸"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">有効期限</label>
                  <input
                    type="date"
                    value={coverData.valid_until}
                    onChange={(e) => setCoverData({ ...coverData, valid_until: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">現場住所</label>
                <input
                  type="text"
                  value={coverData.site_address}
                  onChange={(e) => setCoverData({ ...coverData, site_address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="東京都..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">備考</label>
                <textarea
                  value={coverData.notes}
                  onChange={(e) => setCoverData({ ...coverData, notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  placeholder="備考"
                />
              </div>
            </div>
          )}

          {/* 内訳タブ */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span>📋</span> 内訳明細
                </h2>
                <button
                  onClick={handleAddItem}
                  className="glass-button glass-blue rounded-xl px-4 py-2 text-white text-sm flex items-center gap-2"
                >
                  <span>➕</span> 行追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 text-sm py-2 px-2 w-24">分類</th>
                      <th className="text-left text-gray-400 text-sm py-2 px-2">項目名</th>
                      <th className="text-left text-gray-400 text-sm py-2 px-2 w-32">仕様</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-20">数量</th>
                      <th className="text-center text-gray-400 text-sm py-2 px-2 w-16">単位</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-28">単価</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-28">原価</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-32">金額</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                            placeholder="分類"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="項目名"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.specification}
                            onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm"
                            placeholder="仕様"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm text-right"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-1 py-2 text-white text-sm"
                          >
                            <option value="式">式</option>
                            <option value="個">個</option>
                            <option value="本">本</option>
                            <option value="m">m</option>
                            <option value="m2">m2</option>
                            <option value="m3">m3</option>
                            <option value="kg">kg</option>
                            <option value="t">t</option>
                            <option value="台">台</option>
                            <option value="人工">人工</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm text-right"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.cost_price}
                            onChange={(e) => handleItemChange(item.id, 'cost_price', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-gray-300 text-sm text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-right text-white font-medium">
                          {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                        </td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 text-lg p-1"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 条件書タブ */}
          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span>📝</span> 条件書
                </h2>
                <button
                  onClick={handleAddCondition}
                  className="glass-button glass-blue rounded-xl px-4 py-2 text-white text-sm flex items-center gap-2"
                >
                  <span>➕</span> 条件追加
                </button>
              </div>

              <div className="space-y-4">
                {conditions.map((condition) => (
                  <div key={condition.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-40">
                        <label className="block text-gray-400 text-xs mb-1">項目</label>
                        <input
                          type="text"
                          value={condition.category}
                          onChange={(e) => handleConditionChange(condition.id, 'category', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="工事範囲"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-400 text-xs mb-1">内容</label>
                        <textarea
                          value={condition.content}
                          onChange={(e) => handleConditionChange(condition.id, 'content', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          rows={2}
                          placeholder="条件内容を入力"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveCondition(condition.id)}
                        className="text-red-400 hover:text-red-300 text-lg mt-6"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 確認書タブ */}
          {activeTab === 'confirmation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span>✅</span> 工事見積確認書（負担区分）
                </h2>
                <button
                  onClick={handleAddConfirmationItem}
                  className="glass-button glass-blue rounded-xl px-4 py-2 text-white text-sm flex items-center gap-2"
                >
                  <span>➕</span> 項目追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 text-sm py-3 px-4">項目</th>
                      <th className="text-center text-gray-400 text-sm py-3 px-4 w-28">貴社負担</th>
                      <th className="text-center text-gray-400 text-sm py-3 px-4 w-28">当社負担</th>
                      <th className="text-center text-gray-400 text-sm py-3 px-4 w-28">有償支給</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmationItems.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => handleConfirmationChange(item.id, 'item', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            placeholder="項目名"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.client}
                            onChange={(e) => handleConfirmationChange(item.id, 'client', e.target.checked)}
                            className="w-5 h-5 rounded accent-orange-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.company}
                            onChange={(e) => handleConfirmationChange(item.id, 'company', e.target.checked)}
                            className="w-5 h-5 rounded accent-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.paid_supply}
                            onChange={(e) => handleConfirmationChange(item.id, 'paid_supply', e.target.checked)}
                            className="w-5 h-5 rounded accent-green-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRemoveConfirmationItem(item.id)}
                            className="text-red-400 hover:text-red-300 text-lg"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">特記事項</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={4}
                  placeholder="特記事項があれば入力"
                />
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            ※ Excel取込で一括入力できます
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/sales/quotes')}
              className="glass-button rounded-xl px-6 py-3 text-gray-300 hover:bg-white/20"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              className="glass-button rounded-xl px-6 py-3 text-white hover:bg-white/20"
              disabled={loading}
            >
              下書き保存
            </button>
            <button
              onClick={() => handleSubmit('submitted')}
              className="glass-button glass-orange rounded-xl px-6 py-3 text-white font-semibold"
              disabled={loading}
            >
              {loading ? '保存中...' : '見積を作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
