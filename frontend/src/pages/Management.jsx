import SubMenuLayout from '../components/SubMenuLayout'
import MenuButton from '../components/MenuButton'

const menuItems = [
  { icon: '📊', label: 'ダッシュボード', path: '/management/dashboard' },
  { icon: '📈', label: '月次レポート', path: '/management/monthly-report' },
  { icon: '💹', label: '業績管理', path: '/management/performance' },
  { icon: '📤', label: 'データ出力', path: '/management/export' },
]

export default function Management() {
  return (
    <SubMenuLayout title="経営" icon="📊" color="text-purple-400">
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
