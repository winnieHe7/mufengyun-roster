import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

export const MEMORY_STORAGE_KEY = 'roster_memory_photos'
export const MEMORY_CONFIG_KEY = 'memory_photos'

function readLocalPhotos() {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY)
    const value = raw ? JSON.parse(raw) : []
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeLocalPhotos(photos) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(photos))
  } catch (error) {
    console.warn('同门记忆本地缓存写入失败:', error)
  }
}

export async function loadMemoryPhotos() {
  const localPhotos = readLocalPhotos()
  if (!isSupabaseConfigured) return localPhotos

  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', MEMORY_CONFIG_KEY)
      .maybeSingle()
    if (!error && data?.value) {
      const parsed = JSON.parse(data.value)
      if (Array.isArray(parsed)) {
        writeLocalPhotos(parsed)
        return parsed
      }
    }
  } catch (error) {
    console.warn('同门记忆远程数据读取失败:', error)
  }
  return localPhotos
}

export async function saveMemoryPhotos(photos) {
  writeLocalPhotos(photos)
  if (!isSupabaseConfigured) return { success: true, remote: false }

  const { error } = await supabase
    .from('site_config')
    .upsert({
      key: MEMORY_CONFIG_KEY,
      value: JSON.stringify(photos),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })

  if (error) return { success: false, remote: false, error }
  return { success: true, remote: true }
}

export function compressMemoryImage(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('图片解析失败'))
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.86))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
