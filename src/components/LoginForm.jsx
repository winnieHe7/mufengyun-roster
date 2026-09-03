import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { teamInfo } from '../data/siteInfo.js'
import Header from './Header.jsx'

/**
 * 登录表单组件
 * 账号由管理员统一分发，无自主注册
 */
export default function LoginForm() {
  const { login, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(phone, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-warm-50 px-4 py-10">
        {/* 左侧品牌面板（大屏） */}
        <div className="hidden">
          {/* 云纹装饰 */}
          <svg
            className="absolute -right-16 -top-10 w-96 h-96 opacity-10 pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <path
              d="M52 128a28 28 0 0 1 4-55.5 38 38 0 0 1 73-9 30 30 0 0 1 8 59"
              stroke="#c9a96e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="70" cy="70" r="10" fill="#c9a96e" />
            <circle cx="120" cy="58" r="7" fill="#c9a96e" />
            <circle cx="150" cy="90" r="12" fill="#c9a96e" />
          </svg>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold mb-6">
              牟
            </div>
            <h1 className="text-3xl font-bold mb-3">{teamInfo.name}</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-10 bg-accent-400" />
              <span className="text-sm tracking-widest text-accent-400">{teamInfo.slogan}</span>
              <div className="h-px w-10 bg-accent-400" />
            </div>
            <p className="text-gray-300 leading-relaxed max-w-sm">
              牟凤云团队花名册，汇聚历届师友的求学与成长足迹。支持多维度筛选、可视化统计与数据导出，欢迎登录查看。
            </p>
          </div>
        </div>

        {/* 右侧表单 */}
        <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 mb-4">
              <ArrowLeft size={16} />
              返回首页
            </Link>

            {/* 移动端品牌条 */}
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl gradient-header flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                牟
              </div>
              <h1 className="text-lg font-bold text-primary-500">{teamInfo.name}</h1>
            </div>

            <div className="card-surface border border-gray-100 p-6 shadow-soft-xl sm:p-8">
              <div className="text-center mb-6">
                <div className="flex w-14 h-14 rounded-xl gradient-header items-center justify-center text-white mx-auto mb-3">
                  <LogIn size={28} />
                </div>
                <h2 className="text-xl font-bold text-primary-500">登录花名册</h2>
                <p className="text-sm text-gray-400 mt-1">账号由管理员统一分发</p>
              </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">账号 / 手机号</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="请输入账号或手机号"
                  required
                  className="w-full px-4 py-2.5 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="w-full px-4 py-2.5 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-6 p-3 bg-accent-50 rounded-lg text-xs text-accent-600 text-center">
              账号由管理员统一创建分发，如需账号请联系管理员
            </div>

            {!isSupabaseConfigured && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-600">
                演示管理员账号：admin / admin123
              </div>
            )}
          </div>
        </div>
    </div>
    </div>
  )
}
