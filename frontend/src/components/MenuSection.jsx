import MenuButton from './MenuButton'

export default function MenuSection({ icon, title, items, color }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h2 className={`text-lg font-semibold ${color}`}>{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <MenuButton
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
          />
        ))}
      </div>
    </div>
  )
}
