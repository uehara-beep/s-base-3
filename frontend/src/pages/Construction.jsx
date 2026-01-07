import SubMenuLayout from '../components/SubMenuLayout'
import MenuSection from '../components/MenuSection'

const categories = [
  {
    icon: '📍',
    title: '現場',
    color: 'text-blue-400',
    items: [
      { icon: '📝', label: '段取り管理', path: '/construction/setup' },
      { icon: '📖', label: '日報入力', path: '/construction/daily-report' },
      { icon: '🏗️', label: '現場一覧', path: '/construction/sites' },
    ],
  },
  {
    icon: '✅',
    title: '品質',
    color: 'text-green-400',
    items: [
      { icon: '📷', label: '工事写真', path: '/construction/photos' },
      { icon: '📐', label: '図面管理', path: '/construction/drawings' },
      { icon: '☑️', label: 'チェックリスト', path: '/construction/checklist' },
      { icon: '🔍', label: '点検管理', path: '/construction/inspection' },
    ],
  },
  {
    icon: '⚠️',
    title: '安全',
    color: 'text-yellow-400',
    items: [
      { icon: '🦺', label: 'KY管理', path: '/construction/ky' },
      { icon: '🛡️', label: '安全管理', path: '/construction/safety' },
      { icon: '🚨', label: '緊急連絡', path: '/construction/emergency' },
    ],
  },
  {
    icon: '🚛',
    title: '資材・車両',
    color: 'text-purple-400',
    items: [
      { icon: '📦', label: 'PD材料管理', path: '/construction/pd-materials' },
      { icon: '🗃️', label: '在庫管理', path: '/construction/inventory' },
      { icon: '🔧', label: '機材管理', path: '/construction/equipment' },
      { icon: '🚗', label: '車両管理', path: '/construction/vehicles' },
    ],
  },
]

export default function Construction() {
  return (
    <SubMenuLayout title="工事" icon="🚧" color="text-blue-400">
      {categories.map((category, index) => (
        <MenuSection
          key={index}
          icon={category.icon}
          title={category.title}
          items={category.items}
          color={category.color}
        />
      ))}
    </SubMenuLayout>
  )
}
