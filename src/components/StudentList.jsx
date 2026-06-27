import { useMemo } from 'react'
import StudentCard from './StudentCard.jsx'
import { Table, LayoutGrid, Download } from 'lucide-react'

/**
 * 学生列表组件
 * 按入学年级 + 学历层次分组展示，支持卡片/表格两种视图
 * @param {Object} props
 * @param {Array} props.students - 学生数组
 * @param {Function} props.onStudentClick - 点击学生回调
 * @param {string} props.viewMode - 视图模式：'card' | 'table'
 * @param {Function} props.onViewModeChange - 视图切换回调
 * @param {boolean} props.canExport - 是否可导出
 */
export default function StudentList({ students, onStudentClick, viewMode, onViewModeChange, canExport }) {
  // 按入学年级 + 学历层次分组（降序）
  const grouped = useMemo(() => {
    const map = {}
    students.forEach(s => {
      const key = `${s.enrollYear}-${s.degree || '硕士研究生'}`
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return Object.entries(map)
      .sort((a, b) => {
        const [yearA, degreeA] = a[0].split('-')
        const [yearB, degreeB] = b[0].split('-')
        // 先按年份降序
        if (Number(yearB) !== Number(yearA)) return Number(yearB) - Number(yearA)
        // 再按学历层次排序：博士研究生 > 硕士研究生 > 本科生
        const degreeOrder = { '博士研究生': 0, '硕士研究生': 1, '本科生': 2 }
        return (degreeOrder[degreeA] ?? 9) - (degreeOrder[degreeB] ?? 9)
      })
      .map(([key, list]) => {
        const [year, degree] = key.split('-')
        return { year: Number(year), degree: degree || '研究生', students: list }
      })
  }, [students])

  // 导出CSV
  const handleExport = () => {
    const headers = ['姓名', '性别', '民族', '籍贯', '入学年份', '毕业年份', '状态', '专业', '工作单位', '行业', '城市', '岗位', '手机号', '邮箱', '简介']
    const rows = students.map(s => [
      s.name, s.gender, s.ethnicity, s.hometown, s.enrollYear, s.graduateYear, s.status,
      s.major, s.company, s.industry, s.city, s.position, s.phone, s.email, s.bio,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
    const csv = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `花名册_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">暂无符合条件的学生记录</p>
        <p className="text-sm mt-2">请尝试调整筛选条件</p>
      </div>
    )
  }

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          学生花名册列表
          <span className="text-sm font-normal text-gray-400 ml-2">（按毕业届别分组）</span>
        </h2>
        <div className="flex items-center gap-3">
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Download size={16} />
              导出CSV
            </button>
          )}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}
              title="卡片视图"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}
              title="表格视图"
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 分组展示 */}
      {grouped.map(group => (
        <div key={`${group.year}-${group.degree}`} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-gray-700">
              {group.year}级{group.degree}
            </h3>
            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
              共{group.students.length}人
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {group.students.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => onStudentClick(student)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="w-full roster-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>专业</th>
                    <th>籍贯</th>
                    <th>城市</th>
                    <th>行业</th>
                    <th>岗位</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => onStudentClick(student)}
                      className="cursor-pointer"
                    >
                      <td className="font-medium text-primary-600">{student.name}</td>
                      <td>{student.major}</td>
                      <td>{student.hometown}</td>
                      <td>{student.city}</td>
                      <td>{student.industry}</td>
                      <td>{student.position}</td>
                      <td>
                        <span className={`status-tag ${student.status === '已毕业' ? 'status-tag-graduated' : 'status-tag-active'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
