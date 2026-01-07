import SubMenuLayout from '../components/SubMenuLayout'
import MenuButton from '../components/MenuButton'

const menuItems = [
  { icon: '👥', label: '従業員マスタ', path: '/settings/employees' },
  { icon: '🔐', label: 'ユーザー管理', path: '/settings/users' },
  { icon: '🏢', label: '元請けマスタ', path: '/settings/clients' },
  { icon: '🤝', label: '協力業者マスタ', path: '/settings/partners' },
  { icon: '💴', label: '単価マスタ', path: '/settings/prices' },
  { icon: '⚙️', label: 'アプリ設定', path: '/settings/app' },
]

export default function Settings() {
  return (
    <SubMenuLayout title="設定/マスタ" icon="⚙️" color="text-gray-400">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
