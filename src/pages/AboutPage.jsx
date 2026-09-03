import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Award, BookOpen, Calendar, Briefcase, Users, Target, CheckCircle2, Medal, BadgeCheck } from 'lucide-react'
import Header from '../components/Header.jsx'
import { mentorInfo, teamInfo } from '../data/siteInfo.js'

/**
 * 关于我们页面
 * 导师完整简介 + 团队完整简介
 */
export default function AboutPage() {
  const navigate = useNavigate()

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
          <div className="h-2 divider-accent" />

          <div className="p-6 md:p-8">
            <h1 className="text-xl font-medium text-gray-900 section-title mb-6">导师完整档案</h1>

            {/* 导师头部 */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <img
                src={mentorInfo.avatar}
                alt={mentorInfo.name}
                className="w-32 h-32 rounded-2xl border-2 border-accent-400/30 flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{mentorInfo.name}</h2>
                <p className="text-accent-400 font-medium mt-1">{mentorInfo.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mt-3">{mentorInfo.bio}</p>

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

            {/* 研究方向 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-3">研究方向</h3>
              <div className="flex flex-wrap gap-2">
                {mentorInfo.research.map((r, i) => (
                  <span key={i} className="px-3 py-1.5 bg-accent-50 text-accent-600 text-sm rounded-lg border border-accent-100">
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

        {/* ===== 团队简介 ===== */}
        <section className="card-surface overflow-hidden mb-5">
          <div className="h-2 divider-accent" />

          <div className="p-6 md:p-8">
            <h1 className="text-xl font-medium text-gray-900 section-title mb-6">团队简介</h1>

            {/* 团队概要 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-accent-400" size={24} />
                <h2 className="text-xl font-bold text-gray-800">{teamInfo.name}</h2>
                <span className="px-2 py-0.5 bg-accent-50 text-accent-600 text-xs rounded-full">
                  成立于 {teamInfo.foundedYear} 年
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{teamInfo.description}</p>
              <p className="text-sm text-accent-500 font-medium mt-3 italic">「{teamInfo.slogan}」</p>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {teamInfo.stats.map((s, i) => (
                <div key={i} className="bg-warm-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary-500">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* 研究方向 */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-primary-500 section-title mb-4">研究方向</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {teamInfo.researchDirections.map((dir, i) => (
                  <div key={i} className="p-4 bg-warm-100 rounded-xl border border-warm-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-accent-400" />
                      <h4 className="text-sm font-bold text-gray-700">{dir.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{dir.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 团队亮点 */}
            <div>
              <h3 className="text-base font-semibold text-primary-500 section-title mb-4">团队亮点</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {teamInfo.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-accent-50 rounded-lg">
                    <Award size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
