import SubMenuLayout from '../components/SubMenuLayout'
import MenuButton from '../components/MenuButton'

const menuItems = [
  { icon: '📋', label: '見積一覧', path: '/sales/quotes' },
  { icon: '✏️', label: '見積作成', path: '/sales/quote-create' },
  { icon: '📅', label: '営業スケジュール', path: '/sales/schedule' },
  { icon: '👤', label: '名刺管理', path: '/sales/cards' },
]

export default function Sales() {
  return (
    <SubMenuLayout title="営業" icon="📋" color="text-orange-400">
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <MenuButton
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
          />
        ))}
      </div>
    </SubMenuLayout>
  )
}
