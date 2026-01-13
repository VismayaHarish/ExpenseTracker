import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, BarChart3, Settings } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const { theme } = useExpense()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: Plus, label: 'Add' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen shadow-lg">
        <main className="pb-16">
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Layout