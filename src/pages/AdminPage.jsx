import { useState, useMemo, useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Users, ToggleLeft, ToggleRight, Download, UserPlus, Trash2, KeyRound, Pencil, X, Save, Images, Upload, CalendarDays, Tag } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { loadMemoryPhotos, saveMemoryPhotos, compressMemoryImage } from '../utils/memoryPhotos.js'

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
  const [memoryPhotos, setMemoryPhotos] = useState([])
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [memorySaving, setMemorySaving] = useState(false)
  const [memoryYear, setMemoryYear] = useState('')
  const [memoryTag, setMemoryTag] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [memoryDescription, setMemoryDescription] = useState('')
  const memoryInputRef = useRef(null)

  // 关键字筛选
  const [keyword, setKeyword] = useState('')
  const filteredStudents = useMemo(() => {
    if (!keyword.trim()) return students
    const q = keyword.trim().toLowerCase()
    return students.filter(s =>
      [s.name, s.major, s.city, s.company, s.industry, s.position, s.email, s.phone, s.hometown]
        .some(v => String(v || '').toLowerCase().includes(q))
    )
  }, [students, keyword])

  const memoryYears = useMemo(() => [...new Set([
    ...(students || []).map(student => student.enrollYear),
    ...(memoryPhotos || []).map(photo => photo.year),
  ].filter(Boolean).map(String))].sort((a, b) => Number(b) - Number(a)), [students, memoryPhotos])

  useEffect(() => {
    if (!isAdmin) return undefined
    let active = true
    setMemoryLoading(true)
    loadMemoryPhotos().then(photos => {
      if (active) setMemoryPhotos(Array.isArray(photos) ? photos : [])
    }).catch(() => {}).finally(() => {
      if (active) setMemoryLoading(false)
    })
    return () => { active = false }
  }, [isAdmin])

  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const [config, setConfig] = useState({
    registrationOpen: true,
    exportEnabled: true,
    announcement: '欢迎访问同门星图系统',
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
    const headers = ['姓名', '性别', '民族', '籍贯城市', '入学年份', '毕业年份', '状态', '学历', '专业', '工作单位', '行业', '工作城市', '岗位', '手机号', '邮箱', '简介']
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

  const persistMemoryPhotos = async (nextPhotos, successText = '同门记忆已保存') => {
    setMemoryPhotos(nextPhotos)
    setMemorySaving(true)
    const result = await saveMemoryPhotos(nextPhotos)
    setMemorySaving(false)
    setMessage(result.success ? successText : `${successText}（已保存本机，远程同步失败）`)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleMemoryUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!memoryYear) {
      setMessage('请先选择照片所属届次')
      return
    }
    if (!files.length) return
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024)
    if (validFiles.length !== files.length) setMessage('仅支持图片文件，且单张不超过 20MB')
    if (!validFiles.length) return
    const added = []
    for (const [index, file] of validFiles.entries()) {
      try {
        const src = await compressMemoryImage(file)
        added.push({
          id: `memory-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          year: Number(memoryYear),
          src,
          label: memoryTag.trim() || file.name.replace(/\.[^.]+$/, ''),
          date: memoryDate,
          description: memoryDescription.trim(),
          createdAt: new Date().toISOString(),
        })
      } catch {
        setMessage(`「${file.name}」读取失败，已跳过`)
      }
    }
    if (!added.length) return
    await persistMemoryPhotos([...memoryPhotos, ...added], `已上传 ${added.length} 张照片`)
    setMemoryTag('')
    setMemoryDate('')
    setMemoryDescription('')
  }

  const updateMemoryPhotoLocal = (id, field, value) => {
    setMemoryPhotos(prev => prev.map(photo => photo.id === id ? { ...photo, [field]: value } : photo))
  }

  const handleSaveMemoryPhoto = async (photo) => {
    await persistMemoryPhotos(memoryPhotos, `已保存「${photo.label || '未命名照片'}」`)
  }

  const handleDeleteMemoryPhoto = async (id) => {
    if (!confirm('确定删除这张同门记忆照片吗？此操作不可撤销。')) return
    await persistMemoryPhotos(memoryPhotos.filter(photo => photo.id !== id), '照片已删除')
  }

  const handleMoveMemoryPhoto = async (id, direction) => {
    const current = memoryPhotos.findIndex(photo => photo.id === id)
    if (current < 0) return
    const year = String(memoryPhotos[current].year)
    const sameYear = memoryPhotos.map((photo, index) => ({ photo, index })).filter(item => String(item.photo.year) === year)
    const position = sameYear.findIndex(item => item.index === current)
    const target = position + direction
    if (target < 0 || target >= sameYear.length) return
    const next = [...memoryPhotos]
    const targetIndex = sameYear[target].index
    ;[next[current], next[targetIndex]] = [next[targetIndex], next[current]]
    await persistMemoryPhotos(next, '照片顺序已更新')
  }

  const tabs = [
    { key: 'students', label: '花名册管理', icon: Users },
    { key: 'accounts', label: '账号分发', icon: UserPlus },
    { key: 'memories', label: '同门记忆', icon: Images },
    { key: 'config', label: '系统配置', icon: Settings },
  ]

  const inputClass = 'w-full px-3 py-2 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all'

  // 学生表单组件（新增和编辑共用）
  const StudentFormFields = ({ onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
        <label className="block text-sm text-gray-500 mb-1">籍贯城市</label>
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
        <label className="block text-sm text-gray-500 mb-1">工作城市</label>
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
      <div className="sm:col-span-2 md:col-span-3">
        <label className="block text-sm text-gray-500 mb-1">个人简介</label>
        <textarea value={studentForm.bio} onChange={e => setStudentForm({...studentForm, bio: e.target.value})} rows={2} className={inputClass} />
      </div>
      <div className="flex gap-2 sm:col-span-2 md:col-span-3">
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

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 mb-4"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-medium text-gray-900">管理后台</h1>
            <p className="text-xs text-gray-400">花名册系统管理中心</p>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
            {message}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
        {/* Tab 切换：桌面端深色侧栏，移动端保持横向可滚动 */}
        <nav aria-label="管理后台导航" className="flex gap-1 overflow-x-auto rounded-xl bg-gray-900 p-1.5 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:w-full ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="min-w-0">

        {/* 花名册管理 */}
        {activeTab === 'students' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="关键字筛选：姓名 / 专业 / 城市 / 单位..."
                  className="w-full pl-3 pr-3 py-2 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
                      <th>姓名</th><th>专业</th><th>年级</th><th>学历</th><th>工作城市</th><th>行业</th><th>状态</th><th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
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
                <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <label className="block text-sm text-gray-500 mb-1">籍贯城市</label>
                    <input type="text" value={newAccount.hometown} onChange={e => setNewAccount({...newAccount, hometown: e.target.value})} className={inputClass} placeholder="如 山东济南" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">专业</label>
                    <input type="text" value={newAccount.major} onChange={e => setNewAccount({...newAccount, major: e.target.value})} className={inputClass} placeholder="如 测绘工程" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">工作城市</label>
                    <input type="text" value={newAccount.city} onChange={e => setNewAccount({...newAccount, city: e.target.value})} className={inputClass} placeholder="如 重庆" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">邮箱</label>
                    <input type="email" value={newAccount.email} onChange={e => setNewAccount({...newAccount, email: e.target.value})} className={inputClass} placeholder="如 xxx@example.com" />
                  </div>
                  <div className="sm:col-span-2">
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

        {/* 同门记忆照片管理 */}
        {activeTab === 'memories' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">同门记忆 · 照片管理</h2>
                <p className="mt-1 text-xs text-gray-400">上传各届毕业合照，并为每张照片补充展示标签</p>
              </div>
              <span className="text-xs text-gray-400">共 {memoryPhotos.length} 张 · 覆盖 {new Set(memoryPhotos.map(photo => String(photo.year))).size} 个届次</span>
            </div>

            <section
              className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 sm:p-6"
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault()
                handleMemoryUpload({ target: { files: event.dataTransfer.files, value: '' } })
              }}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Upload size={24} className="text-primary-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-primary-700">拖拽照片到此处，或点击选择文件</p>
                  <p className="mt-1 text-xs text-primary-500/75">支持批量上传 · JPG / PNG / WEBP · 单张不超过 20MB</p>
                </div>
                <input ref={memoryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleMemoryUpload} className="hidden" />
                <button type="button" onClick={() => memoryInputRef.current?.click()} disabled={memorySaving} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {memorySaving ? '保存中…' : '选择照片'}
                </button>
              </div>
              <div className="mt-5 grid gap-3 border-t border-primary-100 pt-4 sm:grid-cols-3">
                <label className="text-left text-xs text-gray-500">
                  <span className="mb-1 block">所属届次 *</span>
                  <select value={memoryYear} onChange={event => setMemoryYear(event.target.value)} className={inputClass}>
                    <option value="">请选择届次</option>
                    {memoryYears.map(year => <option key={year} value={year}>{year}届</option>)}
                  </select>
                </label>
                <label className="text-left text-xs text-gray-500">
                  <span className="mb-1 flex items-center gap-1"><Tag size={13} />默认标签</span>
                  <input value={memoryTag} onChange={event => setMemoryTag(event.target.value)} className={inputClass} placeholder="如 校门口合影" />
                </label>
                <label className="text-left text-xs text-gray-500">
                  <span className="mb-1 flex items-center gap-1"><CalendarDays size={13} />拍摄日期（可选）</span>
                  <input type="date" value={memoryDate} onChange={event => setMemoryDate(event.target.value)} className={inputClass} />
                </label>
              </div>
              <label className="mt-3 block text-left text-xs text-gray-500">
                <span className="mb-1 block">批量照片说明（可选）</span>
                <input value={memoryDescription} onChange={event => setMemoryDescription(event.target.value)} className={inputClass} placeholder="如 答辩通过后合影" />
              </label>
            </section>

            {memoryLoading ? (
              <div className="rounded-xl border border-warm-200 bg-white py-12 text-center text-sm text-gray-400">正在读取照片…</div>
            ) : memoryYears.filter(year => memoryPhotos.some(photo => String(photo.year) === year)).length === 0 ? (
              <div className="rounded-xl border border-warm-200 bg-white py-12 text-center text-sm text-gray-400">
                <Images size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
                <p>暂无同门记忆照片</p>
                <p className="mt-1 text-xs">选择届次后即可批量上传毕业合照</p>
              </div>
            ) : (
              memoryYears.filter(year => memoryPhotos.some(photo => String(photo.year) === year)).map(year => (
                <section key={year} className="rounded-xl border border-warm-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-baseline gap-2 border-b border-gray-100 pb-3">
                    <h3 className="font-semibold text-primary-600">{year}届 · 毕业合照</h3>
                    <span className="text-xs text-gray-400">{memoryPhotos.filter(photo => String(photo.year) === year).length} 张</span>
                  </div>
                  <div className="space-y-4">
                    {memoryPhotos.filter(photo => String(photo.year) === year).map((photo, index, yearPhotos) => (
                      <div key={photo.id} className="grid gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 md:grid-cols-[150px_minmax(0,1fr)_auto] md:items-start">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-primary-100 bg-primary-50">
                          {photo.src ? <img src={photo.src} alt={photo.label || `${year}届毕业合照`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-primary-400">毕业合照</div>}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="text-xs text-gray-500 sm:col-span-2">
                            <span className="mb-1 block">照片标签</span>
                            <input value={photo.label || ''} onChange={event => updateMemoryPhotoLocal(photo.id, 'label', event.target.value)} className={inputClass} placeholder="如 校门口合影" />
                          </label>
                          <label className="text-xs text-gray-500">
                            <span className="mb-1 block">拍摄日期</span>
                            <input type="date" value={photo.date || ''} onChange={event => updateMemoryPhotoLocal(photo.id, 'date', event.target.value)} className={inputClass} />
                          </label>
                          <label className="text-xs text-gray-500">
                            <span className="mb-1 block">说明</span>
                            <input value={photo.description || ''} onChange={event => updateMemoryPhotoLocal(photo.id, 'description', event.target.value)} className={inputClass} placeholder="可选" />
                          </label>
                        </div>
                        <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                          <span className="text-center text-xs text-gray-400 md:mb-1">排序 {index + 1}</span>
                          <div className="flex gap-2 md:flex-col">
                            <button type="button" onClick={() => handleMoveMemoryPhoto(photo.id, -1)} disabled={index === 0 || memorySaving} className="rounded-lg border border-warm-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40">上移</button>
                            <button type="button" onClick={() => handleSaveMemoryPhoto(photo)} disabled={memorySaving} className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40">保存</button>
                            <button type="button" onClick={() => handleMoveMemoryPhoto(photo.id, 1)} disabled={index === yearPhotos.length - 1 || memorySaving} className="rounded-lg border border-warm-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40">下移</button>
                            <button type="button" onClick={() => handleDeleteMemoryPhoto(photo.id)} disabled={memorySaving} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">删除</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
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
        </div>
        </div>
      </main>
    </div>
  )
}
