import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { loadMemoryPhotos } from '../utils/memoryPhotos.js'

const PHOTO_SLOTS = 3
const PALETTES = [
  'from-[#dbeafa] via-[#c9def2] to-[#8aaccb]',
  'from-[#e6edf5] via-[#d8e5f2] to-[#9bb8d2]',
  'from-[#d7e8f8] via-[#c5dcef] to-[#789cbe]',
]

/**
 * 同门记忆页
 * 根据当前名录中的入学年份生成各届毕业合照展示位，后续可直接替换为真实照片资源。
 */
export default function MemoriesPage() {
  const navigate = useNavigate()
  const { students } = useAuth()
  const [selected, setSelected] = useState(null)
  const [uploadedPhotos, setUploadedPhotos] = useState([])

  useEffect(() => {
    let active = true
    loadMemoryPhotos().then(photos => {
      if (active) setUploadedPhotos(Array.isArray(photos) ? photos : [])
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const cohorts = useMemo(() => (
    [...new Set([
      ...(students || []).map(student => student.enrollYear),
      ...(uploadedPhotos || []).map(photo => photo.year),
    ].filter(Boolean).map(String))]
      .sort((a, b) => Number(b) - Number(a))
  ), [students, uploadedPhotos])

  const photos = useMemo(() => cohorts.flatMap(year => (
    (() => {
      const realPhotos = (uploadedPhotos || [])
        .filter(photo => String(photo.year) === String(year))
        .map((photo, index) => ({
          ...photo,
          year: String(year),
          index,
          palette: photo.palette || PALETTES[index % PALETTES.length],
          isPlaceholder: false,
        }))
      if (realPhotos.length > 0) return realPhotos
      return Array.from({ length: PHOTO_SLOTS }, (_, index) => ({
        year,
        index,
        palette: PALETTES[index % PALETTES.length],
        isPlaceholder: true,
      }))
    })()
  )), [cohorts, uploadedPhotos])

  useEffect(() => {
    const previousTitle = document.title
    document.title = '同门记忆 · 同门星图'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    if (!selected) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelected(null)
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const offset = event.key === 'ArrowLeft' ? -1 : 1
      const selectedKey = selected.id || `${selected.year}-${selected.index}`
      const nextIndex = photos.findIndex(photo => (photo.id || `${photo.year}-${photo.index}`) === selectedKey) + offset
      if (nextIndex >= 0 && nextIndex < photos.length) setSelected(photos[nextIndex])
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [photos, selected])

  const selectedIndex = selected ? photos.findIndex(photo => (photo.id || `${photo.year}-${photo.index}`) === (selected.id || `${selected.year}-${selected.index}`)) : -1
  const selectedPhoto = selectedIndex >= 0 ? photos[selectedIndex] : null

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <ArrowLeft size={16} />返回名录
        </button>

        <section className="card-surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
                <Images size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-medium text-gray-900">同门记忆</h1>
                <p className="mt-0.5 text-xs text-gray-400">记录每一届同门的毕业合照</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">共 {photos.length} 张照片 · 覆盖 {cohorts.length} 个毕业届次</span>
          </div>

          <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-xs text-gray-400 sm:px-6">
            <span>星光名录</span><span className="mx-2 text-gray-300">/</span><span className="text-primary-600">同门记忆</span>
          </div>

          <div className="space-y-8 p-4 sm:p-6">
            {cohorts.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">暂无毕业合照记录</div>
            )}
            {cohorts.map(year => {
              const cohortPhotos = photos.filter(photo => photo.year === year)
              return (
                <section key={year}>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h2 className="text-base font-semibold text-gray-900">{year}届 · 毕业合照</h2>
                    <span className="text-xs text-gray-400">{cohortPhotos.length} 张</span>
                  </div>
                  <div className="min-w-0 overflow-x-auto pb-2 md:overflow-visible">
                    <div className="grid auto-cols-[188px] grid-flow-col gap-3 md:grid-flow-row md:grid-cols-3 md:auto-cols-auto lg:grid-cols-4">
                      {cohortPhotos.map(photo => (
                        <button
                          type="button"
                          key={photo.id || `${photo.year}-${photo.index}`}
                          onClick={() => setSelected(photo)}
                          className="group relative aspect-[4/3] min-w-0 overflow-hidden rounded-xl border border-primary-100 bg-gradient-to-br text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                          aria-label={`查看${photo.year}届毕业合照，第${photo.index + 1}张`}
                        >
                          {photo.src ? (
                            <img src={photo.src} alt={photo.label || `${photo.year}届毕业合照`} className="absolute inset-0 h-full w-full object-cover" />
                          ) : (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-br ${photo.palette}`} />
                              <div className="absolute inset-0 flex items-center justify-center text-primary-700/55 transition group-hover:text-primary-800/75">
                                <div className="text-center">
                                  <Images className="mx-auto mb-2" size={28} strokeWidth={1.5} aria-hidden="true" />
                                  <span className="text-base tracking-[0.35em]">毕业合照</span>
                                </div>
                              </div>
                            </>
                          )}
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-primary-700/60 px-2.5 py-1 text-[11px] font-medium text-white">{photo.index + 1} / {cohortPhotos.length}</span>
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-900/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white">{photo.label || `${photo.year}届毕业合照`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-5xl" role="dialog" aria-modal="true" aria-label={`${selectedPhoto.year}届毕业合照`} onClick={event => event.stopPropagation()}>
            <button type="button" onClick={() => setSelected(null)} aria-label="关闭照片预览" className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"><X size={18} /></button>
            <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${selectedPhoto.palette}`}>
              {selectedPhoto.src ? (
                <img src={selectedPhoto.src} alt={selectedPhoto.label || `${selectedPhoto.year}届毕业合照`} className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-primary-900/65">
                  <Images className="mx-auto mb-3" size={52} strokeWidth={1.25} aria-hidden="true" />
                  <p className="text-2xl tracking-[0.45em]">毕业合照</p>
                  <p className="mt-2 text-sm tracking-normal">{selectedPhoto.year}届 · 第 {selectedPhoto.index + 1} 张</p>
                </div>
              )}
              {selectedIndex > 0 && <button type="button" onClick={() => setSelected(photos[selectedIndex - 1])} aria-label="上一张照片" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-primary-800 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"><ChevronLeft size={20} /></button>}
              {selectedIndex < photos.length - 1 && <button type="button" onClick={() => setSelected(photos[selectedIndex + 1])} aria-label="下一张照片" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-primary-800 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"><ChevronRight size={20} /></button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
