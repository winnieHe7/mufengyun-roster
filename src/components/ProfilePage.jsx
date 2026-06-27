import { useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { User, Phone, Mail, MapPin, Building2, Briefcase, Calendar, BookOpen, Save, Lock, Shield, FileText, Users, KeyRound, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Header from './Header.jsx'

/**
 * 信息行组件（提到组件外部，避免每次 render 重建导致 input 丢焦点）
 */
function InfoRow({ icon: Icon, label, value, field, type = 'text', editing, form, onChange, inputClass, options }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
      <div className="flex-1">
        <span className="text-xs text-gray-400">{label}</span>
        {editing ? (
          options ? (
            <select
              value={form[field] || ''}
              onChange={e => onChange(field, e.target.value)}
              className={inputClass + ' mt-1'}
            >
              <option value="">请选择</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={form[field] || ''}
              onChange={e => onChange(field, e.target.value)}
              className={inputClass + ' mt-1'}
            />
          )
        ) : (
          <p className="text-sm text-gray-700">{value || '—'}</p>
        )}
      </div>
    </div>
  )
}

/**
 * 个人中心组件
 * 展示个人信息、编辑功能、隐私设置、信息完善度
 */
export default function ProfilePage() {
  const { currentUser, updateProfile, updateLoginAccount, updateLoginPassword, updatePrivacy, getPrivacy, calcProfileCompleteness, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(currentUser ? { ...currentUser } : {})

  // 账号安全
  const [newLoginAccount, setNewLoginAccount] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountMsg, setAccountMsg] = useState('')
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdMsg, setPwdMsg] = useState('')

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  if (!currentUser) return <Navigate to="/login" replace />

  const completeness = calcProfileCompleteness(currentUser)
  const privacy = getPrivacy(currentUser.id)

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile(form)
    setMessage(result.message)
    setSaving(false)
    setEditing(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePrivacyChange = (key, value) => {
    updatePrivacy(currentUser.id, { ...privacy, [key]: value })
  }

  const handleUpdateAccount = async () => {
    if (!newLoginAccount.trim()) { setAccountMsg('请输入新账号'); return }
    setSavingAccount(true)
    const result = await updateLoginAccount(newLoginAccount.trim())
    setAccountMsg(result.message)
    setSavingAccount(false)
    if (result.success) setNewLoginAccount('')
    setTimeout(() => setAccountMsg(''), 5000)
  }

  const handleUpdatePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) { setPwdMsg('请填写完整'); return }
    if (newPwd !== confirmPwd) { setPwdMsg('两次新密码不一致'); return }
    if (newPwd.length < 6) { setPwdMsg('新密码至少6位'); return }
    setSavingPwd(true)
    const result = await updateLoginPassword(oldPwd, newPwd)
    setPwdMsg(result.message)
    setSavingPwd(false)
    if (result.success) { setOldPwd(''); setNewPwd(''); setConfirmPwd('') }
    setTimeout(() => setPwdMsg(''), 5000)
  }

  const inputClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all'

  const rowProps = { editing, form, onChange: handleChange, inputClass }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 标题 + 操作按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">个人中心</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); setForm({ ...currentUser }) }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                编辑信息
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
            {message}
          </div>
        )}

        {/* 信息完善度进度条 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">信息完善度</span>
            <span className="text-sm font-bold text-primary-600">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="gradient-header h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            完善个人信息有助于校友之间更好地联系和交流
          </p>
        </div>

        {/* 个人信息卡片 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=1e3a5f&color=fff&size=128`}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full border-2 border-primary-100"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
              <p className="text-sm text-gray-400">{currentUser.major || '专业未填写'}</p>
              <span className={`status-tag ${currentUser.status === '在读' ? 'status-tag-active' : 'status-tag-graduated'} mt-1`}>
                {currentUser.status || '在读'}
              </span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2">基础信息</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow icon={User} label="姓名" value={currentUser.name} field="name" {...rowProps} />
            <InfoRow icon={Users} label="性别" value={currentUser.gender} field="gender" {...rowProps} options={['男', '女']} />
            <InfoRow icon={MapPin} label="籍贯" value={currentUser.hometown} field="hometown" {...rowProps} />
            <InfoRow icon={Calendar} label="入学年份" value={currentUser.enrollYear} field="enrollYear" type="number" {...rowProps} />
            <InfoRow icon={Calendar} label="毕业年份" value={currentUser.graduateYear} field="graduateYear" type="number" {...rowProps} />
            <InfoRow icon={BookOpen} label="专业" value={currentUser.major} field="major" {...rowProps} />
          </div>

          <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2 mt-4">就业信息</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow icon={Building2} label="工作单位" value={currentUser.company} field="company" {...rowProps} />
            <InfoRow icon={Briefcase} label="所属行业" value={currentUser.industry} field="industry" {...rowProps} />
            <InfoRow icon={MapPin} label="所在城市" value={currentUser.city} field="city" {...rowProps} />
            <InfoRow icon={Briefcase} label="岗位" value={currentUser.position} field="position" {...rowProps} />
          </div>

          <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2 mt-4">联系方式</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow icon={Phone} label="手机号" value={currentUser.phone} field="phone" {...rowProps} />
            <InfoRow icon={Mail} label="邮箱" value={currentUser.email} field="email" {...rowProps} />
          </div>

          {editing && (
            <div className="mt-4">
              <InfoRow icon={FileText} label="个人简介" value={currentUser.bio} field="bio" {...rowProps} />
            </div>
          )}
        </div>

        {/* 隐私设置 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-primary-500" size={20} />
            <h3 className="text-base font-semibold text-gray-800">隐私设置</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">设置联系方式的可见范围，保护个人隐私</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock className="text-gray-400" size={16} />
                <span className="text-sm text-gray-700">手机号可见</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showPhone !== false}
                  onChange={e => handlePrivacyChange('showPhone', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock className="text-gray-400" size={16} />
                <span className="text-sm text-gray-700">邮箱可见</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail !== false}
                  onChange={e => handlePrivacyChange('showEmail', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 账号安全 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="text-primary-500" size={20} />
            <h3 className="text-base font-semibold text-gray-800">账号安全</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">修改登录账号和密码</p>

          {/* 修改登录账号 */}
          <div className="border border-gray-100 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <LogIn className="text-gray-400" size={16} />
              <span className="text-sm font-medium text-gray-700">修改登录账号</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLoginAccount}
                onChange={e => setNewLoginAccount(e.target.value)}
                placeholder={currentUser.phone || '当前账号'}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <button
                onClick={handleUpdateAccount}
                disabled={savingAccount}
                className="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {savingAccount ? '保存中...' : '确认修改'}
              </button>
            </div>
            {accountMsg && <p className="text-xs mt-2 text-green-600">{accountMsg}</p>}
          </div>

          {/* 修改密码 */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-gray-400" size={16} />
              <span className="text-sm font-medium text-gray-700">修改登录密码</span>
            </div>
            <div className="space-y-2">
              <input
                type="password"
                value={oldPwd}
                onChange={e => setOldPwd(e.target.value)}
                placeholder="原密码"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="新密码（至少6位）"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="确认新密码"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={savingPwd}
                className="w-full py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {savingPwd ? '保存中...' : '确认修改密码'}
              </button>
              {pwdMsg && <p className="text-xs mt-1 text-green-600">{pwdMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
