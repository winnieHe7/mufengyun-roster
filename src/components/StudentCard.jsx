import { createInitialAvatar, getStableAvatarSource, handleAvatarError } from '../utils/avatar.js'

/**
 * 学生卡片组件
 * 横向卡片布局，左侧头像，右侧信息垂直排列
 * 适配手机端：一行一卡，信息密度更高
 * @param {Object} props
 * @param {Object} props.student - 学生数据对象
 * @param {Function} props.onClick - 点击卡片回调
 */
export default function StudentCard({ student, onClick }) {
  const avatarUrl = getStableAvatarSource(student.avatar) || createInitialAvatar(student.name)

  const LabelValue = ({ label, value, emphasize = false }) => (
    <div className="flex items-center gap-2 text-xs leading-5 min-w-0">
      <span className="w-12 text-gray-400 flex-shrink-0 text-justify [text-align-last:justify]">{label}</span>
      <span className={`${emphasize ? 'text-gray-900 font-medium text-sm' : 'text-gray-600'} truncate min-w-0`}>{value || '—'}</span>
    </div>
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className="card-surface p-3 card-hover cursor-pointer flex w-full items-start gap-3 min-h-[138px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
    >
      {/* 左侧头像 */}
      <div className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={student.name}
          onError={(event) => handleAvatarError(event, student.name)}
          className="w-14 h-14 rounded-full object-cover border border-gray-200 bg-gray-50"
          loading="lazy"
        />
      </div>

      {/* 右侧信息 */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <LabelValue label="姓 名" value={student.name} emphasize />
        <LabelValue label="邮 箱" value={student.email} />
        <LabelValue label="单 位" value={[student.company, student.position].filter(Boolean).join(' · ')} />
        <LabelValue label="城 市" value={student.city} />
        <LabelValue label="行 业" value={student.industry} />
      </div>
    </button>
  )
}
