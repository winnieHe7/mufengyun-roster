import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import StatCards from '../components/StatCards.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StudentList from '../components/StudentList.jsx'
import StudentDetail from '../components/StudentDetail.jsx'
import HeroSection from '../components/HeroSection.jsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const EMPTY_FILTERS = { year: '', degree: '', city: '', industry: '', status: '' }
const DEGREE_ORDER = { '博士研究生': 0, '硕士研究生': 1, '本科生': 2 }
const compareStudentsForRoster = (a, b) => {
  const yearDiff = Number(b.enrollYear || 0) - Number(a.enrollYear || 0)
  if (yearDiff !== 0) return yearDiff
  const degreeDiff = (DEGREE_ORDER[a.degree || '硕士研究生'] ?? 9) - (DEGREE_ORDER[b.degree || '硕士研究生'] ?? 9)
  if (degreeDiff !== 0) return degreeDiff
  return (a.name || '').localeCompare(b.name || '', 'zh-CN')
}

/**
 * 首页组件
 * 整合搜索、统计卡片、筛选、花名册列表、详情弹窗
 */
export default function HomePage() {
  const { students, isAdmin, currentUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '')
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState('card')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // 提取筛选项
  const { years, degrees, cities, industries } = useMemo(() => {
    const yearSet = new Set()
    const degreeSet = new Set()
    const citySet = new Set()
    const industrySet = new Set()
    students.forEach(s => {
      if (s.enrollYear) yearSet.add(s.enrollYear)
      if (s.degree) degreeSet.add(s.degree)
      if (s.city) citySet.add(s.city)
      if (s.industry) industrySet.add(s.industry)
    })
    return {
      years: [...yearSet].sort((a, b) => b - a),
      degrees: [...degreeSet],
      cities: [...citySet].sort(),
      industries: [...industrySet].sort(),
    }
  }, [students])

  // 过滤学生
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // 搜索
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const haystack = [s.name, s.major, s.city, s.company, s.industry, s.hometown, String(s.enrollYear), String(s.graduateYear)]
          .join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      // 筛选
      if (appliedFilters.year && String(s.enrollYear) !== String(appliedFilters.year)) return false
      if (appliedFilters.degree && s.degree !== appliedFilters.degree) return false
      if (appliedFilters.city && s.city !== appliedFilters.city) return false
      if (appliedFilters.industry && s.industry !== appliedFilters.industry) return false
      if (appliedFilters.status && s.status !== appliedFilters.status) return false
      return true
    }).sort(compareStudentsForRoster)
  }, [students, searchQuery, appliedFilters])

  // 统计数据
  const stats = useMemo(() => ({
    total: filteredStudents.length,
    graduates: filteredStudents.filter(s => s.status === '已毕业').length,
    active: filteredStudents.filter(s => s.status === '在读').length,
    cities: new Set(filteredStudents.map(s => s.city).filter(Boolean)).size,
  }), [filteredStudents])

  // 筛选操作
  const handleFilterChange = (key, value) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }))
  }
  const handleConfirm = () => {
    setAppliedFilters({ ...draftFilters })
  }
  const handleReset = () => {
    setDraftFilters({ ...EMPTY_FILTERS })
    setAppliedFilters({ ...EMPTY_FILTERS })
    setSearchQuery('')
  }

  // 详情弹窗导航
  const handleStudentClick = (student) => {
    const idx = filteredStudents.findIndex(s => s.id === student.id)
    setSelectedIndex(idx)
    setSelectedStudent(student)
  }
  const handlePrev = () => {
    if (selectedIndex > 0) {
      const newIdx = selectedIndex - 1
      setSelectedIndex(newIdx)
      setSelectedStudent(filteredStudents[newIdx])
    }
  }
  const handleNext = () => {
    if (selectedIndex < filteredStudents.length - 1) {
      const newIdx = selectedIndex + 1
      setSelectedIndex(newIdx)
      setSelectedStudent(filteredStudents[newIdx])
    }
  }

  return (
    <div className="min-h-screen">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* 导师+团队简介 */}
        <HeroSection />

        {/* 统计卡片 */}
        <StatCards
          total={stats.total}
          graduates={stats.graduates}
          active={stats.active}
          cities={stats.cities}
          onViewFullStats={() => navigate('/stats')}
        />

        {/* 筛选栏 */}
        <FilterBar
          filters={draftFilters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onConfirm={handleConfirm}
          years={years}
          degrees={degrees}
          cities={cities}
          industries={industries}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />

        {/* 学生列表 */}
        <StudentList
          students={filteredStudents}
          onStudentClick={handleStudentClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canExport={isAdmin}
        />
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-700">牟凤云团队 · 同门星图</p>
          <p className="text-xs text-gray-400 mt-1">
            账号由管理员统一分发 · 支持多维度筛选、可视化统计、数据导出
          </p>
          <p className="text-xs text-gray-300 mt-2">© 2026 牟凤云团队</p>
        </div>
      </footer>

      {/* 详情弹窗 */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => { setSelectedStudent(null); setSelectedIndex(-1) }}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoPrev={selectedIndex > 0}
          canGoNext={selectedIndex >= 0 && selectedIndex < filteredStudents.length - 1}
        />
      )}
    </div>
  )
}
