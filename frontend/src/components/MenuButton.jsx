import { useNavigate } from 'react-router-dom'

export default function MenuButton({ icon, label, path, color = 'glass-button' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(path)}
      className={`${color} glass-button rounded-2xl p-4 flex items-center gap-4 cursor-pointer w-full text-left`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-white text-lg font-medium">{label}</span>
    </button>
  )
}
