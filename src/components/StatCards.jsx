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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="card-surface min-h-[148px] p-5 card-hover text-center flex flex-col items-center justify-center"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={card.text} size={20} />
            </div>
            <div className={`text-3xl font-bold ${card.text}`}>
              {card.value}
              <span className="text-base font-normal text-gray-400 ml-1">{card.unit || '人'}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        )
      })}

      {onViewFullStats && (
        <button
          type="button"
          onClick={onViewFullStats}
          className="min-h-[148px] p-5 card-hover text-center flex flex-col items-center justify-center text-primary-600 hover:text-primary-700 transition-colors bg-transparent border border-transparent shadow-none"
          aria-label="查看完整统计"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={20} />
          </div>
          <div className="text-sm font-medium">查看完整统计</div>
        </button>
      )}
    </div>
  )
}
