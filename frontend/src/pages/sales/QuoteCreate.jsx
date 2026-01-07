import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import api from '../../services/api'

// 予算種別（1.0と同じ）
const BUDGET_TYPES = [
  { value: '労務費', label: '労務', color: '#3b82f6' },
  { value: '外注費', label: '外注', color: '#8b5cf6' },
  { value: '材料費', label: '材料', color: '#10b981' },
  { value: '機械', label: '機械', color: '#f59e0b' },
  { value: '経費', label: '経費', color: '#6b7280' },
  { value: 'その他', label: '他', color: '#94a3b8' },
]

// 集計から除外する項目名（小計行など）
const EXCLUDE_FROM_TOTAL = ['直接工事費', '小計', '合計', '計']

// 空の予算明細を作成
const createEmptyBudget = () => ({
  type: '労務費',
  spec: '',
  quantity: '',
  unit: '',
  unitPrice: '',
  estimatePrice: '',
  amount: '',
  estimateAmount: '',
  remarks: '',
})

export default function QuoteCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [activeTab, setActiveTab] = useState('cover')
  const [expandedRows, setExpandedRows] = useState({})
  const [showPdfOptions, setShowPdfOptions] = useState(false)

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

  // 内訳データ（予算明細付き）
  const [items, setItems] = useState([
    {
      id: 1,
      category: '',
      description: '',
      specification: '',
      quantity: 1,
      unit: '式',
      unit_price: 0,
      cost_price: 0,
      budgets: [createEmptyBudget()],
    }
  ])

  // 条件書データ
  const [conditions, setConditions] = useState([
    { id: 1, category: '工事範囲', content: '' },
    { id: 2, category: '支払条件', content: '' },
    { id: 3, category: '工期', content: '' },
  ])

  // 確認書データ
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

  // 集計対象かどうか判定
  const isExcludedFromTotal = (description) => {
    return EXCLUDE_FROM_TOTAL.some(keyword => description.includes(keyword))
  }

  // 行の展開/折りたたみ
  const toggleExpand = (rowIndex) => {
    setExpandedRows(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }))
  }

  // 内訳の操作
  const handleAddItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1
    setItems([...items, {
      id: newId,
      category: '',
      description: '',
      specification: '',
      quantity: 1,
      unit: '式',
      unit_price: 0,
      cost_price: 0,
      budgets: [createEmptyBudget()],
    }])
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

  // 予算明細の操作
  const handleAddBudget = (itemId) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, budgets: [...item.budgets, createEmptyBudget()] }
        : item
    ))
  }

  const handleRemoveBudget = (itemId, budgetIndex) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.budgets.length > 1) {
        const newBudgets = [...item.budgets]
        newBudgets.splice(budgetIndex, 1)
        return { ...item, budgets: newBudgets }
      }
      return item
    }))
  }

  const handleBudgetChange = (itemId, budgetIndex, field, value) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newBudgets = [...item.budgets]
        newBudgets[budgetIndex] = { ...newBudgets[budgetIndex], [field]: value }

        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newBudgets[budgetIndex].quantity) || 0
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(newBudgets[budgetIndex].unitPrice) || 0
          newBudgets[budgetIndex].amount = qty * price
        }
        if (field === 'quantity' || field === 'estimatePrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newBudgets[budgetIndex].quantity) || 0
          const price = field === 'estimatePrice' ? parseFloat(value) || 0 : parseFloat(newBudgets[budgetIndex].estimatePrice) || 0
          newBudgets[budgetIndex].estimateAmount = qty * price
        }

        return { ...item, budgets: newBudgets }
      }
      return item
    }))
  }

  // 予算合計の計算
  const getBudgetTotal = (budgets) => {
    return budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)
  }

  const getEstimateTotal = (budgets) => {
    return budgets.reduce((sum, b) => sum + (parseFloat(b.estimateAmount) || 0), 0)
  }

  const getProfit = (budgets) => {
    return getEstimateTotal(budgets) - getBudgetTotal(budgets)
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

  // 計算（直接工事費などは除外）
  const calculateTotals = () => {
    const filteredItems = items.filter(item => !isExcludedFromTotal(item.description))
    const subtotal = filteredItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0)
    const costTotal = filteredItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.cost_price) || 0), 0)
    const taxAmount = Math.floor(subtotal * 0.1)
    const totalAmount = subtotal + taxAmount
    const profit = subtotal - costTotal
    const profitRate = subtotal > 0 ? (profit / subtotal * 100) : 0
    return { subtotal, taxAmount, totalAmount, costTotal, profit, profitRate }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ja-JP').format(num || 0)
  }

  // PDF出力
  const handlePdfExport = (type) => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const { subtotal, taxAmount, totalAmount } = calculateTotals()

    // 日本語フォント対応のため、基本的なスタイルを設定
    doc.setFont('helvetica')

    const addHeader = () => {
      doc.setFontSize(18)
      doc.text('ESTIMATE / MITSUMORI', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`Project: ${coverData.project_name || 'N/A'}`, 20, 35)
      doc.text(`Site: ${coverData.site_name || 'N/A'}`, 20, 42)
      doc.text(`Date: ${coverData.quote_date || 'N/A'}`, 150, 35)
    }

    if (type === 'full' || type === 'breakdown') {
      addHeader()

      // 内訳テーブル
      const tableData = items.map(item => [
        item.category || '',
        item.description || '',
        item.specification || '',
        item.quantity || '',
        item.unit || '',
        formatNumber(item.unit_price || 0),
        formatNumber((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))
      ])

      doc.autoTable({
        startY: 50,
        head: [['Category', 'Item', 'Spec', 'Qty', 'Unit', 'Price', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 15, halign: 'right' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 30, halign: 'right' },
        },
      })

      // 合計
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(10)
      doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 150, finalY, { align: 'right' })
      doc.text(`Tax (10%): ${formatCurrency(taxAmount)}`, 150, finalY + 7, { align: 'right' })
      doc.setFontSize(12)
      doc.text(`Total: ${formatCurrency(totalAmount)}`, 150, finalY + 16, { align: 'right' })
    }

    if (type === 'full' || type === 'budget') {
      if (type === 'full') {
        doc.addPage()
      }
      if (type === 'budget') {
        addHeader()
      }

      doc.setFontSize(14)
      doc.text('Budget Details / Yosan Meisai', 20, type === 'budget' ? 50 : 20)

      let yPos = type === 'budget' ? 60 : 30

      items.forEach((item, idx) => {
        if (item.budgets && item.budgets.length > 0) {
          // 項目名
          doc.setFontSize(10)
          doc.text(`${idx + 1}. ${item.description || 'Item ' + (idx + 1)}`, 20, yPos)
          yPos += 5

          const budgetData = item.budgets.map(b => [
            b.type || '',
            b.spec || '',
            b.quantity || '',
            b.unit || '',
            formatNumber(b.unitPrice || 0),
            formatNumber(b.estimatePrice || 0),
            formatNumber(b.amount || 0),
            formatNumber(b.estimateAmount || 0)
          ])

          doc.autoTable({
            startY: yPos,
            head: [['Type', 'Spec', 'Qty', 'Unit', 'Budget Price', 'Est Price', 'Budget Amt', 'Est Amt']],
            body: budgetData,
            theme: 'grid',
            headStyles: { fillColor: [100, 116, 139], fontSize: 7 },
            bodyStyles: { fontSize: 7 },
            margin: { left: 25 },
            tableWidth: 160,
          })

          yPos = doc.lastAutoTable.finalY + 10

          // ページオーバーチェック
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        }
      })
    }

    // ファイル名
    const fileName = `estimate_${coverData.project_name || 'quote'}_${type}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    setShowPdfOptions(false)
  }

  // Excel取込
  const handleExcelImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Excel形式(.xlsx, .xls)のファイルを選択してください')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      const data = await api.post('/quotes/import-excel', formData)
      console.log('Excel import response:', data)

      if (data && data.success) {
        if (data.cover) {
          setCoverData(prev => ({
            ...prev,
            project_name: data.cover.project_name || prev.project_name,
            site_name: data.cover.site_name || prev.site_name,
            site_address: data.cover.site_address || prev.site_address,
            quote_date: data.cover.quote_date || prev.quote_date,
          }))
        }
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
            budgets: [createEmptyBudget()],
          })))
        }
        if (data.conditions && data.conditions.length > 0) {
          setConditions(data.conditions.map((c, idx) => ({
            id: idx + 1,
            category: c.category || '',
            content: c.content || '',
          })))
        }
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
      e.target.value = ''
    }
  }

  // 保存
  const handleSubmit = async (status = 'draft') => {
    const { subtotal, taxAmount, totalAmount, costTotal, profit, profitRate } = calculateTotals()

    // 空文字をnullに変換（日付フィールド用）
    const cleanDate = (val) => val && val.trim() !== '' ? val : null

    const quoteData = {
      client_id: coverData.client_id ? parseInt(coverData.client_id) : null,
      project_name: coverData.project_name || '無題の見積',
      site_name: coverData.site_name || null,
      site_address: coverData.site_address || null,
      quote_date: cleanDate(coverData.quote_date),
      valid_until: cleanDate(coverData.valid_until),
      notes: coverData.notes || null,
      tax_rate: 10,
      items: items.map((item, idx) => ({
        item_order: idx + 1,
        category: item.category || null,
        description: item.description || '項目',
        specification: item.specification || null,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || '式',
        unit_price: parseFloat(item.unit_price) || 0,
        cost_price: parseFloat(item.cost_price) || 0,
      })),
    }

    try {
      setLoading(true)
      console.log('Saving quote data:', JSON.stringify(quoteData, null, 2))
      const result = await api.post('/quotes/', quoteData)
      console.log('Save result:', result)
      alert('見積を保存しました')
      navigate('/sales/quotes')
    } catch (error) {
      console.error('Error creating quote:', error)
      alert(`見積の保存に失敗しました: ${error.message || error}`)
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

  const getBudgetTypeColor = (type) => {
    const found = BUDGET_TYPES.find(t => t.value === type)
    return found ? found.color : '#6b7280'
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

          <div className="flex items-center gap-3">
            {/* PDF出力ボタン */}
            <div className="relative">
              <button
                onClick={() => setShowPdfOptions(!showPdfOptions)}
                className="glass-button glass-purple rounded-xl px-5 py-3 text-white font-semibold flex items-center gap-2"
              >
                <span className="text-lg">📄</span>
                <span>PDF出力</span>
              </button>

              {/* PDF出力オプション */}
              {showPdfOptions && (
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[180px]">
                  <button
                    onClick={() => handlePdfExport('full')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <span>📑</span> 全体（見積書全体）
                  </button>
                  <button
                    onClick={() => handlePdfExport('budget')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <span>💰</span> 予算のみ
                  </button>
                  <button
                    onClick={() => handlePdfExport('breakdown')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <span>📋</span> 内訳のみ
                  </button>
                </div>
              )}
            </div>

            {/* Excel取込ボタン */}
            <label className="glass-button glass-blue rounded-xl px-5 py-3 text-white font-semibold cursor-pointer hover:bg-blue-500/40 flex items-center gap-2">
              <span className="text-lg">📥</span>
              <span>Excel取込</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                className="hidden"
              />
            </label>
          </div>
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

          {/* 内訳タブ（展開可能な予算明細付き） */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span>📋</span> 内訳明細
                  <span className="text-gray-400 text-sm font-normal ml-2">※ 行をクリックで予算明細を展開</span>
                </h2>
                <button
                  onClick={handleAddItem}
                  className="glass-button glass-blue rounded-xl px-4 py-2 text-white text-sm flex items-center gap-2"
                >
                  <span>➕</span> 行追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="w-8"></th>
                      <th className="text-left text-gray-400 text-sm py-2 px-2 w-20">分類</th>
                      <th className="text-left text-gray-400 text-sm py-2 px-2 w-36">項目名</th>
                      <th className="text-left text-gray-400 text-sm py-2 px-2 w-28">仕様</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-16">数量</th>
                      <th className="text-center text-gray-400 text-sm py-2 px-2 w-14">単位</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-24">単価</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-24">原価</th>
                      <th className="text-right text-gray-400 text-sm py-2 px-2 w-28">金額</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <>
                        {/* 親行（クリックで展開） */}
                        <tr
                          key={item.id}
                          className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${expandedRows[index] ? 'bg-white/10' : ''} ${isExcludedFromTotal(item.description) ? 'opacity-60' : ''}`}
                          onClick={() => toggleExpand(index)}
                        >
                          <td className="py-2 px-2 text-center">
                            <span className="text-gray-400 text-lg">
                              {expandedRows[index] ? '▼' : '▶'}
                            </span>
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"
                              placeholder="分類"
                            />
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"
                              placeholder="項目名"
                            />
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={item.specification}
                              onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"
                              placeholder="仕様"
                            />
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-1 py-1.5 text-white text-sm"
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
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="number"
                              value={item.cost_price}
                              onChange={(e) => handleItemChange(item.id, 'cost_price', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-gray-300 text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right text-white font-medium text-sm">
                            {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                          </td>
                          <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-400 hover:text-red-300 text-lg p-1"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>

                        {/* 展開された予算明細行 */}
                        {expandedRows[index] && (
                          <tr key={`budget-${item.id}`}>
                            <td colSpan={10} className="bg-white/5 px-4 py-4">
                              <div className="ml-6">
                                {/* 予算サマリー */}
                                <div className="flex items-center gap-6 mb-4 pb-3 border-b border-white/10">
                                  <div>
                                    <span className="text-gray-400 text-xs">予算合計</span>
                                    <span className="text-blue-400 font-bold ml-2">{formatCurrency(getBudgetTotal(item.budgets))}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-xs">見積金額</span>
                                    <span className="text-orange-400 font-bold ml-2">{formatCurrency(getEstimateTotal(item.budgets))}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-xs">粗利</span>
                                    <span className={`font-bold ml-2 ${getProfit(item.budgets) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {formatCurrency(getProfit(item.budgets))}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleAddBudget(item.id)}
                                    className="ml-auto glass-button rounded-lg px-3 py-1 text-white text-xs flex items-center gap-1"
                                  >
                                    ➕ 明細追加
                                  </button>
                                </div>

                                {/* 予算明細テーブル */}
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-white/10">
                                      <th className="text-left text-gray-400 text-xs py-2 px-2 w-20">種別</th>
                                      <th className="text-left text-gray-400 text-xs py-2 px-2">仕様・内容</th>
                                      <th className="text-right text-gray-400 text-xs py-2 px-2 w-14">数量</th>
                                      <th className="text-center text-gray-400 text-xs py-2 px-2 w-12">単位</th>
                                      <th className="text-right text-gray-400 text-xs py-2 px-2 w-20">予算単価</th>
                                      <th className="text-right text-gray-400 text-xs py-2 px-2 w-20">見積単価</th>
                                      <th className="text-right text-gray-400 text-xs py-2 px-2 w-20">予算金額</th>
                                      <th className="text-right text-gray-400 text-xs py-2 px-2 w-20">見積金額</th>
                                      <th className="w-8"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.budgets.map((budget, bIndex) => (
                                      <tr key={bIndex} className="border-b border-white/5">
                                        <td className="py-1 px-2">
                                          <select
                                            value={budget.type}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'type', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-1 py-1 text-xs"
                                            style={{ color: getBudgetTypeColor(budget.type) }}
                                          >
                                            {BUDGET_TYPES.map(t => (
                                              <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="py-1 px-2">
                                          <input
                                            type="text"
                                            value={budget.spec}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'spec', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                                            placeholder="仕様・内容"
                                          />
                                        </td>
                                        <td className="py-1 px-2">
                                          <input
                                            type="number"
                                            value={budget.quantity}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'quantity', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-1 py-1 text-white text-xs text-right"
                                          />
                                        </td>
                                        <td className="py-1 px-2">
                                          <input
                                            type="text"
                                            value={budget.unit}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'unit', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-1 py-1 text-white text-xs text-center"
                                            placeholder="式"
                                          />
                                        </td>
                                        <td className="py-1 px-2">
                                          <input
                                            type="number"
                                            value={budget.unitPrice}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'unitPrice', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-1 py-1 text-blue-300 text-xs text-right"
                                          />
                                        </td>
                                        <td className="py-1 px-2">
                                          <input
                                            type="number"
                                            value={budget.estimatePrice}
                                            onChange={(e) => handleBudgetChange(item.id, bIndex, 'estimatePrice', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-1 py-1 text-orange-300 text-xs text-right"
                                          />
                                        </td>
                                        <td className="py-1 px-2 text-right text-blue-400 text-xs font-medium">
                                          {formatNumber(budget.amount || 0)}
                                        </td>
                                        <td className="py-1 px-2 text-right text-orange-400 text-xs font-medium">
                                          {formatNumber(budget.estimateAmount || 0)}
                                        </td>
                                        <td className="py-1 px-2">
                                          <button
                                            onClick={() => handleRemoveBudget(item.id, bIndex)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                          >
                                            ✕
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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

      {/* PDF出力オプションの背景クリックで閉じる */}
      {showPdfOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPdfOptions(false)}
        />
      )}
    </div>
  )
}
