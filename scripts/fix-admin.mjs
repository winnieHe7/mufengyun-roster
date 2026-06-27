/**
 * 插入管理员账号到 Supabase
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const __root = resolve(__dirname, '..')

const envContent = readFileSync(resolve(__root, '.env'), 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function main() {
  // 先查有没有 admin
  const { data: existing } = await supabase
    .from('accounts')
    .select('*')
    .eq('phone', 'admin')
  
  if (existing && existing.length > 0) {
    // 更新密码
    const { error } = await supabase
      .from('accounts')
      .update({ password: 'admin123', role: 'admin', name: '管理员' })
      .eq('phone', 'admin')
    console.log(error ? '❌ 更新失败: ' + error.message : '✅ 管理员密码已重置为 admin123')
  } else {
    // 插入新管理员
    const { error } = await supabase
      .from('accounts')
      .insert({ name: '管理员', phone: 'admin', password: 'admin123', role: 'admin' })
    console.log(error ? '❌ 插入失败: ' + error.message : '✅ 管理员账号已创建')
  }

  // 验证
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('phone', 'admin')
    .eq('password', 'admin123')
    .single()
  
  if (error || !data) {
    console.log('❌ 验证失败：查不到 admin 账号')
  } else {
    console.log('✅ 验证成功：admin / admin123 可用')
    console.log('   账号信息:', { id: data.id, name: data.name, role: data.role })
  }
}

main()
