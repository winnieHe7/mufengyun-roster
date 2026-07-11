import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Trophy } from 'lucide-react'
import Header from '../components/Header.jsx'
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

  // 按城市统计（Top 10）
  const byCity = useMemo(() => {
    const map = {}
    students.forEach(s => {
      if (s.city) map[s.city] = (map[s.city] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [students])

  const maxYear = Math.max(...byYear.map(([, v]) => v), 1)
  const maxIndustry = Math.max(...byIndustry.map(([, v]) => v), 1)
  const maxCity = Math.max(...byCity.map(([, v]) => v), 1)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 mb-4"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">数据统计分析</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 按届别分布 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-primary-500" size={20} />
              <h2 className="text-base font-semibold text-gray-800">按入学年级分布</h2>
            </div>
            <div className="space-y-2">
              {byYear.map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 flex-shrink-0">{year}级</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="gradient-header h-6 rounded-full bar-chart-bar flex items-center justify-end pr-2"
                      style={{ width: `${(count / maxYear) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按行业分布 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-primary-500" size={20} />
              <h2 className="text-base font-semibold text-gray-800">按行业分布</h2>
            </div>
            <div className="space-y-2">
              {byIndustry.map(([industry, count]) => (
                <div key={industry} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 flex-shrink-0 truncate">{industry}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-6 rounded-full bar-chart-bar flex items-center justify-end pr-2"
                      style={{ width: `${(count / maxIndustry) * 100}%`, backgroundColor: '#537590' }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 城市排行 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-amber-500" size={20} />
              <h2 className="text-base font-semibold text-gray-800">城市分布 Top 10</h2>
            </div>
            <div className="space-y-2">
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
                      style={{ width: `${(count / maxCity) * 100}%`, backgroundColor: '#7e98ac' }}
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
