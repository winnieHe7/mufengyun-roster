import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 客户端
 * 
 * 部署前需要配置环境变量：
 * - VITE_SUPABASE_URL: Supabase 项目 URL
 * - VITE_SUPABASE_ANON_KEY: Supabase 匿名密钥
 * 
 * 在 Vercel 部署时，在项目设置 > Environment Variables 中配置
 * 本地开发时，在项目根目录创建 .env 文件
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 如果未配置环境变量，打印警告（不阻止运行，降级到 localStorage）
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase 环境变量未配置！当前将使用 localStorage 降级模式。\n' +
    '请在 .env 文件或 Vercel 环境变量中设置:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key'
  )
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
