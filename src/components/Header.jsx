import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LayoutDashboard, LogOut, User, Menu, X, BarChart3, Images } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { createInitialAvatar, getStableAvatarSource, handleAvatarError } from '../utils/avatar.js'

/**
 * 顶部导航栏组件
 * Logo · 统计报表 · 登录 · 个人中心
 */
export default function Header() {
  const { currentUser, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 左侧 Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
              册
            </div>
            <span className="hidden sm:inline text-base font-medium text-gray-900">
              同门星图
            </span>
          </Link>

          {/* 右侧操作区 - 桌面端 */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/memories" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
              <Images size={16} />同门记忆
            </Link>
            <Link to="/stats" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
              <BarChart3 size={16} />统计报表
            </Link>
            {currentUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={getStableAvatarSource(currentUser.avatar) || createInitialAvatar(currentUser.name)}
                      onError={(event) => handleAvatarError(event, currentUser.name)}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-warm-200 py-1 z-20 animate-slide-down">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-warm-100"
                        >
                          <User size={16} />
                          个人中心
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-warm-100"
                          >
                            <LayoutDashboard size={16} />
                            管理后台
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <LogIn size={16} />
                登录
              </Link>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-menu" className="md:hidden pb-3 space-y-2">
            <Link to="/memories" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Images size={16} />同门记忆</Link>
            <Link to="/stats" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">统计报表</Link>
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-warm-100 rounded-lg"
                >
                  个人中心
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-warm-100 rounded-lg"
                  >
                    管理后台
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-white bg-primary-500 rounded-lg text-center"
              >
                登录
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
