import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

const Dashboard = () => {
  const { expenses, categories, currency, deleteExpense, budget } = useExpense()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [editingExpense, setEditingExpense] = useState(null)

  const filteredExpenses = useMemo(() => {
    let filtered = expenses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate, endDate

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          endDate = now
          break
        case 'month':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
      }

      if (startDate && endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return isWithinInterval(expenseDate, { start: startDate, end: endDate })
        })
      }
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, searchTerm, selectedCategory, dateFilter])

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  }, [filteredExpenses])

  const monthlyExpenses = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  }, [expenses])

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.icon : '📝'
  }

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id)
      } catch (error) {
        alert('Failed to delete expense')
      }
    }
  }

  const budgetPercentage = budget > 0 ? (monthlyExpenses / budget) * 100 : 0
  const isOverBudget = budgetPercentage > 100

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Tracker</h1>
        <Link
          to="/add"
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={24} />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {currency}{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">This Month</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {currency}{monthlyExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      {budget > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Monthly Budget</h3>
            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {currency}{(budget - monthlyExpenses).toFixed(2)} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {budgetPercentage.toFixed(1)}% of budget used
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent"
          />
        </div>
        
        <div className="flex gap-2 mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 p-2 border rounded-lg bg-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 p-2 border rounded-lg bg-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
            <Link
              to="/add"
              className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              Add your first expense
            </Link>
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {expense.description || 'No description'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(expense.date), 'MMM dd, yyyy')} • {expense.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-800 dark:text-white">
                    {currency}{parseFloat(expense.amount).toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard