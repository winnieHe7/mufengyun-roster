import { useState, useCallback, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { User, Phone, Mail, MapPin, Building2, Briefcase, Calendar, BookOpen, Save, Lock, Shield, FileText, Users, KeyRound, LogIn, Camera, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Header from './Header.jsx'

/**
 * 压缩图片到指定尺寸
 * @param {File} file - 原始图片文件
 * @param {number} maxSize - 最大边长（像素）
 * @param {number} quality - JPEG 质量 0-1
 * @returns {Promise<string>} Base64 格式的压缩图片
 */
async function compressImage(file, maxSize = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize }
        } else {
          if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

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

  // 头像上传
  const fileInputRef = useRef(null)
  const [avatarMsg, setAvatarMsg] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  // 头像上传处理：压缩到 200x200，转 base64 存储
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarMsg('')

    // 格式校验
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setAvatarMsg('仅支持 JPG/PNG/WebP/GIF 格式')
      return
    }
    // 大小校验（原始文件 10MB 以内）
    if (file.size > 10 * 1024 * 1024) {
      setAvatarMsg('图片大小不能超过 10MB')
      return
    }

    setAvatarLoading(true)
    try {
      // 读取文件 → canvas 压缩 → base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const SIZE = 200
          canvas.width = SIZE
          canvas.height = SIZE
          const ctx = canvas.getContext('2d')

          // 居中裁剪为正方形
          const minSide = Math.min(img.width, img.height)
          const sx = (img.width - minSide) / 2
          const sy = (img.height - minSide) / 2
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, SIZE, SIZE)

          // 压缩为 JPEG base64（约 10-30KB）
          const compressed = canvas.toDataURL('image/jpeg', 0.85)

          // 更新到 form 和预览
          setForm(prev => ({ ...prev, avatar: compressed }))
          setAvatarLoading(false)
          setAvatarMsg('头像已加载，点击保存生效')
          setTimeout(() => setAvatarMsg(''), 4000)
        }
        img.onerror = () => { setAvatarLoading(false); setAvatarMsg('图片加载失败') }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setAvatarLoading(false)
      setAvatarMsg('上传失败: ' + err.message)
    }
    // 清空 input 以便重复选择同一文件
    e.target.value = ''
  }

  const handleRemoveAvatar = () => {
    setForm(prev => ({ ...prev, avatar: '' }))
    setAvatarMsg('头像已清除，点击保存生效')
    setTimeout(() => setAvatarMsg(''), 4000)
  }

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
    <div className="min-h-screen">
      <Header />
      {/* 悬浮保存按钮 - 编辑模式下紧贴内容框右侧，垂直居中跟随滚动 */}
      {editing && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ right: 'max(1rem, calc((100vw - 48rem) / 2 - 3.25rem))' }}
          className="fixed top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1.5 px-5 py-4 text-white bg-primary-500 hover:bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Save size={22} />
          <span className="text-sm font-medium">{saving ? '保存中' : '保存'}</span>
        </button>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 标题 + 操作按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-xl font-medium text-gray-900">我的资料</h1><p className="text-xs text-gray-400 mt-1">维护个人档案、隐私与账号安全</p></div>
          <div className="flex gap-2">
            {editing ? (
              <button
                onClick={() => { setEditing(false); setForm({ ...currentUser }) }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
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
        <div className="card-surface p-5 mb-5">
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
        <div className="card-surface p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            {/* 头像 + 编辑模式上传 */}
            <div className="relative flex-shrink-0">
              <img
                src={form.avatar || currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=1e3a5f&color=fff&size=128`}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full border-2 border-primary-100 object-cover"
              />
              {editing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                    title="上传头像"
                  >
                    <Camera size={14} />
                  </button>
                  {form.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-400 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-colors"
                      title="移除头像"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
              <p className="text-sm text-gray-400">{currentUser.major || '专业未填写'}</p>
              <span className={`status-tag ${currentUser.status === '在读' ? 'status-tag-active' : 'status-tag-graduated'} mt-1`}>
                {currentUser.status || '在读'}
              </span>
              {avatarMsg && <p className="text-xs text-primary-500 mt-1">{avatarMsg}</p>}
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2">基础信息</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow icon={User} label="姓名" value={currentUser.name} field="name" {...rowProps} />
            <InfoRow icon={Users} label="性别" value={currentUser.gender} field="gender" {...rowProps} options={['男', '女']} />
            <InfoRow icon={MapPin} label="籍贯城市" value={currentUser.hometown} field="hometown" {...rowProps} />
            <InfoRow icon={Calendar} label="入学年份" value={currentUser.enrollYear} field="enrollYear" type="number" {...rowProps} />
            <InfoRow icon={Calendar} label="毕业年份" value={currentUser.graduateYear} field="graduateYear" type="number" {...rowProps} />
            <InfoRow icon={BookOpen} label="专业" value={currentUser.major} field="major" {...rowProps} />
          </div>

          <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2 mt-4">就业信息</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow icon={Building2} label="工作单位" value={currentUser.company} field="company" {...rowProps} />
            <InfoRow icon={Briefcase} label="所属行业" value={currentUser.industry} field="industry" {...rowProps} />
            <InfoRow icon={MapPin} label="工作城市" value={currentUser.city} field="city" {...rowProps} />
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
        <div className="card-surface p-6 mb-5">
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
        <div className="card-surface p-6">
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
