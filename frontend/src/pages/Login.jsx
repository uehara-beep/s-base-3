import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden flex items-center justify-center">
      {/* Decorative orbs */}
      <div
        className="orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'rgba(59, 130, 246, 0.3)',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(168, 85, 247, 0.3)',
          bottom: '-5%',
          right: '-5%',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              S-BASE
            </span>
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">
            サンユウテック現場管理システム
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-button rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            ログイン
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="ユーザー名を入力"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="パスワードを入力"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-blue rounded-xl py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-xs">
              初回ログイン: admin / admin123
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm">
          version 3.0
        </div>
      </div>
    </div>
  )
}
