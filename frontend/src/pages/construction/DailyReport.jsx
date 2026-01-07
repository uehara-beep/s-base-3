import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function DailyReport() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    project_id: '',
    report_date: selectedDate,
    weather: 'sunny',
    temperature: '',
    work_content: '',
    issues: '',
    tomorrow_plan: '',
    safety_notes: '',
    labor_entries: [{ employee_name: '', work_hours: 8 }],
    material_entries: [{ material_name: '', quantity: 1, unit: '個' }],
  })

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      const [reportsRes, projectsRes] = await Promise.all([
        api.get(`/daily-reports/?date=${selectedDate}`),
        api.get('/projects/')
      ])
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : [])
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setReports([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const weatherIcons = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
  }

  const handleAddLabor = () => {
    setFormData({
      ...formData,
      labor_entries: [...formData.labor_entries, { employee_name: '', work_hours: 8 }]
    })
  }

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      material_entries: [...formData.material_entries, { material_name: '', quantity: 1, unit: '個' }]
    })
  }

  const handleLaborChange = (index, field, value) => {
    const newEntries = [...formData.labor_entries]
    newEntries[index][field] = value
    setFormData({ ...formData, labor_entries: newEntries })
  }

  const handleMaterialChange = (index, field, value) => {
    const newEntries = [...formData.material_entries]
    newEntries[index][field] = value
    setFormData({ ...formData, material_entries: newEntries })
  }

  const handleSubmit = async () => {
    try {
      await api.post('/daily-reports/', {
        ...formData,
        project_id: parseInt(formData.project_id) || null,
      })
      setShowModal(false)
      fetchData()
      setFormData({
        project_id: '',
        report_date: selectedDate,
        weather: 'sunny',
        temperature: '',
        work_content: '',
        issues: '',
        tomorrow_plan: '',
        safety_notes: '',
        labor_entries: [{ employee_name: '', work_hours: 8 }],
        material_entries: [{ material_name: '', quantity: 1, unit: '個' }],
      })
    } catch (error) {
      console.error('Error saving report:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/construction')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">日報入力</h1>
              <p className="text-gray-400 text-sm">現場作業の記録</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({ ...formData, report_date: selectedDate })
              setShowModal(true)
            }}
            className="glass-button glass-blue rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 日報作成
          </button>
        </div>

        {/* Date Navigation */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleDateChange(-1)}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              ← 前日
            </button>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="glass-button rounded-lg px-3 py-1 text-sm text-white hover:bg-white/20"
              >
                今日
              </button>
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="glass-button rounded-xl px-4 py-2 text-white hover:bg-white/20"
            >
              翌日 →
            </button>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : reports.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📖</div>
            <p className="text-gray-400">{selectedDate} の日報はありません</p>
            <button
              onClick={() => {
                setFormData({ ...formData, report_date: selectedDate })
                setShowModal(true)
              }}
              className="mt-4 glass-button glass-blue rounded-xl px-6 py-2 text-white"
            >
              日報を作成
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="glass-button rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {report.project?.name || '(現場未設定)'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{weatherIcons[report.weather]} {report.weather}</span>
                      {report.temperature && <span>🌡️ {report.temperature}°C</span>}
                    </div>
                  </div>
                  <span className="text-blue-400 text-sm">{report.report_date}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">作業内容</div>
                    <p className="text-white text-sm whitespace-pre-wrap">{report.work_content}</p>
                  </div>

                  {report.issues && (
                    <div>
                      <div className="text-yellow-400 text-xs mb-1">問題・課題</div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.issues}</p>
                    </div>
                  )}

                  {report.tomorrow_plan && (
                    <div>
                      <div className="text-green-400 text-xs mb-1">明日の予定</div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.tomorrow_plan}</p>
                    </div>
                  )}

                  {/* Labor Summary */}
                  {report.labor_entries && report.labor_entries.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-gray-400 text-xs mb-2">作業員</div>
                      <div className="flex flex-wrap gap-2">
                        {report.labor_entries.map((labor, i) => (
                          <span key={i} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
                            {labor.employee_name} ({labor.work_hours}h)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-xl font-semibold text-white mb-4">日報作成</h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">現場</label>
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
                  <label className="block text-gray-400 text-sm mb-2">日付</label>
                  <input
                    type="date"
                    value={formData.report_date}
                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">天気</label>
                  <select
                    value={formData.weather}
                    onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="sunny">☀️ 晴れ</option>
                    <option value="cloudy">☁️ 曇り</option>
                    <option value="rainy">🌧️ 雨</option>
                    <option value="snowy">❄️ 雪</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">気温</label>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">作業内容 *</label>
                <textarea
                  value={formData.work_content}
                  onChange={(e) => setFormData({ ...formData, work_content: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={4}
                  placeholder="本日の作業内容を入力"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">問題・課題</label>
                <textarea
                  value={formData.issues}
                  onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="発生した問題など"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">明日の予定</label>
                <textarea
                  value={formData.tomorrow_plan}
                  onChange={(e) => setFormData({ ...formData, tomorrow_plan: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="明日の作業予定"
                />
              </div>

              {/* Labor Entries */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-400 text-sm">作業員</label>
                  <button
                    onClick={handleAddLabor}
                    className="text-blue-400 text-sm hover:text-blue-300"
                  >
                    + 追加
                  </button>
                </div>
                {formData.labor_entries.map((entry, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={entry.employee_name}
                      onChange={(e) => handleLaborChange(index, 'employee_name', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm"
                      placeholder="氏名"
                    />
                    <input
                      type="number"
                      value={entry.work_hours}
                      onChange={(e) => handleLaborChange(index, 'work_hours', e.target.value)}
                      className="w-20 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm text-right"
                      placeholder="時間"
                    />
                    <span className="text-gray-400 self-center text-sm">h</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">安全メモ</label>
                <textarea
                  value={formData.safety_notes}
                  onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="安全に関する注意事項"
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
                className="glass-button glass-blue rounded-xl px-4 py-2 text-white font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
