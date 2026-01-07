import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ExpenseRequest() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: 'travel',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
    receipt: null,
  })
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)

  const categories = [
    { value: 'travel', label: '交通費', icon: '🚃' },
    { value: 'meal', label: '食費', icon: '🍱' },
    { value: 'supply', label: '消耗品', icon: '📦' },
    { value: 'equipment', label: '備品', icon: '💻' },
    { value: 'meeting', label: '会議費', icon: '☕' },
    { value: 'other', label: 'その他', icon: '📋' },
  ]

  const paymentMethods = [
    { value: 'cash', label: '現金' },
    { value: 'card', label: 'クレジットカード' },
    { value: 'ic', label: 'ICカード' },
    { value: 'transfer', label: '振込' },
  ]

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFormData({ ...formData, receipt: file })

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // OCR Processing
    try {
      setOcrProcessing(true)
      const ocrFormData = new FormData()
      ocrFormData.append('file', file)

      const response = await api.post('/expenses/ocr', ocrFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response) {
        setFormData(prev => ({
          ...prev,
          amount: response.amount || prev.amount,
          expense_date: response.date || prev.expense_date,
          description: response.store_name || prev.description,
        }))
      }
    } catch (error) {
      console.error('OCR processing error:', error)
    } finally {
      setOcrProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) {
      alert('金額と説明は必須です')
      return
    }

    try {
      setLoading(true)
      // バックエンドはJSONを期待
      const submitData = {
        expense_date: formData.expense_date,
        category: formData.category || '交通費',
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      }

      console.log('Submitting expense:', submitData)
      await api.post('/expenses/', submitData)
      alert('経費を申請しました')
      navigate('/office/expenses')
    } catch (error) {
      console.error('Error submitting expense:', error)
      alert(`申請に失敗しました: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(34, 197, 94, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/office/expenses')}
            className="glass-button rounded-xl p-2 hover:bg-white/20"
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">経費申請</h1>
            <p className="text-gray-400 text-sm">新規経費精算の申請</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Receipt Upload */}
          <div className="glass-button rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📷</span> 領収書スキャン（OCR自動入力）
            </h2>
            <label className="block glass-button rounded-xl p-8 text-center cursor-pointer hover:bg-white/10 border-2 border-dashed border-white/20">
              {receiptPreview ? (
                <div className="relative">
                  <img src={receiptPreview} alt="領収書" className="max-h-48 mx-auto rounded-lg" />
                  {ocrProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white">🔍 読み取り中...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400">
                  <span className="text-4xl block mb-2">📸</span>
                  <p>クリックまたはドラッグで領収書をアップロード</p>
                  <p className="text-sm mt-2 text-gray-500">AIが金額・日付・店名を自動認識します</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Form */}
          <div className="glass-button rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">経費情報</h2>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">カテゴリ</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        formData.category === cat.value
                          ? 'bg-green-500/30 border-2 border-green-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl block">{cat.icon}</span>
                      <span className="text-white text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">金額 *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-8 text-white text-right text-xl"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">内容・店名 *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="例：〇〇駅→△△駅"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">利用日</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">支払方法</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">備考</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="補足事項があれば入力"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => navigate('/office/expenses')}
                className="glass-button rounded-xl px-6 py-3 text-gray-300"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="glass-button glass-green rounded-xl px-6 py-3 text-white font-semibold"
                disabled={loading}
              >
                {loading ? '申請中...' : '経費を申請'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
