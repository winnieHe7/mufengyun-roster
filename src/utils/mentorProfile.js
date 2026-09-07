import { mentorInfo as defaultMentorInfo } from '../data/siteInfo.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

export const MENTOR_CONFIG_KEY = 'mentor_info'
const LOCAL_STORAGE_KEY = 'roster_mentor_info'

function mergeMentorInfo(value) {
  return {
    ...defaultMentorInfo,
    ...(value || {}),
    research: Array.isArray(value?.research) ? value.research : defaultMentorInfo.research,
    titles: Array.isArray(value?.titles) ? value.titles : defaultMentorInfo.titles,
    achievements: Array.isArray(value?.achievements) ? value.achievements : defaultMentorInfo.achievements,
    honors: Array.isArray(value?.honors) ? value.honors : defaultMentorInfo.honors,
    experience: Array.isArray(value?.experience) ? value.experience : defaultMentorInfo.experience,
    awards: Array.isArray(value?.awards) ? value.awards : defaultMentorInfo.awards,
    contact: { ...defaultMentorInfo.contact, ...(value?.contact || {}) },
  }
}

function readLocalProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? mergeMentorInfo(JSON.parse(raw)) : mergeMentorInfo()
  } catch {
    return mergeMentorInfo()
  }
}

function writeLocalProfile(profile) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.warn('导师资料本地缓存写入失败:', error)
  }
}

export async function loadMentorInfo() {
  const localProfile = readLocalProfile()
  if (!isSupabaseConfigured) return localProfile
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', MENTOR_CONFIG_KEY)
      .maybeSingle()
    if (!error && data?.value) {
      const profile = mergeMentorInfo(JSON.parse(data.value))
      writeLocalProfile(profile)
      return profile
    }
  } catch (error) {
    console.warn('导师资料远程读取失败:', error)
  }
  return localProfile
}

export async function saveMentorInfo(profile) {
  const normalized = mergeMentorInfo(profile)
  writeLocalProfile(normalized)
  if (!isSupabaseConfigured) return { success: true, remote: false }
  const { error } = await supabase.from('site_config').upsert({
    key: MENTOR_CONFIG_KEY,
    value: JSON.stringify(normalized),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' })
  if (error) return { success: false, remote: false, error }
  return { success: true, remote: true }
}
