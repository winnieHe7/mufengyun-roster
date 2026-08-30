import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Building2, Briefcase, Calendar, User, Users, BookOpen, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * 学生详情 Modal 组件
 * 展示学生完整信息，支持键盘左右切换
 * @param {Object} props
 * @param {Object} props.student - 学生数据
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onPrev - 上一条
 * @param {Function} props.onNext - 下一条
 */
export default function StudentDetail({ student, onClose, onPrev, onNext, canGoPrev = true, canGoNext = true }) {
  const { currentUser, getPrivacy } = useAuth()
  const scrollContainerRef = useRef(null)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && canGoPrev) onPrev()
    else if (e.key === 'ArrowRight' && canGoNext) onNext()
    else if (e.key === 'Escape') onClose()
  }, [onPrev, onNext, onClose, canGoPrev, canGoNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [student?.id])

  if (!student) return null

  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e3a5f&color=fff&size=200`
  const privacy = getPrivacy(student.id)
  const isLoggedIn = !!currentUser
  const isAdmin = currentUser?.role === 'admin'

  // 联系方式可见性
  const canSeePhone = isLoggedIn && (isAdmin || privacy.showPhone !== false || currentUser.id === student.id)
  const canSeeEmail = isLoggedIn && (isAdmin || privacy.showEmail !== false || currentUser.id === student.id)

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-400">{label}</span>
        <p className="text-sm text-gray-700 break-words">{value || '—'}</p>
      </div>
    </div>
  )

  const SectionTitle = ({ children }) => (
    <h4 className="text-sm font-semibold text-gray-500 border-b border-gray-100 pb-2 mb-2 mt-4">
      {children}
    </h4>
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div
        className="relative z-10 bg-white rounded-xl shadow-soft-xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${student.name}的详细信息`}
      >
        {/* 顶部渐变背景 + 头像 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭详细信息"
          className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="gradient-header h-16 flex-shrink-0 rounded-t-xl" />

          <div className="px-4 sm:px-6 pb-6">
          {/* 头像 + 姓名 */}
          <div className="flex items-center gap-4 py-4 mb-4">
            <img
              src={avatarUrl}
              alt={student.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <div className="min-w-0 pb-1">
              <h2 className="text-2xl font-bold text-gray-800 break-words">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>
                  {student.status}
                </span>
                {student.status === '已毕业' && student.company && (
                  <span className="status-tag status-tag-employment">
                    {student.industry === '升学深造' ? '深造中' : '在职'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          {student.bio && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FileText className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-gray-600 leading-relaxed">{student.bio}</p>
              </div>
            </div>
          )}

          {/* 基础身份信息 */}
          <SectionTitle>基础身份信息</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InfoRow icon={User} label="性别" value={student.gender} />
            <InfoRow icon={Users} label="民族" value={student.ethnicity} />
            <InfoRow icon={MapPin} label="籍贯城市" value={student.hometown} />
          </div>

          {/* 学业履历信息 */}
          <SectionTitle>学业履历信息</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InfoRow icon={Calendar} label="入学年级" value={student.enrollYear ? `${student.enrollYear}级` : ''} />
            <InfoRow icon={BookOpen} label="学历层次" value={student.degree || '硕士研究生'} />
            <InfoRow icon={Calendar} label="毕业年份" value={student.graduateYear ? `${student.graduateYear}年` : ''} />
            <InfoRow icon={BookOpen} label="专业" value={student.major} />
            <InfoRow icon={User} label="在校状态" value={student.status} />
          </div>

          {/* 就业发展信息 */}
          <SectionTitle>就业发展信息</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InfoRow icon={Building2} label="工作单位" value={student.company} />
            <InfoRow icon={Briefcase} label="所属行业" value={student.industry} />
            <InfoRow icon={MapPin} label="工作城市" value={student.city} />
            <InfoRow icon={Briefcase} label="岗位" value={student.position} />
          </div>

          {/* 联系方式 */}
          <SectionTitle>联系与补充信息</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {canSeePhone ? (
              <InfoRow icon={Phone} label="手机号码" value={student.phone} />
            ) : (
              <div className="flex items-start gap-3 py-2">
                <Phone className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <span className="text-xs text-gray-400">手机号码</span>
                  <p className="text-sm text-gray-300">登录后可见</p>
                </div>
              </div>
            )}
            {canSeeEmail ? (
              <InfoRow icon={Mail} label="电子邮箱" value={student.email} />
            ) : (
              <div className="flex items-start gap-3 py-2">
                <Mail className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <span className="text-xs text-gray-400">电子邮箱</span>
                  <p className="text-sm text-gray-300">登录后可见</p>
                </div>
              </div>
            )}
          </div>

          {/* 切换按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onPrev}
              disabled={!canGoPrev}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
            >
              <ChevronLeft size={16} />
              上一条
            </button>
            <span className="text-xs text-gray-400">← / → 键盘切换 · ESC 关闭</span>
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
            >
              下一条
              <ChevronRight size={16} />
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
