import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    name_kana: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    hire_date: '',
    is_active: true,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/')
      setEmployees(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]

  const openModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        employee_code: employee.employee_code || '',
        name: employee.name || '',
        name_kana: employee.name_kana || '',
        department: employee.department || '',
        position: employee.position || '',
        email: employee.email || '',
        phone: employee.phone || '',
        hire_date: employee.hire_date?.split('T')[0] || '',
        is_active: employee.is_active !== false,
      })
    } else {
      setEditingEmployee(null)
      setFormData({
        employee_code: '',
        name: '',
        name_kana: '',
        department: '',
        position: '',
        email: '',
        phone: '',
        hire_date: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, formData)
      } else {
        await api.post('/employees/', formData)
      }
      setShowModal(false)
      fetchEmployees()
    } catch (error) {
      console.error('Error saving employee:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!editingEmployee || !confirm('この従業員を削除しますか？')) return
    try {
      await api.delete(`/employees/${editingEmployee.id}`)
      setShowModal(false)
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(156, 163, 175, 0.2)', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.2)', bottom: '-5%', right: '-5%' }} />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="glass-button rounded-xl p-2 hover:bg-white/20"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">従業員マスタ</h1>
              <p className="text-gray-400 text-sm">従業員情報の管理</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="glass-button glass-gray rounded-xl px-4 py-2 text-white font-semibold"
          >
            + 従業員追加
          </button>
        </div>

        {/* Search */}
        <div className="glass-button rounded-2xl p-4 mb-6">
          <input
            type="text"
            placeholder="検索（氏名、社員番号、部署）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="glass-button rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-400">従業員データがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 glass-button glass-gray rounded-xl px-6 py-2 text-white"
            >
              最初の従業員を登録
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => openModal(employee)}
                className="glass-button rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                      {employee.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{employee.name}</h3>
                        {!employee.is_active && (
                          <span className="bg-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded">退職</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="text-gray-500">{employee.employee_code}</span>
                        {employee.department && <span>{employee.department}</span>}
                        {employee.position && <span className="text-gray-500">{employee.position}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {employee.email && (
                      <div className="text-blue-400">{employee.email}</div>
                    )}
                    {employee.phone && (
                      <div className="text-gray-500">{employee.phone}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && employees.length > 0 && (
          <div className="glass-button rounded-2xl p-4 mt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">全従業員</div>
                <div className="text-white text-2xl font-bold">{employees.length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">在籍中</div>
                <div className="text-green-400 text-2xl font-bold">
                  {employees.filter(e => e.is_active !== false).length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">部署数</div>
                <div className="text-blue-400 text-2xl font-bold">{departments.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-button rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingEmployee ? '従業員を編集' : '新規従業員登録'}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">社員番号</label>
                  <input
                    type="text"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">入社日</label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">氏名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">ふりがな</label>
                  <input
                    type="text"
                    value={formData.name_kana}
                    onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="やまだ たろう"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">部署</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="工事部"
                    list="departments"
                  />
                  <datalist id="departments">
                    {departments.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">役職</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    placeholder="主任"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="yamada@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="090-xxxx-xxxx"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="is_active" className="text-white">在籍中</label>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {editingEmployee && (
                  <button
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="glass-button rounded-xl px-4 py-2 text-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="glass-button glass-gray rounded-xl px-4 py-2 text-white font-semibold"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
