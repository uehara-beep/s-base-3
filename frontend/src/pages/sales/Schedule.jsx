import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Schedule() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' or 'week'
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    schedule_type: 'meeting',
    location: '',
  })

  useEffect(() => {
    fetchSchedules()
  }, [currentDate])

  const fetchSchedules = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await api.get(`/schedules/?year=${year}&month=${month}`)
      setSchedules(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days = []

    // Add padding for days before the first day of the month
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Add padding for days after the last day of the month
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(s => {
      const scheduleDate = s.start_datetime?.split('T')[0]
      return scheduleDate === dateStr
    })
  }

  const getScheduleTypeColor = (type) => {
    const colors = {
      meeting: 'bg-blue-500/50',
      visit: 'bg-orange-500/50',
      deadline: 'bg-red-500/50',
      other: 'bg-gray-500/50',
    }
    return colors[type] || colors.other
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const openModal = (schedule = null, date = null) => {
    if (schedule) {
      setEditingSchedule(schedule)
      setFormData({
        title: schedule.title,
        description: schedule.description || '',
        start_datetime: schedule.start_datetime?.slice(0, 16) || '',
        end_datetime: schedule.end_datetime?.slice(0, 16) || '',
        schedule_type: schedule.schedule_type || 'meeting',
        location: schedule.location || '',
      })
    } else {
      setEditingSchedule(null)
      const dateStr = date ? date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      setFormData({
        title: '',
        description: '',
        start_datetime: `${dateStr}T09:00`,
        end_datetime: `${dateStr}T10:00`,
        schedule_type: 'meeting',
        location: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      // バックエンドスキーマに合わせたデータ変換
      const [dateStr, startTime] = formData.start_datetime?.split('T') || ['', '']
      const [, endTime] = formData.end_datetime?.split('T') || ['', '']

      const submitData = {
        title: formData.title || '無題',
        schedule_type: formData.schedule_type || null,
        date: dateStr || new Date().toISOString().split('T')[0],
        start_time: startTime || null,
        end_time: endTime || null,
        all_day: !startTime,
        location: formData.location || null,
        description: formData.description || null,
      }

      console.log('Submitting schedule:', submitData)
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, submitData)
      } else {
        await api.post('/schedules/', submitData)
      }
      alert('スケジュールを保存しました')
      setShowModal(false)
      fetchSchedules()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert(`保存に失敗しました: ${error.message || error}`)
    }
  }

  const handleDelete = async () => {
    if (!editingSchedule || !confirm('この予定を削除しますか？')) return
    try {
      await api.delete(`/schedules/${editingSchedule.id}`)
      setShowModal(false)
      fetchSchedules()
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  const days = getDaysInMonth()
  const today = new Date().toISOString().split('T')[0]

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
              <h1 className="text-2xl font-bold text-white">営業スケジュール</h1>
              <p className="text-gray-400 text-sm">商談・訪問の予定管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-orange rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 予定追加
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              ← 前月
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-white text-xl font-semibold">
                {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
              </h2>
              <button
                onClick={handleToday}
                className="glass-button rounded-lg px-3 py-1 text-sm text-white hover:bg-white/20"
              >
                今日
              </button>
            </div>
            <button
              onClick={handleNextMonth}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              翌月 →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-button rounded-2xl p-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center py-2 text-sm font-semibold ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">読み込み中...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dateStr = day.date.toISOString().split('T')[0]
                const daySchedules = getSchedulesForDate(day.date)
                const isToday = dateStr === today
                const dayOfWeek = day.date.getDay()

                return (
                  <div
                    key={index}
                    onClick={() => openModal(null, day.date)}
                    className={`min-h-[100px] p-2 rounded-xl cursor-pointer transition-colors ${
                      day.isCurrentMonth ? 'bg-white/5 hover:bg-white/10' : 'bg-white/2'
                    } ${isToday ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      !day.isCurrentMonth ? 'text-gray-600' :
                      dayOfWeek === 0 ? 'text-red-400' :
                      dayOfWeek === 6 ? 'text-blue-400' : 'text-white'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map((schedule) => (
                        <div
                          key={schedule.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal(schedule)
                          }}
                          className={`text-xs px-1 py-0.5 rounded truncate text-white ${getScheduleTypeColor(schedule.schedule_type)}`}
                        >
                          {schedule.title}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{daySchedules.length - 3} 件
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="glass-button rounded-2xl p-4 mt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/50"></div>
              <span className="text-gray-400 text-sm">商談</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/50"></div>
              <span className="text-gray-400 text-sm">訪問</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/50"></div>
              <span className="text-gray-400 text-sm">締切</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500/50"></div>
              <span className="text-gray-400 text-sm">その他</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-button rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingSchedule ? '予定を編集' : '新規予定'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="予定のタイトル"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">種別</label>
                <select
                  value={formData.schedule_type}
                  onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="meeting">商談</option>
                  <option value="visit">訪問</option>
                  <option value="deadline">締切</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">開始</label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">終了</label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">場所</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="場所"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">メモ</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  placeholder="詳細メモ"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {editingSchedule && (
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
                  className="glass-button glass-orange rounded-xl px-4 py-2 text-white font-semibold"
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
