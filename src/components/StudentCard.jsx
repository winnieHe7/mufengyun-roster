import { MapPin, Building2, Briefcase, Mail } from 'lucide-react'

/**
 * 学生卡片组件
 * 横向卡片布局，左侧头像，右侧信息垂直排列
 * 适配手机端：一行一卡，信息密度更高
 * @param {Object} props
 * @param {Object} props.student - 学生数据对象
 * @param {Function} props.onClick - 点击卡片回调
 */
export default function StudentCard({ student, onClick }) {
  const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e3a5f&color=fff&size=128`

  const isGraduated = student.status === '已毕业'
  const hasJob = student.company && student.company.trim() !== ''

  const LabelValue = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      {Icon && <Icon size={13} className="text-gray-400 flex-shrink-0" />}
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-700 truncate min-w-0">{value || '—'}</span>
    </div>
  )

  return (
    <div
      onClick={onClick}
      className="card-surface p-4 card-hover cursor-pointer flex items-stretch gap-4"
    >
      {/* 左侧头像 */}
      <div className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={student.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-warm-200"
          loading="lazy"
        />
      </div>

      {/* 右侧信息 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-primary-600 truncate">{student.name}</h3>
            <span className={`status-tag flex-shrink-0 ${isGraduated ? 'status-tag-graduated' : 'status-tag-active'}`}>
              {student.status}
            </span>
            {isGraduated && hasJob && (
              <span className="status-tag status-tag-employment flex-shrink-0">{student.industry === '升学深造' ? '深造中' : '在职'}</span>
            )}
          </div>

          <LabelValue icon={Mail} label="邮箱：" value={student.email} className="mb-1" />
          <LabelValue icon={MapPin} label="就业城市：" value={student.city} className="mb-1" />
          <LabelValue icon={Building2} label="工作单位：" value={student.company} className="mb-1" />
          {student.position && (
            <LabelValue icon={Briefcase} label="岗位：" value={student.position} />
          )}
        </div>
      </div>
    </div>
  )
}
