/**
 * 数据导入脚本
 * 将 mockStudents.js 中的数据导入 Supabase
 * 
 * 使用方法：
 * 1. 创建 .env 文件，填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
 * 2. 运行: node scripts/import-data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 读取 .env
const envContent = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请先在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 动态导入 mockStudents（Windows 需要用 file:// URL）
const { pathToFileURL } = await import('url')
const mockPath = pathToFileURL(resolve(__dirname, '../src/data/mockStudents.js')).href
const { default: mockStudents } = await import(mockPath)

console.log(`📝 准备导入 ${mockStudents.length} 条学生数据...`)

// 转换为数据库格式
const dbStudents = mockStudents.map(s => ({
  name: s.name,
  gender: s.gender,
  ethnicity: s.ethnicity || '汉族',
  hometown: s.hometown || '',
  enroll_year: s.enrollYear,
  graduate_year: s.graduateYear,
  status: s.status,
  degree: s.degree || '研究生',
  major: s.major || '',
  company: s.company || '',
  industry: s.industry || '',
  city: s.city || '',
  position: s.position || '',
  phone: s.phone || '',
  email: s.email || '',
  bio: s.bio || '',
}))

// 分批插入（每批 20 条）
const BATCH_SIZE = 20
for (let i = 0; i < dbStudents.length; i += BATCH_SIZE) {
  const batch = dbStudents.slice(i, i + BATCH_SIZE)
  const { error } = await supabase.from('students').insert(batch)
  if (error) {
    console.error(`❌ 批次 ${i / BATCH_SIZE + 1} 插入失败:`, error.message)
  } else {
    console.log(`✅ 批次 ${i / BATCH_SIZE + 1} 插入成功 (${batch.length} 条)`)
  }
}

console.log('\n🎉 数据导入完成！')
console.log('💡 提示：如果数据重复，请先在 Supabase 中清空 students 表再运行')
