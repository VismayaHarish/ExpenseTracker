import React, { useState } from 'react'
import { Moon, Sun, DollarSign, Target, Download, Upload, Trash2 } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'

const Settings = () => {
  const { currency, theme, budget, updateSettings, expenses, loadExpenses } = useExpense()
  const [localBudget, setLocalBudget] = useState(budget)
  const [showBudgetInput, setShowBudgetInput] = useState(false)

  const currencies = [
    { value: '₹', label: '₹ Indian Rupee' },
    { value: '$', label: '$ US Dollar' },
    { value: '€', label: '€ Euro' },
    { value: '£', label: '£ British Pound' },
    { value: '¥', label: '¥ Japanese Yen' }
  ]

  const handleCurrencyChange = (newCurrency) => {
    updateSettings({ currency: newCurrency })
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    updateSettings({ theme: newTheme })
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleBudgetSave = () => {
    updateSettings({ budget: parseFloat(localBudget) || 0 })
    setShowBudgetInput(false)
  }

  const exportData = () => {
    const data = {
      expenses,
      settings: { currency, theme, budget },
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.expenses && Array.isArray(data.expenses)) {
          // Store imported expenses in localStorage
          localStorage.setItem('expenses', JSON.stringify(data.expenses))
          
          if (data.settings) {
            updateSettings(data.settings)
          }
          
          // Reload expenses
          loadExpenses()
          
          alert('Data imported successfully!')
        } else {
          alert('Invalid backup file format')
        }
      } catch (error) {
        alert('Error importing data: ' + error.message)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      localStorage.removeItem('expenses')
      localStorage.removeItem('expenseSettings')
      loadExpenses()
      updateSettings({ budget: 0, currency: '₹', theme: 'light' })
      alert('All data cleared successfully!')
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

      <div className="space-y-4">
        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Currency</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {currencies.map(curr => (
              <button
                key={curr.value}
                onClick={() => handleCurrencyChange(curr.value)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  currency === curr.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {curr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Target className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Budget</h2>
            </div>
            <button
              onClick={() => setShowBudgetInput(!showBudgetInput)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {budget > 0 ? 'Edit' : 'Set Budget'}
            </button>
          </div>
          
          {budget > 0 && !showBudgetInput && (
            <p className="text-gray-600 dark:text-gray-400">
              Current budget: <span className="font-bold">{currency}{budget}</span>
            </p>
          )}
          
          {showBudgetInput && (
            <div className="flex gap-2">
              <input
                type="number"
                value={localBudget}
                onChange={(e) => setLocalBudget(e.target.value)}
                placeholder="Enter monthly budget"
                className="flex-1 p-2 border border-gray-300 rounded-lg bg-transparent"
              />
              <button
                onClick={handleBudgetSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowBudgetInput(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="text-yellow-600" size={20} />
              ) : (
                <Moon className="text-blue-600" size={20} />
              )}
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Theme</h2>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Current theme: {theme === 'light' ? 'Light' : 'Dark'}
          </p>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Data Management</h2>
          
          <div className="space-y-3">
            {/* Export Data */}
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="text-blue-600" size={20} />
              <div className="text-left">
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Download your expenses as JSON backup
                </div>
              </div>
            </button>

            {/* Import Data */}
            <label className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <Upload className="text-green-600" size={20} />
              <div className="text-left">
                <div className="font-medium">Import Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Restore from JSON backup file
                </div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>

            {/* Clear All Data */}
            <button
              onClick={clearAllData}
              className="w-full flex items-center gap-3 p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={20} />
              <div className="text-left">
                <div className="font-medium">Clear All Data</div>
                <div className="text-sm text-red-500">
                  Delete all expenses and settings
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">About</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Expense Tracker v1.0.0
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Built with React and AWS services
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Total expenses recorded: <span className="font-medium">{expenses.length}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings