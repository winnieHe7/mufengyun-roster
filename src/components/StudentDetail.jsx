import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Building2, Briefcase, Calendar, User, Users, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudentDetail({ student, onClose, onPrev, onNext, canGoPrev = true, canGoNext = true }) {
  const { currentUser, getPrivacy } = useAuth()
  const scrollContainerRef = useRef(null)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && canGoPrev) onPrev()
    else if (e.key === 'ArrowRight' && canGoNext) onNext()
    else if (e.key === 'Escape') onClose()
  }, [onPrev, onNext, onClose, canGoPrev, canGoNext])
  useEffect(() => { document.addEventListener('keydown', handleKeyDown); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = '' } }, [handleKeyDown])
  useEffect(() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0 }, [student?.id])
  if (!student) return null
  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e3a5f&color=fff&size=200`
  const privacy = getPrivacy(student.id)
  const isLoggedIn = !!currentUser
  const isAdmin = currentUser?.role === 'admin'
  const canSeePhone = isLoggedIn && (isAdmin || privacy.showPhone !== false || currentUser.id === student.id)
  const canSeeEmail = isLoggedIn && (isAdmin || privacy.showEmail !== false || currentUser.id === student.id)
  const Info = ({ icon: Icon, label, value, muted = false }) => <div className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5"><div className="flex items-center gap-2 text-xs text-gray-400"><Icon size={14} className="text-primary-400" />{label}</div><p className={`mt-1 text-sm break-words ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{value || '—'}</p></div>
  const Section = ({ title, children }) => <section className="mt-5"><h3 className="section-title mb-3 text-sm font-semibold text-primary-600">{title}</h3>{children}</section>
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 modal-overlay" onClick={onClose} role="presentation"><div className="absolute inset-0 bg-slate-950/50" />
    <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-soft-xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${student.name}的详细信息`}>
      <button type="button" onClick={onClose} aria-label="关闭详细信息" className="absolute right-5 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35 sm:right-8"><X size={17} /></button>
      <div className="gradient-header relative flex min-h-12 h-[clamp(3rem,8vw,4.5rem)] shrink-0 items-center px-4 sm:px-8">
        <span className="text-sm font-semibold tracking-wide text-white sm:text-base">详情</span>
      </div>
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 pb-6 sm:px-8">
          <div className="-mt-8 mb-4 flex flex-wrap items-end justify-between gap-3"><div className="flex items-end gap-4"><img src={avatarUrl} onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e3a5f&color=fff&size=200` }} alt={student.name} className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg" /><div className="pb-1"><div className="mb-1 text-xs text-gray-400">花名册 / {student.enrollYear ? `${student.enrollYear}级` : '校友'} / {student.name}</div><h2 className="text-2xl font-bold text-gray-900">{student.name}</h2><div className="mt-1 flex flex-wrap gap-2"><span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>{student.status}</span>{student.company && <span className="status-tag status-tag-employment">{student.industry === '升学深造' ? '深造中' : '在职'}</span>}</div></div></div><span className="hidden items-center gap-1.5 text-xs text-gray-400 sm:flex"><ShieldCheck size={15} className="text-accent-500" />档案信息按隐私设置展示</span></div>
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-600" />联系方式及部分个人信息受隐私设置保护，{isLoggedIn ? '当前账号可查看已授权内容。' : '登录后可查看已授权内容。'}</div>
          {student.bio && <div className="mb-5 flex items-start gap-2 rounded-xl bg-primary-50/70 p-4 text-sm leading-relaxed text-gray-600"><FileText size={16} className="mt-0.5 shrink-0 text-primary-500" />{student.bio}</div>}
          <Section title="基本信息"><div className="grid gap-2 sm:grid-cols-3"><Info icon={User} label="性别" value={student.gender} /><Info icon={Users} label="民族" value={student.ethnicity} /><Info icon={MapPin} label="籍贯城市" value={student.hometown} /></div></Section>
          <Section title="学业经历"><div className="grid gap-2 sm:grid-cols-3"><Info icon={Calendar} label="入学年级" value={student.enrollYear ? `${student.enrollYear}级` : ''} /><Info icon={BookOpen} label="学历层次" value={student.degree || '硕士研究生'} /><Info icon={BookOpen} label="专业" value={student.major} /><Info icon={Calendar} label="毕业年份" value={student.graduateYear ? `${student.graduateYear}年` : ''} /><Info icon={User} label="在校状态" value={student.status} /></div></Section>
          <Section title="职业近况"><div className="grid gap-2 sm:grid-cols-3"><Info icon={Building2} label="工作单位" value={student.company} /><Info icon={Briefcase} label="所属行业" value={student.industry} /><Info icon={MapPin} label="工作城市" value={student.city} /><Info icon={Briefcase} label="岗位" value={student.position} /></div></Section>
          <Section title="联系方式"><div className="grid gap-2 sm:grid-cols-2"><Info icon={Phone} label="手机号码" value={canSeePhone ? student.phone : '登录后可见'} muted={!canSeePhone} /><Info icon={Mail} label="电子邮箱" value={canSeeEmail ? student.email : '登录后可见'} muted={!canSeeEmail} /></div></Section>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><button onClick={onPrev} disabled={!canGoPrev} className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40"><ChevronLeft size={16} />上一条</button><span className="text-center text-xs text-gray-400">← / → 切换档案 · ESC 关闭</span><button onClick={onNext} disabled={!canGoNext} className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40">下一条<ChevronRight size={16} /></button></div>
        </div>
      </div>
    </div>
  </div>
}
