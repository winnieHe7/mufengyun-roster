import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
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
    <div className="min-h-screen bg-warm-100">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 mb-6">
            <ArrowLeft size={16} />
            返回首页
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl gradient-header flex items-center justify-center text-white mx-auto mb-3">
                <LogIn size={28} />
              </div>
              <h1 className="text-xl font-bold text-primary-500">登录花名册</h1>
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
                  className="w-full px-4 py-2.5 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
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
                  className="w-full px-4 py-2.5 bg-warm-100 border border-warm-200 rounded-lg text-sm focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
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
