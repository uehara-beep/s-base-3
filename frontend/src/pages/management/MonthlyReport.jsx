import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function MonthlyReport() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth])

  const fetchReportData = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      const response = await api.get(`/dashboard/monthly-report?year=${year}&month=${month}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
      // Mock data
      setData({
        sales: [
          { project: 'A邸新築工事', client: '山田建設', amount: 5800000, cost: 3500000 },
          { project: 'B社オフィス改装', client: '田中商事', amount: 3200000, cost: 1900000 },
          { project: 'C公園整備', client: '市役所', amount: 4500000, cost: 2800000 },
        ],
        summary: {
          totalSales: 13500000,
          totalCost: 8200000,
          grossProfit: 5300000,
          profitRate: 39.3,
          prevMonthSales: 12000000,
          change: 12.5,
        },
        expenses: {
          travel: 45000,
          material: 3200000,
          labor: 4500000,
          other: 455000,
        },
        projects: {
          started: 2,
          completed: 3,
          inProgress: 5,
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const handleExport = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      const response = await api.get(`/dashboard/monthly-report/export?year=${year}&month=${month}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `月次レポート_${selectedMonth}.xlsx`
      link.click()
    } catch (error) {
      console.error('Export error:', error)
      alert('エクスポートに失敗しました')
    }
  }

  const handleMonthChange = (delta) => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const newDate = new Date(year, month - 1 + delta, 1)
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`)
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
              <h1 className="text-2xl font-bold text-white">月次レポート</h1>
              <p className="text-gray-400 text-sm">月間業績の詳細</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="glass-button glass-purple rounded-xl px-4 py-2 text-white font-semibold"
          >
            📤 Excel出力
          </button>
        </div>

        {/* Month Selector */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleMonthChange(-1)}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              ← 前月
            </button>
            <div className="flex items-center gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xl font-semibold"
              />
            </div>
            <button
              onClick={() => handleMonthChange(1)}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              翌月 →
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-button rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-2">売上高</div>
            <div className="text-white text-2xl font-bold">{formatCurrency(data?.summary?.totalSales)}</div>
            <div className={`text-sm mt-1 ${data?.summary?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data?.summary?.change >= 0 ? '↑' : '↓'} {Math.abs(data?.summary?.change)}%
            </div>
          </div>
          <div className="glass-button rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-2">原価</div>
            <div className="text-gray-300 text-2xl font-bold">{formatCurrency(data?.summary?.totalCost)}</div>
          </div>
          <div className="glass-button rounded-2xl p-4 text-center border border-green-500/30">
            <div className="text-gray-400 text-sm mb-2">粗利益</div>
            <div className="text-green-400 text-2xl font-bold">{formatCurrency(data?.summary?.grossProfit)}</div>
          </div>
          <div className="glass-button rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-2">粗利率</div>
            <div className="text-purple-400 text-2xl font-bold">{data?.summary?.profitRate}%</div>
          </div>
        </div>

        {/* Sales Details */}
        <div className="glass-button rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> 案件別売上
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 text-sm py-3 px-2">案件名</th>
                  <th className="text-left text-gray-400 text-sm py-3 px-2">得意先</th>
                  <th className="text-right text-gray-400 text-sm py-3 px-2">売上</th>
                  <th className="text-right text-gray-400 text-sm py-3 px-2">原価</th>
                  <th className="text-right text-gray-400 text-sm py-3 px-2">粗利</th>
                  <th className="text-right text-gray-400 text-sm py-3 px-2">粗利率</th>
                </tr>
              </thead>
              <tbody>
                {data?.sales?.map((sale, index) => {
                  const profit = sale.amount - sale.cost
                  const profitRate = sale.amount > 0 ? (profit / sale.amount * 100) : 0
                  return (
                    <tr key={index} className="border-b border-white/5">
                      <td className="text-white py-3 px-2">{sale.project}</td>
                      <td className="text-gray-400 py-3 px-2">{sale.client}</td>
                      <td className="text-white py-3 px-2 text-right">{formatCurrency(sale.amount)}</td>
                      <td className="text-gray-400 py-3 px-2 text-right">{formatCurrency(sale.cost)}</td>
                      <td className={`py-3 px-2 text-right ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className={`py-3 px-2 text-right ${profitRate >= 30 ? 'text-green-400' : profitRate >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {profitRate.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20">
                  <td colSpan={2} className="text-white font-semibold py-3 px-2">合計</td>
                  <td className="text-white font-semibold py-3 px-2 text-right">
                    {formatCurrency(data?.sales?.reduce((s, sale) => s + sale.amount, 0))}
                  </td>
                  <td className="text-gray-400 font-semibold py-3 px-2 text-right">
                    {formatCurrency(data?.sales?.reduce((s, sale) => s + sale.cost, 0))}
                  </td>
                  <td className="text-green-400 font-semibold py-3 px-2 text-right">
                    {formatCurrency(data?.sales?.reduce((s, sale) => s + (sale.amount - sale.cost), 0))}
                  </td>
                  <td className="text-purple-400 font-semibold py-3 px-2 text-right">
                    {data?.summary?.profitRate}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Expense Breakdown & Project Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expenses */}
          <div className="glass-button rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">💰</span> 経費内訳
            </h3>
            <div className="space-y-3">
              {Object.entries(data?.expenses || {}).map(([key, value]) => {
                const labels = {
                  travel: '交通費',
                  material: '材料費',
                  labor: '労務費',
                  other: 'その他',
                }
                const total = Object.values(data?.expenses || {}).reduce((s, v) => s + v, 0)
                const percentage = total > 0 ? (value / total * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{labels[key] || key}</span>
                      <span className="text-white">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
              <span className="text-gray-400">合計</span>
              <span className="text-white font-semibold">
                {formatCurrency(Object.values(data?.expenses || {}).reduce((s, v) => s + v, 0))}
              </span>
            </div>
          </div>

          {/* Project Status */}
          <div className="glass-button rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🏗️</span> 案件状況
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="bg-blue-500/10 rounded-xl p-4">
                <div className="text-blue-400 text-3xl font-bold">{data?.projects?.started}</div>
                <div className="text-gray-400 text-sm">新規着工</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4">
                <div className="text-yellow-400 text-3xl font-bold">{data?.projects?.inProgress}</div>
                <div className="text-gray-400 text-sm">施工中</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4">
                <div className="text-green-400 text-3xl font-bold">{data?.projects?.completed}</div>
                <div className="text-gray-400 text-sm">完工</div>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm">
              {selectedMonth.slice(0, 4)}年{parseInt(selectedMonth.slice(5))}月の案件推移
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
