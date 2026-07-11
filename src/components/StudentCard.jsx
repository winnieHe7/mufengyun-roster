import { MapPin, Building2, Briefcase } from 'lucide-react'

/**
 * 学生卡片组件
 * 极简卡片风格，展示头像、姓名、专业、城市、单位、状态
 * @param {Object} props
 * @param {Object} props.student - 学生数据对象
 * @param {Function} props.onClick - 点击卡片回调
 */
export default function StudentCard({ student, onClick }) {
  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e3a5f&color=fff&size=128`

  const isGraduated = student.status === '已毕业'
  const hasJob = student.company && student.company.trim() !== ''

  return (
    <div
      onClick={onClick}
      className="card-surface p-5 card-hover cursor-pointer flex flex-col items-center text-center min-h-[244px]"
    >
      {/* 头像 */}
      <img
        src={avatarUrl}
        alt={student.name}
        className="w-20 h-20 rounded-full border-2 border-primary-300 mb-3 ring-4 ring-primary-50"
        loading="lazy"
      />

      {/* 姓名 */}
      <h3 className="text-lg font-bold text-primary-600 mb-1">{student.name}</h3>

      {/* 专业 */}
      <p className="text-sm text-gray-500 mb-2 truncate max-w-full">{student.major || '—'}</p>

      {/* 城市 · 单位 */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-3 flex-wrap min-h-5">
        {student.city && (
          <span className="flex items-center gap-0.5">
            <MapPin size={12} />
            {student.city}
          </span>
        )}
        {student.city && student.company && <span>·</span>}
        {student.company && (
          <span className="flex items-center gap-0.5">
            <Building2 size={12} />
            {student.company.length > 8 ? student.company.slice(0, 8) + '…' : student.company}
          </span>
        )}
      </div>

      {/* 状态标签 */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className={`status-tag ${isGraduated ? 'status-tag-graduated' : 'status-tag-active'}`}>
          {student.status}
        </span>
        {isGraduated && hasJob && (
          <span className="status-tag status-tag-employment">在职</span>
        )}
        {isGraduated && !hasJob && student.industry === '升学深造' && (
          <span className="status-tag status-tag-employment">深造中</span>
        )}
      </div>

      {/* 岗位（如有） */}
      {student.position && (
        <div className="mt-3 pt-3 border-t border-gray-50 w-full">
          <span className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <Briefcase size={12} />
            {student.position}
          </span>
        </div>
      )}
    </div>
  )
}
