import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Expenses() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchExpenses()
  }, [dateRange])

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      setExpenses(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    travel: { label: '交通費', icon: '🚃' },
    meal: { label: '食費', icon: '🍱' },
    supply: { label: '消耗品', icon: '📦' },
    equipment: { label: '備品', icon: '💻' },
    meeting: { label: '会議費', icon: '☕' },
    other: { label: 'その他', icon: '📋' },
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/30 text-yellow-300',
      approved: 'bg-green-500/30 text-green-300',
      rejected: 'bg-red-500/30 text-red-300',
      paid: 'bg-blue-500/30 text-blue-300',
    }
    const labels = {
      pending: '申請中',
      approved: '承認済',
      rejected: '却下',
      paid: '精算済',
    }
    return (
      <span className={`px-2 py-1 rounded-lg text-xs ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(34, 197, 94, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/office')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">経費一覧</h1>
              <p className="text-gray-400 text-sm">経費精算の管理</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/office/expense-request')}
            className="glass-button glass-green rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 経費申請
          </button>
        </div>

        {/* Filters */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              />
              <span className="text-gray-400">〜</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="検索（説明、申請者）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[150px] bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
            >
              <option value="all">全ステータス</option>
              <option value="pending">申請中</option>
              <option value="approved">承認済</option>
              <option value="rejected">却下</option>
              <option value="paid">精算済</option>
            </select>
          </div>
        </div>

        {/* Summary Card */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">件数</div>
              <div className="text-white text-2xl font-bold">{filteredExpenses.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">合計金額</div>
              <div className="text-green-400 text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">申請中</div>
              <div className="text-yellow-400 text-2xl font-bold">
                {filteredExpenses.filter(e => e.status === 'pending').length}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">精算済</div>
              <div className="text-blue-400 text-2xl font-bold">
                {formatCurrency(filteredExpenses.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount || 0), 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-gray-400">経費データがありません</p>
            <button
              onClick={() => navigate('/office/expense-request')}
              className="mt-4 glass-button glass-green rounded-xl px-6 py-2 text-white"
            >
              経費を申請
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const cat = categories[expense.category] || categories.other
              return (
                <div key={expense.id} className="glass-button rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
                        {cat.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{expense.description || cat.label}</h3>
                          {getStatusBadge(expense.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span>{cat.label}</span>
                          <span>📅 {expense.expense_date}</span>
                          <span>👤 {expense.employee_name || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xl font-bold">{formatCurrency(expense.amount)}</div>
                      {expense.receipt_url && (
                        <span className="text-green-400 text-xs">領収書あり</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
