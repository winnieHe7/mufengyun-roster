import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Building2, Briefcase, Calendar, User, Users, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { createInitialAvatar, getStableAvatarSource, handleAvatarError } from '../utils/avatar.js'

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
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }, [student?.id])

  if (!student) return null

  const avatarUrl = getStableAvatarSource(student.avatar) || createInitialAvatar(student.name, 200)
  const privacy = getPrivacy(student.id)
  const isLoggedIn = !!currentUser
  const isAdmin = currentUser?.role === 'admin'
  const canSeePhone = isLoggedIn && (isAdmin || privacy.showPhone !== false || currentUser.id === student.id)
  const canSeeEmail = isLoggedIn && (isAdmin || privacy.showEmail !== false || currentUser.id === student.id)

  const Info = ({ icon: Icon, label, value, muted = false }) => (
    <div className="min-w-0 border-b border-gray-100 py-2.5 last:border-b-0 sm:border-b-0 sm:py-2">
      <div className="flex items-center gap-2 text-xs text-gray-400"><Icon size={14} className="shrink-0 text-primary-400" /><span>{label}</span></div>
      <p className={`mt-1 break-words text-sm ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{value || '—'}</p>
    </div>
  )
  const Section = ({ title, children }) => (
    <section className="mt-5 first:mt-0">
      <h3 className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-semibold text-primary-700"><span className="h-4 w-1 rounded-full bg-primary-500" aria-hidden="true" />{title}</h3>
      {children}
    </section>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 modal-overlay" onClick={onClose} role="presentation">
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft-xl sm:max-h-[calc(100dvh-2.5rem)]" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${student.name}的详细信息`}>
        <button type="button" onClick={onClose} aria-label="关闭详细信息" className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 sm:right-4 sm:top-4"><X size={17} /></button>

        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 pr-16 sm:px-7 sm:py-3.5 sm:pr-20">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400"><span>花名册</span><span aria-hidden="true">/</span><span>{student.enrollYear ? `${student.enrollYear}级` : '校友'}</span><span aria-hidden="true">/</span><span className="max-w-full break-words text-gray-600">{student.name}</span></div>
          </div>

          <div className="px-4 py-5 sm:px-7 sm:py-6">
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-600" /><span>联系方式及部分个人信息受隐私设置保护，{isLoggedIn ? '当前账号可查看已授权内容。' : '登录后可查看已授权内容。'}</span></div>

            <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-7">
              <aside className="mb-6 min-w-0 md:mb-0 md:border-r md:border-gray-100 md:pr-7">
                <div className="flex items-center gap-4 md:block md:text-center">
                  <img src={avatarUrl} onError={e => handleAvatarError(e, student.name, 200)} alt={student.name} className="h-20 w-20 shrink-0 rounded-full border-2 border-primary-100 object-cover shadow-sm sm:h-[88px] sm:w-[88px] md:mx-auto" />
                  <div className="min-w-0 md:mt-3"><h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">{student.name}</h2><p className="mt-1 break-words text-sm text-gray-500">{student.enrollYear ? `${student.enrollYear}级` : '校友'} · {student.degree || '硕士研究生'}</p><div className="mt-2 flex flex-wrap gap-2 md:justify-center"><span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>{student.status || '在读'}</span>{student.company && <span className="status-tag status-tag-employment">{student.industry === '升学深造' ? '深造中' : '在职'}</span>}</div></div>
                </div>
                {student.bio && <div className="mt-5 flex items-start gap-2 rounded-lg bg-primary-50/70 p-3 text-left text-sm leading-relaxed text-gray-600"><FileText size={15} className="mt-0.5 shrink-0 text-primary-500" /><span className="break-words">{student.bio}</span></div>}
                <div className="mt-5 hidden items-center justify-center gap-1.5 text-xs text-gray-400 md:flex"><ShieldCheck size={14} className="text-accent-500" />档案信息按隐私设置展示</div>
              </aside>

              <div className="min-w-0">
                <Section title="基本信息"><div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3"><Info icon={User} label="性别" value={student.gender} /><Info icon={Users} label="民族" value={student.ethnicity} /><Info icon={MapPin} label="籍贯城市" value={student.hometown} /></div></Section>
                <Section title="学业经历"><div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3"><Info icon={Calendar} label="入学年级" value={student.enrollYear ? `${student.enrollYear}级` : ''} /><Info icon={BookOpen} label="学历层次" value={student.degree || '硕士研究生'} /><Info icon={BookOpen} label="专业" value={student.major} /><Info icon={Calendar} label="毕业年份" value={student.graduateYear ? `${student.graduateYear}年` : ''} /><Info icon={User} label="在校状态" value={student.status} /></div></Section>
                <Section title="职业近况"><div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3"><Info icon={Building2} label="工作单位" value={student.company} /><Info icon={Briefcase} label="所属行业" value={student.industry} /><Info icon={MapPin} label="工作城市" value={student.city} /><Info icon={Briefcase} label="岗位" value={student.position} /></div></Section>
                <Section title="联系方式"><div className="grid gap-x-5 sm:grid-cols-2"><Info icon={Phone} label="手机号码" value={canSeePhone ? student.phone : '登录后可见'} muted={!canSeePhone} /><Info icon={Mail} label="电子邮箱" value={canSeeEmail ? student.email : '登录后可见'} muted={!canSeeEmail} /></div></Section>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={onPrev} disabled={!canGoPrev} className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-40"><ChevronLeft size={16} />上一条</button><span className="text-center text-xs text-gray-400">← / → 切换档案 · ESC 关闭</span><button type="button" onClick={onNext} disabled={!canGoNext} className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-40">下一条<ChevronRight size={16} /></button></div>
          </div>
        </div>
      </div>
    </div>
  )
}
