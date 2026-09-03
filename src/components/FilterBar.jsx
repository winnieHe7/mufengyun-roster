import { Filter, RotateCcw, ChevronDown } from 'lucide-react'

/**
 * 多维度组合筛选栏组件
 * 支持入学年级、学历层次、工作城市、所属行业、在校状态的组合筛选
 * @param {Object} props
 * @param {Object} props.filters - 当前筛选条件
 * @param {Function} props.onFilterChange - 筛选条件变更回调
 * @param {Function} props.onReset - 重置筛选回调
 * @param {Function} props.onConfirm - 确认筛选回调
 * @param {Array<string>} props.years - 可选入学年份列表
 * @param {Array<string>} props.degrees - 可选学历层次列表
 * @param {Array<string>} props.cities - 可选城市列表
 * @param {Array<string>} props.industries - 可选行业列表
 */
export default function FilterBar({ filters, onFilterChange, onReset, onConfirm, years, degrees, cities, industries }) {
  const statusOptions = ['全部', '在读', '已毕业']

  const selectClass =
    'appearance-none w-full h-9 bg-white border border-gray-200 rounded-lg px-3 pr-8 text-sm text-gray-700 focus:border-primary-400 transition-all cursor-pointer'

  const wrapperClass = 'flex-1 min-w-[130px]'

  return (
    <section className="card-surface px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="text-primary-500" size={17} />
        <span className="text-sm font-medium text-gray-800">筛选学生</span>
        <span className="text-xs text-gray-400">支持组合条件</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* 入学年级 */}
        <div className={wrapperClass}>
          <label className="block text-xs text-gray-400 mb-1">入学年级</label>
          <div className="relative">
            <select
              value={filters.year}
              onChange={(e) => onFilterChange('year', e.target.value)}
              className={selectClass}
            >
              <option value="">全部</option>
              {years.map(y => (
                <option key={y} value={y}>{y}级</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* 学历层次 */}
        <div className={wrapperClass}>
          <label className="block text-xs text-gray-400 mb-1">学历层次</label>
          <div className="relative">
            <select
              value={filters.degree}
              onChange={(e) => onFilterChange('degree', e.target.value)}
              className={selectClass}
            >
              <option value="">全部</option>
              {degrees.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* 工作城市 */}
        <div className={wrapperClass}>
          <label className="block text-xs text-gray-400 mb-1">工作城市</label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className={selectClass}
            >
              <option value="">全部</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* 所属行业 */}
        <div className={wrapperClass}>
          <label className="block text-xs text-gray-400 mb-1">所属行业</label>
          <div className="relative">
            <select
              value={filters.industry}
              onChange={(e) => onFilterChange('industry', e.target.value)}
              className={selectClass}
            >
              <option value="">全部</option>
              {industries.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* 在校状态 */}
        <div className={wrapperClass}>
          <label className="block text-xs text-gray-400 mb-1">在校状态</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className={selectClass}
            >
              {statusOptions.map(s => (
                <option key={s} value={s === '全部' ? '' : s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            筛选
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-9 flex items-center gap-1 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            重置
          </button>
        </div>
      </div>
    </section>
  )
}
