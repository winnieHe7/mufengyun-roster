import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, BookOpen, Users, Calendar } from 'lucide-react'
import { mentorInfo, teamInfo } from '../data/siteInfo.js'

/**
 * 首页顶部 Hero 区
 * 导师简介 + 团队简介 精简版卡片
 */
export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className="hero-bg rounded-xl overflow-hidden mb-6 shadow-soft-lg">
      <div className="relative z-10 p-6 md:p-8">
        {/* 团队标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {teamInfo.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-accent-400/60" />
            <span className="text-sm text-accent-400 tracking-widest">{teamInfo.slogan}</span>
            <div className="h-px w-12 bg-accent-400/60" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 导师简介卡片 */}
          <div
            onClick={() => navigate('/about')}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={mentorInfo.avatar}
                alt={mentorInfo.name}
                className="w-16 h-16 rounded-full border-2 border-accent-400/50"
              />
              <div>
                <h2 className="text-lg font-bold text-white">{mentorInfo.name}</h2>
                <p className="text-xs text-accent-400">{mentorInfo.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
              {mentorInfo.bio}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentorInfo.research.slice(0, 3).map((r, i) => (
                <span key={i} className="px-2 py-0.5 bg-accent-400/20 text-accent-400 text-xs rounded-full">
                  {r}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-accent-400 group-hover:gap-2 transition-all">
              查看导师详情
              <ArrowRight size={12} />
            </div>
          </div>

          {/* 团队简介卡片 */}
          <div
            onClick={() => navigate('/about')}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-accent-400" size={20} />
              <h2 className="text-lg font-bold text-white">团队简介</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
              {teamInfo.description}
            </p>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {teamInfo.stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-bold text-accent-400">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-accent-400 group-hover:gap-2 transition-all">
              查看团队详情
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
