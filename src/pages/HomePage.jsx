import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import StatCards from '../components/StatCards.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StudentList from '../components/StudentList.jsx'
import StudentDetail from '../components/StudentDetail.jsx'
import HeroSection from '../components/HeroSection.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * 首页组件
 * 整合搜索、统计卡片、筛选、花名册列表、详情弹窗
 */
export default function HomePage() {
  const { students, isAdmin, currentUser } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ year: '', degree: '', city: '', industry: '', status: '' })
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
      if (filters.year && String(s.enrollYear) !== String(filters.year)) return false
      if (filters.degree && s.degree !== filters.degree) return false
      if (filters.city && s.city !== filters.city) return false
      if (filters.industry && s.industry !== filters.industry) return false
      if (filters.status && s.status !== filters.status) return false
      return true
    })
  }, [students, searchQuery, filters])

  // 统计数据
  const stats = useMemo(() => ({
    total: filteredStudents.length,
    graduates: filteredStudents.filter(s => s.status === '已毕业').length,
    active: filteredStudents.filter(s => s.status === '在读').length,
    cities: new Set(filteredStudents.map(s => s.city).filter(Boolean)).size,
  }), [filteredStudents])

  // 筛选操作
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  const handleReset = () => {
    setFilters({ year: '', degree: '', city: '', industry: '', status: '' })
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onConfirm={() => {}}
          years={years}
          degrees={degrees}
          cities={cities}
          industries={industries}
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
      <footer className="border-t border-warm-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm font-medium text-primary-500">牟凤云团队</p>
          <p className="text-xs text-gray-400 mt-1">
            账号由管理员统一分发 · 支持多维度筛选、可视化统计、数据导出
          </p>
          <p className="text-xs text-gray-300 mt-2">© 2026 牟凤云团队 · 粤ICP备2026001234号</p>
        </div>
      </footer>

      {/* 详情弹窗 */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => { setSelectedStudent(null); setSelectedIndex(-1) }}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
