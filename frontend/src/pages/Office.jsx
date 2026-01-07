import SubMenuLayout from '../components/SubMenuLayout'
import MenuSection from '../components/MenuSection'

const categories = [
  {
    icon: '💰',
    title: '経費',
    color: 'text-green-400',
    items: [
      { icon: '📋', label: '経費一覧', path: '/office/expenses' },
      { icon: '✏️', label: '経費申請', path: '/office/expense-request' },
    ],
  },
  {
    icon: '📑',
    title: '書類',
    color: 'text-blue-400',
    items: [
      { icon: '📁', label: '書類管理', path: '/office/documents' },
      { icon: '🤖', label: '請求書AI', path: '/office/invoice-ai' },
      { icon: '🧾', label: '材料伝票', path: '/office/material-slips' },
    ],
  },
  {
    icon: '🏢',
    title: '入出金',
    color: 'text-yellow-400',
    items: [
      { icon: '💵', label: '入金管理', path: '/office/income' },
      { icon: '💳', label: '支払管理', path: '/office/payment' },
    ],
  },
  {
    icon: '📝',
    title: '申請',
    color: 'text-purple-400',
    items: [
      { icon: '🏖️', label: '休暇申請', path: '/office/leave-request' },
      { icon: '✅', label: '承認センター', path: '/office/approval' },
    ],
  },
]

export default function Office() {
  return (
    <SubMenuLayout title="事務" icon="📄" color="text-green-400">
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
