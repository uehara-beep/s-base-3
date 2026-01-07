import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const menuItems = [
  {
    id: 'sales',
    icon: '📋',
    label: '営業',
    color: 'glass-orange',
    path: '/sales',
  },
  {
    id: 'construction',
    icon: '🚧',
    label: '工事',
    color: 'glass-blue',
    path: '/construction',
  },
  {
    id: 'office',
    icon: '📄',
    label: '事務',
    color: 'glass-green',
    path: '/office',
  },
  {
    id: 'management',
    icon: '📊',
    label: '経営',
    color: 'glass-purple',
    path: '/management',
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: '設定/マスタ',
    color: 'glass-gray',
    path: '/settings',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeButton, setActiveButton] = useState(null)

  const handleClick = (item) => {
    setActiveButton(item.id)
    setTimeout(() => {
      navigate(item.path)
    }, 300)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      {/* User info & Logout */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
        <span className="text-gray-400 text-sm">
          {user?.username}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-colors text-sm"
        >
          ログアウト
        </button>
      </div>
      {/* Decorative orbs */}
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          background: 'rgba(59, 130, 246, 0.3)',
          top: '-15%',
          left: '-10%',
        }}
      />
      <div
        className="orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'rgba(168, 85, 247, 0.3)',
          bottom: '-10%',
          right: '-10%',
        }}
      />
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(249, 115, 22, 0.2)',
          top: '40%',
          right: '5%',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo section */}
        <div className="text-center mb-10 logo-float">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-3">
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
          <p className="text-gray-400 text-lg md:text-xl tracking-widest font-light">
            サンユウテック現場管理システム
          </p>
          <div className="mt-2 text-gray-500 text-sm tracking-wider">
            version 3.0
          </div>
        </div>

        {/* Menu buttons - 2x2 + 1 layout */}
        <div className="w-full max-w-2xl">
          {/* Top 4 buttons */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`glass-button ${item.color} rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  activeButton === item.id ? 'animate-jelly' : ''
                }`}
                style={{
                  padding: '2.5rem 1.5rem',
                  minHeight: '160px',
                }}
              >
                <span className="text-5xl md:text-6xl">{item.icon}</span>
                <span className="text-white text-xl md:text-2xl font-semibold tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Settings button - centered at bottom */}
          <div className="flex justify-center">
            <button
              onClick={() => handleClick(menuItems[4])}
              className={`glass-button ${menuItems[4].color} rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer ${
                activeButton === menuItems[4].id ? 'animate-jelly' : ''
              }`}
              style={{
                padding: '2rem 4rem',
                minHeight: '120px',
                minWidth: '280px',
              }}
            >
              <span className="text-4xl md:text-5xl">{menuItems[4].icon}</span>
              <span className="text-white text-lg md:text-xl font-semibold tracking-wide">
                {menuItems[4].label}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-gray-600 text-sm tracking-wide">
          © 2024 サンユウテック
        </div>
      </div>
    </div>
  )
}
