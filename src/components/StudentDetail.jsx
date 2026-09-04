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
  const isOwnProfile = currentUser?.studentId === student.id || currentUser?.id === student.id
  const canSeePhone = isLoggedIn && (isAdmin || privacy.showPhone !== false || isOwnProfile)
  const canSeeEmail = isLoggedIn && (isAdmin || privacy.showEmail !== false || isOwnProfile)
  const contactHint = !isLoggedIn || !canSeePhone || !canSeeEmail ? '· 按隐私设置展示' : null
  const identityMeta = `${student.enrollYear ? `${student.enrollYear}级` : '校友'} · ${student.degree || '硕士研究生'} · ${student.status || '在读'}`

  const Info = ({ icon: Icon, label, value, muted = false }) => (
    <div className="flex min-w-0 items-baseline justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0 md:block md:border-b-0 md:py-2">
      <div className="flex min-w-0 items-center gap-2 text-xs text-gray-400">
        <Icon size={14} className="hidden shrink-0 text-primary-400 md:block" aria-hidden="true" />
        <span className="shrink-0">{label}</span>
      </div>
      <p className={`min-w-0 break-words text-right text-sm md:mt-1 md:text-left ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{value || '—'}</p>
    </div>
  )

  const Section = ({ title, hint, children }) => (
    <section className="mt-5 first:mt-0">
      <div className="mb-1.5 flex items-baseline gap-1.5 border-b border-gray-100 pb-2">
        <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
        {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
      </div>
      {children}
    </section>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-5 modal-overlay" onClick={onClose} role="presentation">
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="relative z-10 flex h-full max-h-screen w-full flex-col overflow-hidden rounded-none border border-gray-200 bg-white shadow-soft-xl sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-5xl sm:rounded-xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${student.name}的详细信息`}>
        <div className="flex h-[50px] shrink-0 items-center border-b border-gray-100 bg-white px-4 md:hidden">
          <button type="button" onClick={onClose} aria-label="返回同门星图" className="inline-flex min-h-10 items-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"><span aria-hidden="true" className="text-xl font-light leading-none text-gray-500">‹</span><span className="font-medium text-gray-800">同门星图</span><span className="text-gray-300">/</span><span className="text-gray-400">{student.enrollYear ? `${student.enrollYear}级` : '校友'}</span></button>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭详细信息" className="absolute right-4 top-4 z-30 hidden h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 md:flex"><X size={17} /></button>

        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="hidden border-b border-primary-100 bg-primary-50/45 px-7 py-3.5 pr-20 md:block">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400"><span>同门星图</span><span aria-hidden="true">/</span><span>{student.enrollYear ? `${student.enrollYear}级` : '校友'}</span><span aria-hidden="true">/</span><span className="max-w-full break-words text-gray-600">{student.name}</span></div>
          </div>

          <div className="px-4 py-4 sm:px-7 sm:py-6">
            {(!isLoggedIn || !canSeePhone || !canSeeEmail) && <div className="mb-5 hidden items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800 md:flex"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-600" /><span>联系方式及部分个人信息受隐私设置保护，{isLoggedIn ? '当前账号可查看已授权内容。' : '登录后可查看已授权内容。'}</span></div>}

            <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-7">
              <aside className="mb-5 min-w-0 border-b border-gray-100 pb-4 text-center md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-7">
                <img src={avatarUrl} onError={e => handleAvatarError(e, student.name, 200)} alt={student.name} className="mx-auto h-16 w-16 rounded-full border-2 border-primary-100 object-cover shadow-sm md:h-[88px] md:w-[88px]" />
                <h2 className="mt-2 break-words text-[18px] font-semibold leading-tight text-gray-900 md:mt-3 md:text-2xl">{student.name}</h2>
                <p className="mt-1 break-words text-xs text-gray-400 md:text-sm">{identityMeta}</p>
                <div className="mt-2 hidden flex-wrap justify-center gap-2 md:flex"><span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>{student.status || '在读'}</span>{student.company && <span className="status-tag status-tag-employment">{student.industry === '升学深造' ? '深造中' : '在职'}</span>}</div>
                {student.bio && <div className="mx-auto mt-3 max-w-md text-left text-xs leading-relaxed text-gray-500 md:mt-5 md:rounded-lg md:bg-primary-50/70 md:p-3"><FileText size={14} className="mr-1 hidden align-[-2px] text-primary-400 md:inline-block" aria-hidden="true" />{student.bio}</div>}
                <div className="mt-3 hidden items-center justify-center gap-1.5 text-xs text-gray-400 md:flex"><ShieldCheck size={14} className="text-accent-500" />档案信息按隐私设置展示</div>
              </aside>

              <div className="min-w-0">
                <Section title="基本信息"><div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3"><Info icon={User} label="性别" value={student.gender} /><Info icon={Users} label="民族" value={student.ethnicity} /><Info icon={MapPin} label="籍贯城市" value={student.hometown} /></div></Section>
                <Section title="学业信息"><div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3"><Info icon={Calendar} label="入学年级" value={student.enrollYear ? `${student.enrollYear}级` : ''} /><Info icon={BookOpen} label="学历层次" value={student.degree || '硕士研究生'} /><Info icon={BookOpen} label="专业" value={student.major} /><Info icon={Calendar} label="毕业年份" value={student.graduateYear ? `${student.graduateYear}年` : ''} /><Info icon={User} label="在校状态" value={student.status} /></div></Section>
                <Section title="联系方式" hint={contactHint}><div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3"><Info icon={Phone} label="手机号码" value={canSeePhone ? student.phone : '登录后可见'} muted={!canSeePhone} /><Info icon={Mail} label="电子邮箱" value={canSeeEmail ? student.email : '登录后可见'} muted={!canSeeEmail} /></div></Section>
                <Section title="职业近况"><div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3"><Info icon={Building2} label="工作单位" value={student.company} /><Info icon={Briefcase} label="所属行业" value={student.industry} /><Info icon={MapPin} label="工作城市" value={student.city} /><Info icon={Briefcase} label="岗位" value={student.position} /></div></Section>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-3 sm:justify-between"><button type="button" onClick={onPrev} disabled={!canGoPrev} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-40 sm:min-h-9 sm:flex-none"><ChevronLeft size={15} />上一条</button><span className="hidden text-center text-[11px] text-gray-400 sm:inline">← / → 切换档案 · ESC 关闭</span><button type="button" onClick={onNext} disabled={!canGoNext} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-40 sm:min-h-9 sm:flex-none">下一条<ChevronRight size={15} /></button></div>
          </div>
        </div>
      </div>
    </div>
  )
}
