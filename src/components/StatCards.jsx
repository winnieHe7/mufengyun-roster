import { Users, GraduationCap, School, MapPin, TrendingUp } from 'lucide-react'

/**
 * 统计指标卡片组件
 * 展示四项核心数据和完整统计入口
 * @param {Object} props
 * @param {number} props.total - 总人数
 * @param {number} props.graduates - 往届毕业生数
 * @param {number} props.active - 在校学生数
 * @param {number} props.cities - 就业覆盖城市数
 * @param {Function} [props.onViewFullStats] - 查看完整统计回调
 */
export default function StatCards({ total, graduates, active, cities, onViewFullStats }) {
  const cards = [
    {
      label: '总在册人数',
      value: total,
      icon: Users,
      bg: 'bg-primary-50',
      text: 'text-primary-600',
    },
    {
      label: '往届毕业生',
      value: graduates,
      icon: GraduationCap,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: '在校学生',
      value: active,
      icon: School,
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: '就业覆盖城市',
      value: cities,
      unit: '座',
      icon: MapPin,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ]

  return (
    <section className="card-surface overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`px-4 py-4 flex items-center justify-between gap-3 ${index % 2 === 0 ? 'border-r' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''} lg:border-r lg:last:border-r-0 border-gray-100`}
          >
            <div>
              <div className="text-xs text-gray-500 mb-1">{card.label}</div>
              <div className="text-2xl font-medium text-gray-900">
                {card.value}<span className="text-xs font-normal text-gray-400 ml-1">{card.unit || '人'}</span>
              </div>
            </div>
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
              <Icon className={card.text} size={18} />
            </div>
          </div>
        )
      })}

      </div>
      {onViewFullStats && (
        <button
          type="button"
          onClick={onViewFullStats}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-primary-600 bg-gray-50 border-t border-gray-100 hover:bg-primary-50 transition-colors"
          aria-label="查看完整统计"
        >
          <TrendingUp size={15} /><span>查看完整统计</span>
        </button>
      )}
    </section>
  )
}
