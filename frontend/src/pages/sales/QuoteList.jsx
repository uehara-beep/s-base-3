import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function QuoteList() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes/')
      // APIはデータを直接返す（response.dataではなくresponse自体が配列）
      setQuotes(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-500/30 text-gray-300',
      submitted: 'bg-blue-500/30 text-blue-300',
      approved: 'bg-green-500/30 text-green-300',
      rejected: 'bg-red-500/30 text-red-300',
      ordered: 'bg-purple-500/30 text-purple-300',
    }
    const statusLabels = {
      draft: '下書き',
      submitted: '提出済',
      approved: '承認済',
      rejected: '却下',
      ordered: '受注',
    }
    return (
      <span className={`px-2 py-1 rounded-lg text-xs ${statusStyles[status] || statusStyles.draft}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const calculateProfit = (quote) => {
    const profit = (quote.total_amount || 0) - (quote.cost_amount || 0)
    const profitRate = quote.total_amount ? (profit / quote.total_amount * 100) : 0
    return { profit, profitRate }
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
              <h1 className="text-2xl font-bold text-white">見積一覧</h1>
              <p className="text-gray-400 text-sm">予算 vs 原価表示</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/sales/quote-create')}
            className="glass-button glass-orange rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 新規見積
          </button>
        </div>

        {/* Filters */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="検索（見積番号、案件名、得意先名）"
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
              <option value="draft">下書き</option>
              <option value="submitted">提出済</option>
              <option value="approved">承認済</option>
              <option value="rejected">却下</option>
              <option value="ordered">受注</option>
            </select>
          </div>
        </div>

        {/* Quote List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-400">見積データがありません</p>
            <button
              onClick={() => navigate('/sales/quote-create')}
              className="mt-4 glass-button glass-orange rounded-xl px-6 py-2 text-white"
            >
              最初の見積を作成
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const { profit, profitRate } = calculateProfit(quote)
              return (
                <div
                  key={quote.id}
                  onClick={() => navigate(`/sales/quotes/${quote.id}`)}
                  className="glass-button rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-400 font-mono text-sm">{quote.quote_number}</span>
                        {getStatusBadge(quote.status)}
                      </div>
                      <h3 className="text-white font-semibold mb-1">{quote.project_name || '(案件名未設定)'}</h3>
                      <p className="text-gray-400 text-sm">{quote.client_name || '(得意先未設定)'}</p>
                    </div>

                    <div className="flex gap-6 text-right">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">見積金額</div>
                        <div className="text-white font-semibold">{formatCurrency(quote.total_amount)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">原価</div>
                        <div className="text-gray-300">{formatCurrency(quote.cost_amount)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">粗利</div>
                        <div className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)}
                          <span className="text-xs ml-1">({profitRate.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-gray-500">
                    <span>作成日: {quote.created_at ? new Date(quote.created_at).toLocaleDateString('ja-JP') : '-'}</span>
                    <span>有効期限: {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('ja-JP') : '-'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && filteredQuotes.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-xs mb-1">見積件数</div>
                <div className="text-white text-xl font-bold">{filteredQuotes.length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">見積総額</div>
                <div className="text-white text-xl font-bold">
                  {formatCurrency(filteredQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">原価総額</div>
                <div className="text-gray-300 text-xl font-bold">
                  {formatCurrency(filteredQuotes.reduce((sum, q) => sum + (q.cost_amount || 0), 0))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">粗利総額</div>
                <div className="text-green-400 text-xl font-bold">
                  {formatCurrency(
                    filteredQuotes.reduce((sum, q) => sum + ((q.total_amount || 0) - (q.cost_amount || 0)), 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
