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
        return { year: Number(year), degree: degree || '研究生', students: [...list].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN')) }
      })
  }, [students])

  // 导出CSV
  const handleExport = () => {
    const headers = ['姓名', '性别', '民族', '籍贯城市', '入学年份', '毕业年份', '状态', '专业', '工作单位', '行业', '工作城市', '岗位', '手机号', '邮箱', '简介']
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
    <section className="card-surface overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">
          学生花名册
          <span className="text-xs font-normal text-gray-400 ml-2">共 {students.length} 人 · 按入学年级倒序</span>
        </h2>
        <div className="flex items-center gap-3">
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Download size={16} />
              导出CSV
            </button>
          )}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5" aria-label="切换列表视图">
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
        <div key={`${group.year}-${group.degree}`} className="py-4">
          <div className="flex items-center gap-3 px-5 mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {group.year}级{group.degree}
            </h3>
            <span className="text-xs text-gray-400">{group.students.length} 人 · 全量展示</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5">
              {group.students.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => onStudentClick(student)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto mx-5 border border-gray-200 rounded-lg">
              <table className="w-full min-w-[960px] roster-table table-fixed">
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>专业</th>
                    <th>籍贯城市</th>
                    <th>工作城市</th>
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
                      <td className="font-medium text-primary-600" title={student.name}>{student.name || '—'}</td>
                      <td title={student.major}>{student.major || '—'}</td>
                      <td title={student.hometown}>{student.hometown || '—'}</td>
                      <td title={student.city}>{student.city || '—'}</td>
                      <td title={student.industry}>{student.industry || '—'}</td>
                      <td title={student.position}>{student.position || '—'}</td>
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
    </section>
  )
}
