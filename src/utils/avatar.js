export function createInitialAvatar(name = '同学', size = 128) {
  const initial = String(name).trim().slice(0, 1) || '同'
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.43)
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><rect width="100%" height="100%" rx="' + radius + '" fill="#e6f1fb"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="' + fontSize + '" font-weight="600" fill="#185fa5">' + initial + '</text></svg>'
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

export function handleAvatarError(event, name, size = 128) {
  event.currentTarget.onerror = null
  event.currentTarget.src = createInitialAvatar(name, size)
}

export function getStableAvatarSource(source) {
  if (!source) return ''
  const value = String(source).trim()
  if (
    value.startsWith('/') ||
    value.startsWith('data:image/') ||
    value.startsWith('blob:') ||
    /^https:\/\/[^/]+\.supabase\.co\//i.test(value)
  ) return value
  return ''
}
