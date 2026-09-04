import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { mentorInfo, teamInfo } from '../data/siteInfo.js'
import { handleAvatarError } from '../utils/avatar.js'

/**
 * 首页顶部 Hero 区
 * 导师简介 + 团队简介 精简版卡片
 */
export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero-bg rounded-xl border border-primary-100 overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
        <img src={mentorInfo.avatar} onError={(event) => handleAvatarError(event, mentorInfo.name)} alt={mentorInfo.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-medium text-gray-900">{mentorInfo.name}</h1>
            <span className="px-2 py-0.5 text-[11px] text-primary-600 bg-white border border-primary-200 rounded">{mentorInfo.title}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{mentorInfo.research.slice(0, 4).join(' · ')}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin size={12} />{mentorInfo.contact.office} · {teamInfo.slogan}</p>
        </div>
        <button onClick={() => navigate('/about')} className="self-start sm:self-auto flex items-center gap-1 px-3 py-2 text-sm text-primary-600 bg-white border border-primary-200 rounded-lg hover:border-primary-400 transition-colors">
          详情简介 <ArrowRight size={14} />
        </button>
      </div>
    </section>
  )
}
