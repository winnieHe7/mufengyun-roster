import { Users, GraduationCap, School, MapPin, TrendingUp } from 'lucide-react'

/**
 * 统计指标卡片组件
 * 展示总在册人数、往届毕业生数、在校学生数、就业覆盖城市数
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
      color: 'primary',
      bg: 'bg-primary-50',
      text: 'text-primary-600',
    },
    {
      label: '往届毕业生',
      value: graduates,
      icon: GraduationCap,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: '在校学生',
      value: active,
      icon: School,
      color: 'green',
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: '就业覆盖城市',
      value: cities,
      icon: MapPin,
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover text-center"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={card.text} size={20} />
            </div>
            <div className={`text-3xl font-bold ${card.text}`}>
              {card.value}
              <span className="text-base font-normal text-gray-400 ml-1">人</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        )
      })}

      {/* 查看完整统计按钮 */}
      {onViewFullStats && (
        <button
          onClick={onViewFullStats}
          className="col-span-2 lg:col-span-4 flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <TrendingUp size={16} />
          查看完整统计分析
        </button>
      )}
    </div>
  )
}
