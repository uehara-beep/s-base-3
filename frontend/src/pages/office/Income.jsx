import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Income() {
  const navigate = useNavigate()
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    amount: '',
    income_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer',
    invoice_number: '',
    notes: '',
  })
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [incomesRes, clientsRes, projectsRes] = await Promise.all([
        api.get('/incomes/'),
        api.get('/clients/'),
        api.get('/projects/')
      ])
      setIncomes(Array.isArray(incomesRes.data) ? incomesRes.data : [])
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : [])
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setIncomes([])
      setClients([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount || 0)
  }

  const handleSave = async () => {
    try {
      await api.post('/incomes/', {
        ...formData,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        amount: parseFloat(formData.amount) || 0,
      })
      setShowModal(false)
      setFormData({
        client_id: '',
        project_id: '',
        amount: '',
        income_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer',
        invoice_number: '',
        notes: '',
      })
      fetchData()
    } catch (error) {
      console.error('Error saving income:', error)
      alert('保存に失敗しました')
    }
  }

  const totalAmount = incomes.reduce((sum, i) => sum + (i.amount || 0), 0)

  // Group by month
  const groupedIncomes = incomes.reduce((groups, income) => {
    const month = income.income_date?.slice(0, 7) || 'unknown'
    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(income)
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(234, 179, 8, 0.2)', top: '-10%', left: '-10%' }} />
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
              <h1 className="text-2xl font-bold text-white">入金管理</h1>
              <p className="text-gray-400 text-sm">売上入金の記録</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-button rounded-xl px-4 py-2 text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
          >
            + 入金登録
          </button>
        </div>

        {/* Summary */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">入金件数</div>
              <div className="text-white text-2xl font-bold">{incomes.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">入金総額</div>
              <div className="text-yellow-400 text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">今月</div>
              <div className="text-green-400 text-2xl font-bold">
                {formatCurrency(
                  incomes
                    .filter(i => i.income_date?.startsWith(new Date().toISOString().slice(0, 7)))
                    .reduce((s, i) => s + (i.amount || 0), 0)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Income List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : incomes.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">💵</div>
            <p className="text-gray-400">入金データがありません</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 glass-button rounded-xl px-6 py-2 text-white"
              style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
            >
              最初の入金を登録
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedIncomes)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([month, monthIncomes]) => (
                <div key={month}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">
                      {month === 'unknown' ? '日付不明' : `${month.slice(0, 4)}年${month.slice(5)}月`}
                    </h3>
                    <span className="text-yellow-400 font-bold">
                      {formatCurrency(monthIncomes.reduce((s, i) => s + (i.amount || 0), 0))}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {monthIncomes.map((income) => (
                      <div key={income.id} className="glass-button rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">
                              {income.client_name || income.project_name || '(名称未設定)'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                              <span>📅 {income.income_date}</span>
                              {income.invoice_number && <span>📄 {income.invoice_number}</span>}
                            </div>
                          </div>
                          <div className="text-yellow-400 text-xl font-bold">
                            {formatCurrency(income.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-button rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">入金登録</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">得意先</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">選択してください</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">案件</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">選択してください</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">入金額 *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">入金日</label>
                  <input
                    type="date"
                    value={formData.income_date}
                    onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">請求書番号</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="INV-001"
                  />
                </div>
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

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="glass-button rounded-xl px-4 py-2 text-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="glass-button rounded-xl px-4 py-2 text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
              >
                登録
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
