import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Briefcase, CheckCircle2, Medal, BadgeCheck } from 'lucide-react'
import Header from '../components/Header.jsx'
import { mentorInfo } from '../data/siteInfo.js'
import { useAuth } from '../context/AuthContext.jsx'
import { handleAvatarError } from '../utils/avatar.js'

/**
 * 导师简介页面
 */
export default function AboutPage() {
  const navigate = useNavigate()
  const { students } = useAuth()
  const cohorts = [...new Set((students || []).map(s => s.enrollYear).filter(Boolean))].sort((a, b) => b - a)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        {/* ===== 导师简介 ===== */}
        <section className="card-surface overflow-hidden mb-5">
          <div className="h-px bg-primary-500" />

          <div className="p-4 md:p-8">
            <div className="mb-6"><p className="text-xs uppercase tracking-[0.18em] text-accent-500">MENTOR PROFILE</p><h1 className="mt-1 text-xl font-medium text-gray-900 section-title">导师简介</h1></div>

            {/* 导师头部 */}
            <div className="grid gap-5 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/80 to-white p-4 md:grid-cols-[150px_1fr] md:p-5 mb-8">
              <img
                src={mentorInfo.avatar}
                onError={(event) => handleAvatarError(event, mentorInfo.name, 256)}
                alt={mentorInfo.name}
                className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-md"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{mentorInfo.name}</h2>
                <p className="text-accent-400 font-medium mt-1">{mentorInfo.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">{mentorInfo.bio}</p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Mail size={14} className="text-accent-400" />
                    {mentorInfo.contact.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} className="text-accent-400" />
                    {mentorInfo.contact.office}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-7 grid gap-2 sm:grid-cols-3"><div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3"><p className="text-xs text-gray-400">职务</p><p className="mt-1 text-sm font-medium text-gray-700">{mentorInfo.title}</p></div><div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3"><p className="text-xs text-gray-400">办公地点</p><p className="mt-1 text-sm font-medium text-gray-700">{mentorInfo.contact.office}</p></div><div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3"><p className="text-xs text-gray-400">指导届次</p><p className="mt-1 text-sm font-medium text-gray-700">{cohorts.length ? cohorts.length + ' 个年级' : '持续更新中'}</p></div></div>
            <div className="mb-7"><h3 className="text-base font-semibold text-primary-500 section-title mb-3">指导学生届次</h3><div className="flex flex-wrap gap-2">{(cohorts.length ? cohorts : ['历届校友']).map(year => <span key={year} className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs text-primary-600">{year === '历届校友' ? year : year + '级'}</span>)}</div></div>

            {/* 研究方向 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">研究方向</h3>
              <div className="flex flex-wrap gap-2">
                {mentorInfo.research.map((r, i) => (
                  <span key={i} className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-sm text-primary-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* 工作经历 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">工作经历</h3>
              <div className="space-y-3">
                {mentorInfo.experience.map((exp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-warm-100 rounded-lg">
                    <Briefcase size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{exp.role} · {exp.org}</p>
                      <p className="text-xs text-gray-400">{exp.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 学术兼职 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">学术兼职与社会职务</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {mentorInfo.titles.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-warm-100 rounded-lg">
                    <BadgeCheck size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 科研成果 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">科研成果</h3>
              <div className="space-y-2">
                {mentorInfo.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 荣誉奖项 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">荣誉与奖项</h3>
              <div className="space-y-2">
                {mentorInfo.honors.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Medal size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{h}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 奖教金 */}
            <div>
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">奖教金</h3>
              <div className="flex flex-wrap gap-2">
                {mentorInfo.awards.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
