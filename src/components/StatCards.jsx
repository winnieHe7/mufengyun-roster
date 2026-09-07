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
 * @param {boolean} [props.horizontal] - 将标题和数值横向排列
 */
export default function StatCards({ total, graduates, active, cities, onViewFullStats, horizontal = false }) {
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
      label: '毕业生',
      value: graduates,
      icon: GraduationCap,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      label: '工作城市',
      value: cities,
      unit: '座',
      icon: MapPin,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ]

  return (
    <section className="card-surface overflow-hidden">
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`flex min-h-[46px] items-center rounded-lg bg-gray-50/90 ${horizontal ? 'justify-center gap-1.5 px-1.5 py-2 sm:gap-3 sm:px-4 sm:py-2.5' : 'justify-between gap-3 px-3 py-2.5 sm:px-4'}`}
          >
            <div className={`flex min-w-0 items-center ${horizontal ? 'gap-1 sm:gap-2.5' : 'gap-2.5'}`}>
              <div className={`flex shrink-0 items-center justify-center rounded-lg ${horizontal ? 'h-7 w-7 sm:h-9 sm:w-9' : 'h-9 w-9'} ${card.bg}`}>
                <Icon className={card.text} size={horizontal ? 16 : 18} aria-hidden="true" />
              </div>
              <div className={horizontal ? 'flex min-w-0 items-center gap-0.5 whitespace-nowrap' : 'min-w-0'}>
                <div className={`${horizontal ? 'whitespace-nowrap text-[10px] sm:text-xs' : 'truncate text-xs'} text-gray-500`}>{card.label}{horizontal && '：'}</div>
                <div className={`${horizontal ? 'text-lg sm:text-2xl' : 'mt-1 text-xl sm:text-2xl'} whitespace-nowrap font-medium leading-none text-gray-900`}>
                  {card.value}<span className={`${horizontal ? 'ml-0.5 text-[10px] sm:ml-1 sm:text-xs' : 'ml-1 text-xs'} font-normal text-gray-500`}>{card.unit || '人'}</span>
                </div>
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
