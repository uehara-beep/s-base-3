import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function KYRecord() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [formData, setFormData] = useState({
    project_id: '',
    ky_date: new Date().toISOString().split('T')[0],
    location: '',
    weather: 'sunny',
    participants: '',
    work_content: '',
    hazards: '',
    countermeasures: '',
    leader_name: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recordsRes, projectsRes] = await Promise.all([
        api.get('/ky-records/'),
        api.get('/projects/')
      ])
      setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : [])
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setRecords([])
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

  const handleSubmit = async () => {
    try {
      // バックエンドスキーマに合わせたデータ変換
      const participantList = formData.participants ? formData.participants.split(',').map(s => s.trim()) : []
      const submitData = {
        record_date: formData.ky_date,
        project_id: parseInt(formData.project_id) || 1,
        weather: formData.weather || null,
        work_content: formData.work_content || '作業内容',
        hazard_points: formData.hazards || null,
        countermeasures: formData.countermeasures || null,
        team_leader: formData.leader_name || null,
        participants: formData.participants || null,
        participant_count: participantList.length || 0,
      }

      console.log('Submitting KY record:', submitData)
      await api.post('/ky-records/', submitData)
      alert('KY記録を保存しました')
      setShowModal(false)
      fetchData()
      setFormData({
        project_id: '',
        ky_date: new Date().toISOString().split('T')[0],
        location: '',
        weather: 'sunny',
        participants: '',
        work_content: '',
        hazards: '',
        countermeasures: '',
        leader_name: '',
      })
    } catch (error) {
      console.error('Error saving KY record:', error)
      alert(`保存に失敗しました: ${error.message || error}`)
    }
  }

  const handlePhotoAnalysis = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Analyze
    const photoFormData = new FormData()
    photoFormData.append('file', file)

    try {
      setAnalyzing(true)
      setShowAnalysisModal(true)
      setAnalysisResult(null)

      const response = await api.post('/ky-records/analyze-photo', photoFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setAnalysisResult(response.data)
    } catch (error) {
      console.error('Photo analysis error:', error)
      setAnalysisResult({
        overall_assessment: 'error',
        summary: '写真の分析に失敗しました。',
        hazards: [],
        recommendations: ['再度撮影して試してください'],
        message: error.response?.data?.detail || '分析エラー'
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const applyAnalysisToForm = () => {
    if (!analysisResult) return

    const hazardText = analysisResult.hazards?.map(h =>
      `${h.type}: ${h.description}`
    ).join('\n') || ''

    const countermeasuresText = analysisResult.recommendations?.join('\n') || ''

    setFormData(prev => ({
      ...prev,
      hazards: hazardText || prev.hazards,
      countermeasures: countermeasuresText || prev.countermeasures,
    }))

    setShowAnalysisModal(false)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(234, 179, 8, 0.2)', top: '-10%', left: '-10%' }} />
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
              <h1 className="text-2xl font-bold text-white">KY管理</h1>
              <p className="text-gray-400 text-sm">危険予知活動記録</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="glass-button glass-blue rounded-xl px-4 py-2 text-white font-semibold cursor-pointer hover:bg-blue-500/40 flex items-center gap-2">
              <span>🤖</span>
              <span>AI写真分析</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoAnalysis}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowModal(true)}
              className="glass-button rounded-xl px-4 py-2 text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
            >
              + KY記録追加
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-button rounded-2xl p-4 mb-6 border-l-4 border-yellow-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦺</span>
            <div>
              <h3 className="text-white font-semibold">KY活動とは</h3>
              <p className="text-gray-400 text-sm mt-1">
                作業前に危険を予知し、対策を立てる活動です。毎日の朝礼で実施し、安全意識を高めましょう。
              </p>
            </div>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : records.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🦺</div>
            <p className="text-gray-400">KY記録がありません</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 glass-button rounded-xl px-6 py-2 text-white"
              style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
            >
              最初のKY記録を作成
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="glass-button rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">
                      {record.project?.name || '(現場未設定)'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span>{weatherIcons[record.weather]}</span>
                      <span>📅 {record.ky_date}</span>
                      {record.location && <span>📍 {record.location}</span>}
                    </div>
                  </div>
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">
                    KY実施済
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                      <span>📋</span> 本日の作業内容
                    </div>
                    <p className="text-white text-sm">{record.work_content}</p>
                  </div>

                  <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <div className="text-red-400 text-xs mb-1 flex items-center gap-1">
                      <span>⚠️</span> 危険のポイント
                    </div>
                    <p className="text-gray-300 text-sm">{record.hazards}</p>
                  </div>

                  <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20 md:col-span-2">
                    <div className="text-green-400 text-xs mb-1 flex items-center gap-1">
                      <span>✅</span> 対策
                    </div>
                    <p className="text-gray-300 text-sm">{record.countermeasures}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-sm">
                  <div className="text-gray-400">
                    <span>👷</span> リーダー: {record.leader_name || '-'}
                  </div>
                  <div className="text-gray-500">
                    参加者: {record.participants || '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-semibold text-white mb-4">KY記録作成</h3>

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
                    value={formData.ky_date}
                    onChange={(e) => setFormData({ ...formData, ky_date: e.target.value })}
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
                  <label className="block text-gray-400 text-sm mb-2">実施場所</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="現場事務所前"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">本日の作業内容 *</label>
                <textarea
                  value={formData.work_content}
                  onChange={(e) => setFormData({ ...formData, work_content: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  rows={2}
                  placeholder="今日の作業内容を記入"
                />
              </div>

              <div>
                <label className="block text-red-400 text-sm mb-2">⚠️ 危険のポイント（危険予知） *</label>
                <textarea
                  value={formData.hazards}
                  onChange={(e) => setFormData({ ...formData, hazards: e.target.value })}
                  className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  placeholder="例：高所作業中に足を滑らせて転落する危険がある"
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm mb-2">✅ 対策（行動目標） *</label>
                <textarea
                  value={formData.countermeasures}
                  onChange={(e) => setFormData({ ...formData, countermeasures: e.target.value })}
                  className="w-full bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  placeholder="例：安全帯を確実に使用し、足場の確認を徹底する"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">リーダー名</label>
                  <input
                    type="text"
                    value={formData.leader_name}
                    onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="山田太郎"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">参加者</label>
                  <input
                    type="text"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="5名"
                  />
                </div>
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
                className="glass-button rounded-xl px-4 py-2 text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Photo Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🤖</span> AI安全分析結果
            </h3>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mb-4">
                <img src={photoPreview} alt="分析写真" className="max-h-48 mx-auto rounded-lg" />
              </div>
            )}

            {analyzing ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">🔍</div>
                <p className="text-white">AIが写真を分析中...</p>
                <p className="text-gray-400 text-sm mt-2">危険箇所を検出しています</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                {/* Overall Assessment */}
                <div className={`rounded-xl p-4 border ${
                  analysisResult.overall_assessment === 'safe' ? 'bg-green-500/10 border-green-500/30' :
                  analysisResult.overall_assessment === 'caution' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  analysisResult.overall_assessment === 'danger' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-white/5 border-white/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {analysisResult.overall_assessment === 'safe' ? '✅' :
                       analysisResult.overall_assessment === 'caution' ? '⚠️' :
                       analysisResult.overall_assessment === 'danger' ? '🚨' : '❓'}
                    </span>
                    <span className={`font-semibold ${
                      analysisResult.overall_assessment === 'safe' ? 'text-green-400' :
                      analysisResult.overall_assessment === 'caution' ? 'text-yellow-400' :
                      analysisResult.overall_assessment === 'danger' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {analysisResult.overall_assessment === 'safe' ? '安全' :
                       analysisResult.overall_assessment === 'caution' ? '注意' :
                       analysisResult.overall_assessment === 'danger' ? '危険' : '分析不可'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{analysisResult.summary}</p>
                </div>

                {/* Hazards */}
                {analysisResult.hazards && analysisResult.hazards.length > 0 && (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <span>⚠️</span> 検出された危険
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.hazards.map((hazard, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            hazard.risk_level === 'high' ? 'bg-red-500/30 text-red-300' :
                            hazard.risk_level === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-green-500/30 text-green-300'
                          }`}>
                            {hazard.risk_level === 'high' ? '高' :
                             hazard.risk_level === 'medium' ? '中' : '低'}
                          </span>
                          <span><strong>{hazard.type}</strong>: {hazard.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <span>✅</span> 推奨対策
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety Points */}
                {analysisResult.safety_points && analysisResult.safety_points.length > 0 && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                    <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <span>👍</span> 良い点
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.safety_points.map((point, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Message if API not available */}
                {analysisResult.message && (
                  <div className="text-gray-400 text-sm bg-white/5 rounded-xl p-3">
                    ℹ️ {analysisResult.message}
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAnalysisModal(false)
                  setPhotoPreview(null)
                  setAnalysisResult(null)
                }}
                className="glass-button rounded-xl px-4 py-2 text-gray-300"
              >
                閉じる
              </button>
              {analysisResult && !analysisResult.message?.includes('失敗') && (
                <button
                  onClick={applyAnalysisToForm}
                  className="glass-button rounded-xl px-4 py-2 text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(234, 179, 8, 0.2))' }}
                >
                  KY記録に反映
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
