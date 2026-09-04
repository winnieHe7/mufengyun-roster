import { TrendingUp, Users, GraduationCap, School, MapPin } from 'lucide-react'

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
      label: '学生总数',
      value: total,
      icon: Users,
      bg: 'bg-primary-50',
      text: 'text-primary-600',
    },
    {
      label: '在校生',
      value: active,
      icon: School,
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: '往届毕业生',
      value: graduates,
      icon: GraduationCap,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      label: '覆盖城市',
      value: cities,
      unit: '座',
      icon: MapPin,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ]

  return (
    <section className="card-surface overflow-hidden">
      <div className="grid grid-cols-2 gap-3 p-3 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="flex min-h-[46px] items-center justify-between gap-3 rounded-lg bg-gray-50/90 px-3 py-2.5 sm:px-4"
          >
            <div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="whitespace-nowrap text-xl font-medium leading-none text-gray-900 sm:text-2xl">
                {card.value}<span className="ml-1 text-xs font-normal text-gray-500">{card.unit || '人'}</span>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={card.text} size={18} aria-hidden="true" />
              </div>
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
