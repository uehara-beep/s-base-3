import { useNavigate } from 'react-router-dom'

export default function SubMenuLayout({ title, icon, color, children }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      {/* Decorative orbs */}
      <div
        className="orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'rgba(59, 130, 246, 0.2)',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(168, 85, 247, 0.2)',
          bottom: '-5%',
          right: '-5%',
        }}
      />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
          >
            <span className="text-xl">←</span>
            <span>ホーム</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h1 className={`text-2xl font-bold ${color}`}>{title}</h1>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
