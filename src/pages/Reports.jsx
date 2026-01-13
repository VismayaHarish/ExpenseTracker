import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, DollarSign } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns'

const Reports = () => {
  const { expenses, categories, currency } = useExpense()
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1']

  const filteredExpenses = useMemo(() => {
    const now = new Date()
    let startDate, endDate

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case '3months':
        startDate = startOfMonth(subMonths(now, 2))
        endDate = endOfMonth(now)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        return expenses
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return isWithinInterval(expenseDate, { start: startDate, end: endDate })
    })
  }, [expenses, selectedPeriod])

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    
    filteredExpenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.category)
      const categoryName = category ? category.name : 'Others'
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0
      }
      categoryTotals[categoryName] += parseFloat(expense.amount)
    })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
  }, [filteredExpenses, categories])

  const monthlyData = useMemo(() => {
    const monthlyTotals = {}
    
    filteredExpenses.forEach(expense => {
      const month = format(new Date(expense.date), 'MMM yyyy')
      
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0
      }
      monthlyTotals[month] += parseFloat(expense.amount)
    })

    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
  }, [filteredExpenses])

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  const averageExpense = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0
  const highestExpense = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => parseFloat(e.amount))) : 0

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'year', label: 'This Year' }
  ]

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          {periods.map(period => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <DollarSign className="mx-auto mb-2 text-blue-600" size={24} />
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Total</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {currency}{totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Average</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {currency}{averageExpense.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <Calendar className="mx-auto mb-2 text-red-600" size={24} />
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Highest</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {currency}{highestExpense.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Category Breakdown - Pie Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Expenses by Category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${currency}${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Trend - Bar Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Monthly Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${currency}${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Category Breakdown
        </h2>
        <div className="space-y-3">
          {categoryData.map((category, index) => {
            const percentage = totalAmount > 0 ? (category.value / totalAmount) * 100 : 0
            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{currency}{category.value}</div>
                  <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No expenses found for the selected period
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports