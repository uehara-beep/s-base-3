import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/dashboard/summary?period=${period}`)
      setData(response)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data for demo
      setData({
        revenue: { current: 15800000, previous: 14200000, change: 11.3 },
        cost: { current: 9500000, previous: 8800000, change: 8.0 },
        profit: { current: 6300000, previous: 5400000, change: 16.7 },
        projects: { active: 8, completed: 12, total: 20 },
        quotes: { pending: 5, approved: 15, total: 20 },
        expenses: { total: 450000, pending: 3 },
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const formatLargeCurrency = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}千万`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万`
    }
    return formatCurrency(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '500px', height: '500px', background: 'rgba(168, 85, 247, 0.2)', top: '-15%', left: '-10%' }} />
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.2)', bottom: '-10%', right: '-10%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/management')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
              <p className="text-gray-400 text-sm">経営状況の概要</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm ${
                  period === p
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                    : 'glass-button text-gray-300 hover:bg-white/10'
                }`}
              >
                {p === 'week' ? '週間' : p === 'month' ? '月間' : '年間'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Revenue */}
          <div className="glass-button rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">売上高</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ¥{formatLargeCurrency(data?.revenue?.current)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              data?.revenue?.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{data?.revenue?.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(data?.revenue?.change)}%</span>
              <span className="text-gray-500">前期比</span>
            </div>
          </div>

          {/* Cost */}
          <div className="glass-button rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">原価</span>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ¥{formatLargeCurrency(data?.cost?.current)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              data?.cost?.change <= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{data?.cost?.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(data?.cost?.change)}%</span>
              <span className="text-gray-500">前期比</span>
            </div>
          </div>

          {/* Profit */}
          <div className="glass-button rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">粗利益</span>
              <span className="text-3xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              ¥{formatLargeCurrency(data?.profit?.current)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              data?.profit?.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{data?.profit?.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(data?.profit?.change)}%</span>
              <span className="text-gray-500">前期比</span>
            </div>
          </div>
        </div>

        {/* Projects & Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Projects */}
          <div className="glass-button rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🏗️</span> 現場状況
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-400 text-3xl font-bold">{data?.projects?.active}</div>
                <div className="text-gray-400 text-sm">施工中</div>
              </div>
              <div>
                <div className="text-green-400 text-3xl font-bold">{data?.projects?.completed}</div>
                <div className="text-gray-400 text-sm">完了</div>
              </div>
              <div>
                <div className="text-white text-3xl font-bold">{data?.projects?.total}</div>
                <div className="text-gray-400 text-sm">全案件</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>進捗</span>
                <span>{data?.projects?.active && data?.projects?.total ?
                  Math.round((data.projects.completed / data.projects.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${data?.projects?.total ? (data.projects.completed / data.projects.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quotes */}
          <div className="glass-button rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> 見積状況
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-yellow-400 text-3xl font-bold">{data?.quotes?.pending}</div>
                <div className="text-gray-400 text-sm">検討中</div>
              </div>
              <div>
                <div className="text-green-400 text-3xl font-bold">{data?.quotes?.approved}</div>
                <div className="text-gray-400 text-sm">受注</div>
              </div>
              <div>
                <div className="text-white text-3xl font-bold">{data?.quotes?.total}</div>
                <div className="text-gray-400 text-sm">全見積</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>受注率</span>
                <span>{data?.quotes?.approved && data?.quotes?.total ?
                  Math.round((data.quotes.approved / data.quotes.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
                  style={{ width: `${data?.quotes?.total ? (data.quotes.approved / data.quotes.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-button rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">クイックアクション</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/management/monthly-report')}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-2xl block mb-2">📈</span>
              <span className="text-white text-sm">月次レポート</span>
            </button>
            <button
              onClick={() => navigate('/sales/quotes')}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-2xl block mb-2">📋</span>
              <span className="text-white text-sm">見積一覧</span>
            </button>
            <button
              onClick={() => navigate('/construction/sites')}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-2xl block mb-2">🏗️</span>
              <span className="text-white text-sm">現場一覧</span>
            </button>
            <button
              onClick={() => navigate('/management/export')}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-2xl block mb-2">📤</span>
              <span className="text-white text-sm">データ出力</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {(data?.expenses?.pending > 0) && (
          <div className="glass-button rounded-2xl p-4 mt-6 border-l-4 border-yellow-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-semibold">承認待ち</h3>
                <p className="text-gray-400 text-sm">
                  経費精算 {data.expenses.pending}件 の承認待ちがあります
                </p>
              </div>
              <button
                onClick={() => navigate('/office/approval')}
                className="ml-auto glass-button rounded-lg px-3 py-1 text-white text-sm"
              >
                確認する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
