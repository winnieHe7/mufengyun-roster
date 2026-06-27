import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import mockStudents from '../data/mockStudents.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

/**
 * 认证上下文
 * 双模式：Supabase（线上） / localStorage（本地降级）
 * 账号由管理员分发，无自主注册
 */

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  USER: 'roster_current_user',
  USERS: 'roster_distributed_accounts',
  STUDENTS: 'roster_students_data',
  PRIVACY: 'roster_privacy_settings',
}

function readFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage 写入失败:', e)
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [students, setStudents] = useState(() => {
    if (!isSupabaseConfigured) {
      return readFromStorage(STORAGE_KEYS.STUDENTS, null) || mockStudents
    }
    return mockStudents // 先用 mock 数据，useEffect 中从 Supabase 加载
  })
  const [accounts, setAccounts] = useState(() => {
    return readFromStorage(STORAGE_KEYS.USERS, [])
  })
  const [privacySettings, setPrivacySettings] = useState({})
  const [loading, setLoading] = useState(isSupabaseConfigured)

  // ===== 初始化 =====
  useEffect(() => {
    // 无论 Supabase 还是本地模式，都先从 localStorage 恢复登录态（保持登录常驻）
    const savedUser = readFromStorage(STORAGE_KEYS.USER, null)
    if (savedUser) setCurrentUser(savedUser)
    const savedPrivacy = readFromStorage(STORAGE_KEYS.PRIVACY, {})
    setPrivacySettings(savedPrivacy)

    if (isSupabaseConfigured) {
      loadFromSupabase()
    } else {
      writeToStorage(STORAGE_KEYS.STUDENTS, students)
    }
  }, [])

  // ===== 从 Supabase 加载数据 =====
  const loadFromSupabase = async () => {
    try {
      // 加载学生数据
      const { data: studentsData, error: sErr } = await supabase
        .from('students').select('*').order('enroll_year', { ascending: false })
      if (sErr) throw sErr
      if (studentsData && studentsData.length > 0) {
        // 转换字段名（snake_case → camelCase）
        const mapped = studentsData.map(s => ({
          id: s.id, name: s.name, gender: s.gender, ethnicity: s.ethnicity,
          hometown: s.hometown, enrollYear: s.enroll_year, graduateYear: s.graduate_year,
          status: s.status, degree: s.degree, major: s.major, company: s.company,
          industry: s.industry, city: s.city, position: s.position,
          phone: s.phone, email: s.email, bio: s.bio, avatar: s.avatar,
        }))
        setStudents(mapped)
      }

      // 加载账号列表
      const { data: accountsData, error: aErr } = await supabase
        .from('accounts').select('*').order('created_at', { ascending: false })
      if (aErr) throw aErr
      if (accountsData) {
        setAccounts(accountsData.map(a => ({
          id: a.id, name: a.name, phone: a.phone, password: a.password,
          role: a.role, degree: a.degree, enrollYear: a.enroll_year,
          graduateYear: a.graduate_year, hometown: a.hometown, major: a.major,
          city: a.city, email: a.email, createdAt: a.created_at,
        })))
      }
    } catch (e) {
      console.error('Supabase 加载失败，降级到本地数据:', e)
    } finally {
      setLoading(false)
    }
  }

  // ===== 登录 =====
  const login = useCallback(async (phone, password) => {
    if (isSupabaseConfigured) {
      // Supabase 模式：查 accounts 表
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single()
      
      if (error || !data) {
        return { success: false, message: '账号或密码错误' }
      }

      const userInfo = {
        id: data.id, name: data.name, phone: data.phone,
        role: data.role, degree: data.degree, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1e3a5f&color=fff`,
      }
      setCurrentUser(userInfo)
      writeToStorage(STORAGE_KEYS.USER, userInfo)
      return { success: true, message: '登录成功' }
    }

    // localStorage 降级模式
    const registeredUsers = readFromStorage(STORAGE_KEYS.USERS, accounts)
    const user = registeredUsers.find(u => u.phone === phone && u.password === password)
    if (user) {
      const userInfo = { ...user }
      delete userInfo.password
      setCurrentUser(userInfo)
      writeToStorage(STORAGE_KEYS.USER, userInfo)
      return { success: true, message: '登录成功' }
    }

    if (phone === 'admin' && password === 'admin123') {
      const adminUser = { id: 0, name: '管理员', phone: 'admin', role: 'admin' }
      setCurrentUser(adminUser)
      writeToStorage(STORAGE_KEYS.USER, adminUser)
      return { success: true, message: '管理员登录成功' }
    }

    return { success: false, message: '账号或密码错误' }
  }, [accounts])

  // ===== 创建分发账号（管理员） =====
  const createAccount = useCallback(async (formData) => {
    const accountData = {
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      role: 'student',
      degree: formData.degree || '研究生',
      enroll_year: formData.enrollYear ? Number(formData.enrollYear) : null,
      graduate_year: formData.graduateYear ? Number(formData.graduateYear) : null,
      hometown: formData.hometown || '',
      major: formData.major || '',
      city: formData.city || '',
      email: formData.email || '',
    }

    if (isSupabaseConfigured) {
      // 检查手机号是否已存在
      const { data: existing } = await supabase
        .from('accounts').select('id').eq('phone', formData.phone).single()
      if (existing) return { success: false, message: '该账号已存在' }

      const { data, error } = await supabase.from('accounts').insert(accountData).select().single()
      if (error) return { success: false, message: '创建失败: ' + error.message }

      // 同步添加到花名册
      const studentData = {
        name: formData.name, gender: formData.gender || '男', ethnicity: '汉族',
        hometown: formData.hometown || '',
        enroll_year: formData.enrollYear ? Number(formData.enrollYear) : new Date().getFullYear(),
        graduate_year: formData.graduateYear ? Number(formData.graduateYear) : new Date().getFullYear() + 3,
        status: '在读', degree: formData.degree || '研究生', major: formData.major || '',
        company: '', industry: '升学深造', city: formData.city || '',
        position: '在读学生', phone: formData.phone, email: formData.email || '',
        bio: '信息待完善。',
      }
      await supabase.from('students').insert(studentData)

      // 刷新数据
      await loadFromSupabase()
      return { success: true, message: `账号创建成功！账号：${formData.phone}，密码：${formData.password}` }
    }

    // localStorage 降级
    const registeredUsers = readFromStorage(STORAGE_KEYS.USERS, accounts)
    if (registeredUsers.some(u => u.phone === formData.phone)) {
      return { success: false, message: '该账号已存在' }
    }

    const newAccount = {
      ...accountData,
      id: Date.now(),
      createdAt: Date.now(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1e3a5f&color=fff`,
    }
    const updated = [...accounts, newAccount]
    setAccounts(updated)
    writeToStorage(STORAGE_KEYS.USERS, updated)

    const newStudent = {
      id: Date.now(), name: formData.name, gender: formData.gender || '男',
      ethnicity: '汉族', hometown: formData.hometown || '',
      enrollYear: formData.enrollYear || new Date().getFullYear(),
      graduateYear: formData.graduateYear || new Date().getFullYear() + 3,
      status: '在读', degree: formData.degree || '研究生', major: formData.major || '',
      company: '', industry: '升学深造', city: formData.city || '',
      position: '在读学生', phone: formData.phone, email: formData.email || '',
      bio: '信息待完善。', avatar: newAccount.avatar,
    }
    const updatedStudents = [...students, newStudent]
    setStudents(updatedStudents)
    writeToStorage(STORAGE_KEYS.STUDENTS, updatedStudents)

    return { success: true, message: `账号创建成功！账号：${formData.phone}，密码：${formData.password}` }
  }, [accounts, students])

  // ===== 删除账号 =====
  const deleteAccount = useCallback(async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) return { success: false, message: '删除失败: ' + error.message }
      await loadFromSupabase()
      return { success: true, message: '账号已删除' }
    }

    const updated = accounts.filter(a => a.id !== id)
    setAccounts(updated)
    writeToStorage(STORAGE_KEYS.USERS, updated)
    return { success: true, message: '账号已删除' }
  }, [accounts])

  // ===== 重置密码 =====
  const resetPassword = useCallback(async (id, newPwd) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('accounts').update({ password: newPwd }).eq('id', id)
      if (error) return { success: false, message: '重置失败: ' + error.message }
      return { success: true, message: '密码重置成功' }
    }

    const updated = accounts.map(a => a.id === id ? { ...a, password: newPwd } : a)
    setAccounts(updated)
    writeToStorage(STORAGE_KEYS.USERS, updated)
    return { success: true, message: '密码重置成功' }
  }, [accounts])

  // ===== 修改登录账号（手机号）=====
  const updateLoginAccount = useCallback(async (newPhone) => {
    if (!currentUser) return { success: false, message: '请先登录' }
    if (currentUser.role === 'admin') return { success: false, message: '管理员账号不支持修改' }
    if (!newPhone || newPhone.trim().length < 4) return { success: false, message: '账号长度至少4位' }

    if (isSupabaseConfigured) {
      // 检查新账号是否已被占用
      const { data: existing } = await supabase
        .from('accounts').select('id').eq('phone', newPhone.trim()).neq('id', currentUser.id).maybeSingle()
      if (existing) return { success: false, message: '该账号已被占用' }

      const { error } = await supabase.from('accounts').update({ phone: newPhone.trim() }).eq('id', currentUser.id)
      if (error) return { success: false, message: '修改失败: ' + error.message }

      // 同步更新 students 表的 phone
      await supabase.from('students').update({ phone: newPhone.trim() }).eq('phone', currentUser.phone)
    }

    const updatedUser = { ...currentUser, phone: newPhone.trim() }
    setCurrentUser(updatedUser)
    writeToStorage(STORAGE_KEYS.USER, updatedUser)
    return { success: true, message: '登录账号修改成功，下次请用新账号登录' }
  }, [currentUser])

  // ===== 修改登录密码 =====
  const updateLoginPassword = useCallback(async (oldPwd, newPwd) => {
    if (!currentUser) return { success: false, message: '请先登录' }
    if (!newPwd || newPwd.length < 6) return { success: false, message: '新密码长度至少6位' }

    if (isSupabaseConfigured) {
      // 验证旧密码
      const { data: acc } = await supabase
        .from('accounts').select('password').eq('id', currentUser.id).single()
      if (!acc || acc.password !== oldPwd) return { success: false, message: '原密码错误' }

      const { error } = await supabase.from('accounts').update({ password: newPwd }).eq('id', currentUser.id)
      if (error) return { success: false, message: '修改失败: ' + error.message }
    }

    return { success: true, message: '密码修改成功，下次请用新密码登录' }
  }, [currentUser])

  // ===== 退出登录 =====
  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }, [])

  // ===== 更新个人信息 =====
  const updateProfile = useCallback(async (updates) => {
    if (!currentUser) return { success: false, message: '请先登录' }

    const updatedUser = { ...currentUser, ...updates }
    setCurrentUser(updatedUser)
    writeToStorage(STORAGE_KEYS.USER, updatedUser)

    if (isSupabaseConfigured) {
      // 转 snake_case
      const dbUpdates = {}
      if (updates.name) dbUpdates.name = updates.name
      if (updates.gender) dbUpdates.gender = updates.gender
      if (updates.hometown !== undefined) dbUpdates.hometown = updates.hometown
      if (updates.enrollYear) dbUpdates.enroll_year = updates.enrollYear
      if (updates.graduateYear) dbUpdates.graduate_year = updates.graduateYear
      if (updates.status) dbUpdates.status = updates.status
      if (updates.degree) dbUpdates.degree = updates.degree
      if (updates.major !== undefined) dbUpdates.major = updates.major
      if (updates.company !== undefined) dbUpdates.company = updates.company
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry
      if (updates.city !== undefined) dbUpdates.city = updates.city
      if (updates.position !== undefined) dbUpdates.position = updates.position
      if (updates.phone) dbUpdates.phone = updates.phone
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('students').update(dbUpdates).eq('id', currentUser.id)
      }
    }

    // 本地同步
    const updatedStudents = students.map(s =>
      s.id === currentUser.id ? { ...s, ...updates } : s
    )
    setStudents(updatedStudents)
    if (!isSupabaseConfigured) writeToStorage(STORAGE_KEYS.STUDENTS, updatedStudents)

    return { success: true, message: '信息更新成功' }
  }, [currentUser, students])

  // ===== 隐私设置 =====
  const updatePrivacy = useCallback((userId, settings) => {
    const updated = { ...privacySettings, [userId]: settings }
    setPrivacySettings(updated)
    writeToStorage(STORAGE_KEYS.PRIVACY, updated)
  }, [privacySettings])

  const getPrivacy = useCallback((userId) => {
    return privacySettings[userId] || { showPhone: true, showEmail: true, showCompany: true }
  }, [privacySettings])

  const isAdmin = currentUser?.role === 'admin'

  const calcProfileCompleteness = useCallback((user) => {
    if (!user) return 0
    const fields = ['name', 'phone', 'gender', 'hometown', 'major', 'enrollYear', 'graduateYear', 'company', 'city', 'email', 'bio']
    const filled = fields.filter(f => user[f] && String(user[f]).trim() !== '')
    return Math.round((filled.length / fields.length) * 100)
  }, [])

  const value = {
    currentUser, isAdmin, students, accounts, loading,
    setStudents, login, logout, updateProfile,
    updateLoginAccount, updateLoginPassword,
    createAccount, deleteAccount, resetPassword,
    updatePrivacy, getPrivacy, calcProfileCompleteness,
    isSupabaseConfigured,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内部使用')
  return context
}
