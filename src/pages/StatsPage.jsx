import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Trophy } from 'lucide-react'
import Header from '../components/Header.jsx'
import StatCards from '../components/StatCards.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * 统计分析页
 * 展示全维度分布数据：按届别、行业、城市、状态的柱状图和饼图
 */
export default function StatsPage() {
  const { students } = useAuth()
  const navigate = useNavigate()

  // 按届别统计
  const byYear = useMemo(() => {
    const map = {}
    students.forEach(s => {
      const y = s.enrollYear
      map[y] = (map[y] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[0] - a[0])
  }, [students])

  // 按行业统计
  const byIndustry = useMemo(() => {
    const map = {}
    students.forEach(s => {
      if (s.industry) map[s.industry] = (map[s.industry] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [students])

  // 按城市统计（Top 10，其余合并为“其他”）
  const byCity = useMemo(() => {
    const map = {}
    students.forEach(s => {
      if (s.city) map[s.city] = (map[s.city] || 0) + 1
    })
    const ranked = Object.entries(map).sort((a, b) => b[1] - a[1])
    const top = ranked.slice(0, 10)
    const rest = ranked.slice(10).reduce((sum, [, count]) => sum + count, 0)
    return rest ? [...top, ['其他', rest]] : top
  }, [students])

  const maxYear = Math.max(...byYear.map(([, v]) => v), 1)
  const maxIndustry = Math.max(...byIndustry.map(([, v]) => v), 1)
  const maxCity = Math.max(...byCity.map(([, v]) => v), 1)
  const total = students.length
  const graduates = students.filter(s => s.status === '已毕业').length
  const active = students.filter(s => s.status === '在读').length
  const cityCount = new Set(students.map(s => s.city).filter(Boolean)).size
  const activePercent = total ? Math.round((active / total) * 100) : 0

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 mb-4"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        <div className="flex items-end justify-between gap-4 mb-5">
          <div><h1 className="text-xl font-medium text-gray-900">统计报表</h1><p className="text-xs text-gray-400 mt-1">学生结构与发展分布概览</p></div>
        </div>

        <div className="mb-5"><StatCards total={total} graduates={graduates} active={active} cities={cityCount} /></div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="card-surface flex h-[320px] min-h-0 flex-col p-4 sm:h-[340px] sm:p-5">
            <div className="mb-4 flex shrink-0 items-center gap-2"><BarChart3 className="text-primary-500" size={20} /><h2 className="text-base font-medium text-gray-800">在校状态构成</h2></div>
            <div className="flex min-h-0 flex-1 items-center justify-center gap-8 py-2">
              <div className="relative w-36 h-36 rounded-full" style={{ background: `conic-gradient(#185FA5 0 ${activePercent}%, #FAC775 ${activePercent}% 100%)` }}>
                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center"><span className="text-2xl font-medium text-gray-900">{total}</span><span className="text-xs text-gray-400">学生总数</span></div>
              </div>
              <div className="space-y-3 text-sm"><p className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-primary-500" />在校学生 <b className="font-medium">{active}</b></p><p className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-amber-200" />毕业生 <b className="font-medium">{graduates}</b></p></div>
            </div>
          </div>
          {/* 按届别分布 */}
          <div className="card-surface flex h-[320px] min-h-0 flex-col p-4 sm:h-[340px] sm:p-5">
            <div className="mb-4 flex shrink-0 items-center gap-2">
              <BarChart3 className="text-primary-500" size={20} />
              <h2 className="text-base font-medium text-gray-800">按入学年级分布</h2>
            </div>
            <div className="stats-scroll min-h-0 max-h-[160px] flex-1 space-y-2 overflow-y-auto pr-1">
              {byYear.map(([year, count], index) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 flex-shrink-0">{year}级</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full bar-chart-bar flex items-center justify-end pr-2"
                      style={{ width: `${(count / maxYear) * 100}%`, backgroundColor: ['#185FA5', '#378ADD', '#5DCAA5', '#EF9F27', '#7F77DD', '#D85A30'][index % 6] }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按行业分布 */}
          <div className="card-surface flex h-[320px] min-h-0 flex-col p-4 sm:h-[340px] sm:p-5">
            <div className="mb-4 flex shrink-0 items-center gap-2">
              <BarChart3 className="text-primary-500" size={20} />
              <h2 className="text-base font-medium text-gray-800">按行业分布</h2>
            </div>
            <div className="stats-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {byIndustry.map(([industry, count], index) => (
                <div key={industry} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 flex-shrink-0 truncate">{industry}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full bar-chart-bar flex items-center justify-end pr-2"
                      style={{ width: `${(count / maxIndustry) * 100}%`, backgroundColor: ['#378ADD', '#5DCAA5', '#EF9F27', '#7F77DD', '#D85A30', '#D4537E'][index % 6] }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 城市排行 */}
          <div className="card-surface flex h-[320px] min-h-0 flex-col p-4 sm:h-[340px] sm:p-5">
            <div className="mb-4 flex shrink-0 items-center gap-2">
              <Trophy className="text-amber-500" size={20} />
              <h2 className="text-base font-medium text-gray-800">城市分布 Top 10</h2>
            </div>
            <div className="stats-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {byCity.map(([city, count], i) => (
                <div key={city} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-600' :
                    i === 1 ? 'bg-gray-200 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 w-16 flex-shrink-0">{city}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full bar-chart-bar flex items-center justify-end pr-2"
                      style={{ width: `${(count / maxCity) * 100}%`, backgroundColor: ['#85B7EB', '#5DCAA5', '#EF9F27', '#7F77DD', '#D85A30', '#D4537E'][i % 6] }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
