import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Users, ToggleLeft, ToggleRight, Download, UserPlus, Trash2, KeyRound, Pencil, X, Save } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

/**
 * 管理员后台页面
 * 花名册管理（增删改）· 账号分发管理 · 系统配置
 */
export default function AdminPage() {
  const { currentUser, isAdmin, students, setStudents, accounts, createAccount, deleteAccount, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('students')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [message, setMessage] = useState('')

  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const [config, setConfig] = useState({
    registrationOpen: true,
    exportEnabled: true,
    announcement: '欢迎访问牟凤云团队系统',
  })

  // 新建账号表单
  const [newAccount, setNewAccount] = useState({
    name: '', phone: '', password: '', gender: '男', degree: '硕士研究生',
    enrollYear: '', graduateYear: '', hometown: '', major: '', city: '', email: '',
  })

  // 新增/编辑学生表单
  const emptyStudent = {
    name: '', gender: '男', ethnicity: '汉族', hometown: '', enrollYear: '', graduateYear: '',
    status: '在读', degree: '硕士研究生', major: '', company: '', industry: '', city: '',
    position: '', phone: '', email: '', bio: '',
  }
  const [studentForm, setStudentForm] = useState(emptyStudent)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (newAccount.password.length < 6) {
      setMessage('密码长度至少6位')
      return
    }
    const result = await createAccount(newAccount)
    setMessage(result.message)
    if (result.success) {
      setShowCreateForm(false)
      setNewAccount({ name: '', phone: '', password: '', gender: '男', degree: '硕士研究生', enrollYear: '', graduateYear: '', hometown: '', major: '', city: '', email: '' })
    }
    setTimeout(() => setMessage(''), 5000)
  }

  const handleDeleteAccount = async (id, name) => {
    if (!confirm(`确定要删除账号「${name}」吗？此操作不可撤销。`)) return
    const result = await deleteAccount(id)
    setMessage(result.message)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleResetPassword = async (id, name) => {
    const newPwd = prompt(`重置「${name}」的密码为：`, '123456')
    if (!newPwd) return
    const result = await resetPassword(id, newPwd)
    setMessage(`${result.message}，新密码：${newPwd}`)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleExportAll = () => {
    const headers = ['姓名', '性别', '民族', '籍贯', '入学年份', '毕业年份', '状态', '学历', '专业', '工作单位', '行业', '城市', '岗位', '手机号', '邮箱', '简介']
    const rows = students.map(s => [
      s.name, s.gender, s.ethnicity, s.hometown, s.enrollYear, s.graduateYear, s.status, s.degree,
      s.major, s.company, s.industry, s.city, s.position, s.phone, s.email, s.bio,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
    const csv = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `花名册全量数据_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`确定要删除学生「${name}」的记录吗？此操作不可撤销。`)) return
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) { setMessage('删除失败: ' + error.message); return }
    }
    setStudents(students.filter(s => s.id !== id))
    setMessage('删除成功')
    setTimeout(() => setMessage(''), 3000)
  }

  // 开始编辑学生
  const handleEditStudent = (student) => {
    setEditingStudent(student.id)
    setStudentForm({
      name: student.name || '', gender: student.gender || '男', ethnicity: student.ethnicity || '汉族',
      hometown: student.hometown || '', enrollYear: student.enrollYear || '', graduateYear: student.graduateYear || '',
      status: student.status || '在读', degree: student.degree || '硕士研究生', major: student.major || '',
      company: student.company || '', industry: student.industry || '', city: student.city || '',
      position: student.position || '', phone: student.phone || '', email: student.email || '', bio: student.bio || '',
    })
    setShowAddStudent(false)
  }

  // 保存编辑
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const dbData = {
      name: studentForm.name, gender: studentForm.gender, ethnicity: studentForm.ethnicity,
      hometown: studentForm.hometown, enroll_year: studentForm.enrollYear ? Number(studentForm.enrollYear) : null,
      graduate_year: studentForm.graduateYear ? Number(studentForm.graduateYear) : null,
      status: studentForm.status, degree: studentForm.degree, major: studentForm.major,
      company: studentForm.company, industry: studentForm.industry, city: studentForm.city,
      position: studentForm.position, phone: studentForm.phone, email: studentForm.email, bio: studentForm.bio,
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('students').update(dbData).eq('id', editingStudent)
      if (error) { setMessage('保存失败: ' + error.message); return }
    }
    // 更新本地状态
    setStudents(students.map(s => s.id === editingStudent ? {
      ...s, ...studentForm,
      enrollYear: studentForm.enrollYear ? Number(studentForm.enrollYear) : s.enrollYear,
      graduateYear: studentForm.graduateYear ? Number(studentForm.graduateYear) : s.graduateYear,
    } : s))
    setEditingStudent(null)
    setStudentForm(emptyStudent)
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 3000)
  }

  // 新增学生
  const handleAddStudent = async (e) => {
    e.preventDefault()
    const dbData = {
      name: studentForm.name, gender: studentForm.gender, ethnicity: studentForm.ethnicity,
      hometown: studentForm.hometown, enroll_year: studentForm.enrollYear ? Number(studentForm.enrollYear) : null,
      graduate_year: studentForm.graduateYear ? Number(studentForm.graduateYear) : null,
      status: studentForm.status, degree: studentForm.degree, major: studentForm.major,
      company: studentForm.company, industry: studentForm.industry, city: studentForm.city,
      position: studentForm.position, phone: studentForm.phone, email: studentForm.email, bio: studentForm.bio,
    }
    let newId = Date.now()
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').insert(dbData).select()
      if (error) { setMessage('添加失败: ' + error.message); return }
      if (data && data[0]) newId = data[0].id
    }
    setStudents([...students, {
      id: newId,
      ...studentForm,
      enrollYear: studentForm.enrollYear ? Number(studentForm.enrollYear) : null,
      graduateYear: studentForm.graduateYear ? Number(studentForm.graduateYear) : null,
    }])
    setShowAddStudent(false)
    setStudentForm(emptyStudent)
    setMessage('添加成功')
    setTimeout(() => setMessage(''), 3000)
  }

  const tabs = [
    { key: 'students', label: '花名册管理', icon: Users },
    { key: 'accounts', label: '账号分发', icon: UserPlus },
    { key: 'config', label: '系统配置', icon: Settings },
  ]

  const inputClass = 'w-full px-3 py-2 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all'

  // 学生表单组件（新增和编辑共用）
  const StudentFormFields = ({ onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-gray-500 mb-1">姓名 *</label>
        <input type="text" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">性别</label>
        <select value={studentForm.gender} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className={inputClass}>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">民族</label>
        <input type="text" value={studentForm.ethnicity} onChange={e => setStudentForm({...studentForm, ethnicity: e.target.value})} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">籍贯</label>
        <input type="text" value={studentForm.hometown} onChange={e => setStudentForm({...studentForm, hometown: e.target.value})} className={inputClass} placeholder="如 山东济南" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">入学年份</label>
        <input type="number" value={studentForm.enrollYear} onChange={e => setStudentForm({...studentForm, enrollYear: e.target.value})} className={inputClass} placeholder="如 2023" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">毕业年份</label>
        <input type="number" value={studentForm.graduateYear} onChange={e => setStudentForm({...studentForm, graduateYear: e.target.value})} className={inputClass} placeholder="如 2026" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">在校状态</label>
        <select value={studentForm.status} onChange={e => setStudentForm({...studentForm, status: e.target.value})} className={inputClass}>
          <option value="在读">在读</option>
          <option value="已毕业">已毕业</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">学历层次</label>
        <select value={studentForm.degree} onChange={e => setStudentForm({...studentForm, degree: e.target.value})} className={inputClass}>
          <option value="本科生">本科生</option>
          <option value="硕士研究生">硕士研究生</option>
          <option value="博士研究生">博士研究生</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">专业</label>
        <input type="text" value={studentForm.major} onChange={e => setStudentForm({...studentForm, major: e.target.value})} className={inputClass} placeholder="如 测绘工程" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">工作单位</label>
        <input type="text" value={studentForm.company} onChange={e => setStudentForm({...studentForm, company: e.target.value})} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">所属行业</label>
        <input type="text" value={studentForm.industry} onChange={e => setStudentForm({...studentForm, industry: e.target.value})} className={inputClass} placeholder="如 IT互联网" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">所在城市</label>
        <input type="text" value={studentForm.city} onChange={e => setStudentForm({...studentForm, city: e.target.value})} className={inputClass} placeholder="如 重庆" />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">岗位</label>
        <input type="text" value={studentForm.position} onChange={e => setStudentForm({...studentForm, position: e.target.value})} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">手机号</label>
        <input type="text" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">邮箱</label>
        <input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className={inputClass} />
      </div>
      <div className="col-span-2 md:col-span-3">
        <label className="block text-sm text-gray-500 mb-1">个人简介</label>
        <textarea value={studentForm.bio} onChange={e => setStudentForm({...studentForm, bio: e.target.value})} rows={2} className={inputClass} />
      </div>
      <div className="col-span-2 md:col-span-3 flex gap-2">
        <button type="submit" className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Save size={16} />
          保存
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors">
          <X size={16} />
          取消
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 mb-4"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-header flex items-center justify-center text-white">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-500">管理后台</h1>
            <p className="text-sm text-gray-400">花名册系统管理中心</p>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
            {message}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b border-warm-200">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-accent-400 text-primary-500'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 花名册管理 */}
        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">共 {students.length} 条学生记录</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddStudent(!showAddStudent); setEditingStudent(null); setStudentForm(emptyStudent) }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-accent-400 hover:bg-accent-500 rounded-lg transition-colors"
                >
                  <UserPlus size={16} />
                  {showAddStudent ? '收起' : '添加学生'}
                </button>
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  导出全量数据
                </button>
              </div>
            </div>

            {/* 添加学生表单 */}
            {showAddStudent && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
                <h3 className="text-base font-semibold text-primary-500 mb-4 section-title">添加新学生</h3>
                <StudentFormFields onSubmit={handleAddStudent} onCancel={() => { setShowAddStudent(false); setStudentForm(emptyStudent) }} />
              </div>
            )}

            {/* 编辑学生表单 */}
            {editingStudent && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
                <h3 className="text-base font-semibold text-primary-500 mb-4 section-title">编辑学生信息</h3>
                <StudentFormFields onSubmit={handleSaveEdit} onCancel={() => { setEditingStudent(null); setStudentForm(emptyStudent) }} />
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-warm-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full roster-table">
                  <thead>
                    <tr>
                      <th>姓名</th><th>专业</th><th>年级</th><th>学历</th><th>城市</th><th>行业</th><th>状态</th><th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td className="font-medium text-primary-500">{student.name}</td>
                        <td>{student.major}</td>
                        <td>{student.enrollYear}级</td>
                        <td>{student.degree || '硕士研究生'}</td>
                        <td>{student.city || '—'}</td>
                        <td>{student.industry || '—'}</td>
                        <td>
                          <span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-xs text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1"
                            >
                              <Pencil size={12} />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 账号分发管理 */}
        {activeTab === 'accounts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">已分发账号 {accounts.length} 个</p>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-accent-400 hover:bg-accent-500 rounded-lg transition-colors"
              >
                <UserPlus size={16} />
                {showCreateForm ? '收起表单' : '创建分发账号'}
              </button>
            </div>

            {/* 创建账号表单 */}
            {showCreateForm && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
                <h3 className="text-base font-semibold text-primary-500 mb-4 section-title">创建新账号</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">姓名 *</label>
                    <input type="text" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} required className={inputClass} placeholder="学生姓名" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">性别</label>
                    <select value={newAccount.gender} onChange={e => setNewAccount({...newAccount, gender: e.target.value})} className={inputClass}>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">学历层次</label>
                    <select value={newAccount.degree} onChange={e => setNewAccount({...newAccount, degree: e.target.value})} className={inputClass}>
                      <option value="研究生">研究生</option>
                      <option value="本科生">本科生</option>
                      <option value="博士生">博士生</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">手机号（登录账号）*</label>
                    <input type="tel" value={newAccount.phone} onChange={e => setNewAccount({...newAccount, phone: e.target.value})} required className={inputClass} placeholder="作为登录账号" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">初始密码 *</label>
                    <input type="text" value={newAccount.password} onChange={e => setNewAccount({...newAccount, password: e.target.value})} required className={inputClass} placeholder="至少6位" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">入学年份</label>
                    <input type="number" value={newAccount.enrollYear} onChange={e => setNewAccount({...newAccount, enrollYear: e.target.value})} className={inputClass} placeholder="如 2023" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">毕业年份</label>
                    <input type="number" value={newAccount.graduateYear} onChange={e => setNewAccount({...newAccount, graduateYear: e.target.value})} className={inputClass} placeholder="如 2026" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">籍贯</label>
                    <input type="text" value={newAccount.hometown} onChange={e => setNewAccount({...newAccount, hometown: e.target.value})} className={inputClass} placeholder="如 山东济南" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">专业</label>
                    <input type="text" value={newAccount.major} onChange={e => setNewAccount({...newAccount, major: e.target.value})} className={inputClass} placeholder="如 测绘工程" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">所在城市</label>
                    <input type="text" value={newAccount.city} onChange={e => setNewAccount({...newAccount, city: e.target.value})} className={inputClass} placeholder="如 重庆" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">邮箱</label>
                    <input type="email" value={newAccount.email} onChange={e => setNewAccount({...newAccount, email: e.target.value})} className={inputClass} placeholder="如 xxx@example.com" />
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
                      创建账号并加入花名册
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 已分发账号列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-200 overflow-hidden">
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
                  <p>暂无分发账号</p>
                  <p className="text-xs mt-1">点击「创建分发账号」为学生创建登录账号</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full roster-table">
                    <thead>
                      <tr>
                        <th>姓名</th><th>账号（手机号）</th><th>专业</th><th>创建时间</th><th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map(acc => (
                        <tr key={acc.id}>
                          <td className="font-medium text-primary-500">{acc.name}</td>
                          <td>{acc.phone}</td>
                          <td>{acc.major || '—'}</td>
                          <td className="text-xs text-gray-400">{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleResetPassword(acc.id, acc.name)}
                                className="text-xs text-accent-500 hover:text-accent-600 hover:underline flex items-center gap-1"
                              >
                                <KeyRound size={12} />
                                重置密码
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(acc.id, acc.name)}
                                className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 系统配置 */}
        {activeTab === 'config' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <h3 className="text-base font-semibold text-primary-500 mb-4">首页公告</h3>
              <textarea
                value={config.announcement}
                onChange={e => setConfig(prev => ({ ...prev, announcement: e.target.value }))}
                rows={3}
                className={inputClass}
                placeholder="输入首页公告内容"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <h3 className="text-base font-semibold text-primary-500 mb-4">功能开关</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">导出功能</p>
                    <p className="text-xs text-gray-400">允许管理员导出花名册数据</p>
                  </div>
                  <button onClick={() => setConfig(prev => ({ ...prev, exportEnabled: !prev.exportEnabled }))}>
                    {config.exportEnabled ? <ToggleRight size={40} className="text-accent-400" /> : <ToggleLeft size={40} className="text-gray-300" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <h3 className="text-base font-semibold text-primary-500 mb-4">系统信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">系统版本</span>
                  <p className="text-gray-700 font-medium">v1.2.0</p>
                </div>
                <div>
                  <span className="text-gray-400">学生总数</span>
                  <p className="text-gray-700 font-medium">{students.length} 人</p>
                </div>
                <div>
                  <span className="text-gray-400">已分发账号</span>
                  <p className="text-gray-700 font-medium">{accounts.length} 个</p>
                </div>
                <div>
                  <span className="text-gray-400">已毕业</span>
                  <p className="text-gray-700 font-medium">{students.filter(s => s.status === '已毕业').length} 人</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
