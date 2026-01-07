import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function LeaveRequest() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    leave_type: 'paid',
    start_date: '',
    end_date: '',
    reason: '',
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/leave-requests/')
      setRequests(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const leaveTypes = {
    paid: { label: '有給休暇', icon: '🏖️', color: 'green' },
    sick: { label: '病気休暇', icon: '🏥', color: 'red' },
    special: { label: '特別休暇', icon: '✨', color: 'purple' },
    half_am: { label: '午前半休', icon: '🌅', color: 'orange' },
    half_pm: { label: '午後半休', icon: '🌆', color: 'orange' },
    compensatory: { label: '代休', icon: '🔄', color: 'blue' },
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/30 text-yellow-300',
      approved: 'bg-green-500/30 text-green-300',
      rejected: 'bg-red-500/30 text-red-300',
    }
    const labels = {
      pending: '申請中',
      approved: '承認済',
      rejected: '却下',
    }
    return (
      <span className={`px-2 py-1 rounded-lg text-xs ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  const calculateDays = (start, end) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date) {
      alert('開始日と終了日を入力してください')
      return
    }

    try {
      const days = calculateDays(formData.start_date, formData.end_date)
      const submitData = {
        employee_id: 1, // TODO: ログインユーザーのemployee_idを使用
        leave_type: formData.leave_type || 'paid',
        start_date: formData.start_date,
        end_date: formData.end_date,
        days: days,
        reason: formData.reason || null,
      }

      console.log('Submitting leave request:', submitData)
      await api.post('/leave-requests/', submitData)
      alert('休暇を申請しました')
      setShowModal(false)
      setFormData({
        leave_type: 'paid',
        start_date: '',
        end_date: '',
        reason: '',
      })
      fetchRequests()
    } catch (error) {
      console.error('Error submitting leave request:', error)
      alert(`申請に失敗しました: ${error.message || error}`)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('この申請をキャンセルしますか？')) return
    try {
      await api.delete(`/leave-requests/${id}`)
      fetchRequests()
    } catch (error) {
      console.error('Error canceling leave request:', error)
    }
  }

  // Calculate remaining leave
  const usedDays = requests
    .filter(r => r.status === 'approved' && r.leave_type === 'paid')
    .reduce((sum, r) => sum + calculateDays(r.start_date, r.end_date), 0)
  const remainingDays = 20 - usedDays // Assuming 20 days annual leave

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(168, 85, 247, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.2)', bottom: '-5%', right: '-5%' }} />

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
              <h1 className="text-2xl font-bold text-white">休暇申請</h1>
              <p className="text-gray-400 text-sm">休暇・休日の申請管理</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-button glass-purple rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 休暇申請
          </button>
        </div>

        {/* Leave Balance */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">年間有給日数</div>
              <div className="text-white text-2xl font-bold">20日</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">取得済み</div>
              <div className="text-orange-400 text-2xl font-bold">{usedDays}日</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">残り日数</div>
              <div className="text-green-400 text-2xl font-bold">{remainingDays}日</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-orange-500"
                style={{ width: `${(usedDays / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : requests.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🏖️</div>
            <p className="text-gray-400">休暇申請がありません</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 glass-button glass-purple rounded-xl px-6 py-2 text-white"
            >
              休暇を申請
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const leaveType = leaveTypes[request.leave_type] || leaveTypes.paid
              const days = calculateDays(request.start_date, request.end_date)
              return (
                <div key={request.id} className="glass-button rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${leaveType.color}-500/20 flex items-center justify-center text-2xl`}>
                        {leaveType.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{leaveType.label}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span>
                            📅 {request.start_date}
                            {request.start_date !== request.end_date && ` 〜 ${request.end_date}`}
                          </span>
                          <span className="text-white font-semibold">{days}日間</span>
                        </div>
                        {request.reason && (
                          <p className="text-gray-500 text-sm mt-1">{request.reason}</p>
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-button rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">休暇申請</h3>

            <div className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">休暇種別</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(leaveTypes).map(([key, { label, icon, color }]) => (
                    <button
                      key={key}
                      onClick={() => setFormData({ ...formData, leave_type: key })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        formData.leave_type === key
                          ? `bg-${color}-500/30 border-2 border-${color}-400`
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mr-2">{icon}</span>
                      <span className="text-white text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">開始日 *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">終了日 *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    min={formData.start_date}
                  />
                </div>
              </div>

              {formData.start_date && formData.end_date && (
                <div className="text-center p-3 bg-purple-500/20 rounded-xl">
                  <span className="text-purple-300">
                    {calculateDays(formData.start_date, formData.end_date)}日間の休暇
                  </span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">理由・備考</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  placeholder="休暇の理由を入力"
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
                onClick={handleSubmit}
                className="glass-button glass-purple rounded-xl px-4 py-2 text-white font-semibold"
              >
                申請する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
