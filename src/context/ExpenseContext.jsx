import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { expenseService } from '../services/expenseService'

const ExpenseContext = createContext()

const initialState = {
  expenses: [],
  categories: [
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
    { id: 'bills', name: 'Bills', icon: '💡' },
    { id: 'health', name: 'Health', icon: '💊' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'others', name: 'Others', icon: '📝' }
  ],
  budget: 0,
  currency: '₹',
  theme: 'light',
  loading: false,
  error: null
}

function expenseReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, loading: false }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      }
    case 'SET_BUDGET':
      return { ...state, budget: action.payload }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    default:
      return state
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState)

  useEffect(() => {
    loadExpenses()
    loadSettings()
  }, [])

  const loadExpenses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const expenses = await expenseService.getExpenses()
      dispatch({ type: 'SET_EXPENSES', payload: expenses })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('expenseSettings') || '{}')
    if (settings.budget) dispatch({ type: 'SET_BUDGET', payload: settings.budget })
    if (settings.currency) dispatch({ type: 'SET_CURRENCY', payload: settings.currency })
    if (settings.theme) dispatch({ type: 'SET_THEME', payload: settings.theme })
  }

  const addExpense = async (expense) => {
    try {
      const newExpense = await expenseService.addExpense(expense)
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense })
      return newExpense
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateExpense = async (expense) => {
    try {
      const updatedExpense = await expenseService.updateExpense(expense)
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense })
      return updatedExpense
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id)
      dispatch({ type: 'DELETE_EXPENSE', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateSettings = (settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      switch (key) {
        case 'budget':
          dispatch({ type: 'SET_BUDGET', payload: value })
          break
        case 'currency':
          dispatch({ type: 'SET_CURRENCY', payload: value })
          break
        case 'theme':
          dispatch({ type: 'SET_THEME', payload: value })
          break
      }
    })
    
    const currentSettings = JSON.parse(localStorage.getItem('expenseSettings') || '{}')
    localStorage.setItem('expenseSettings', JSON.stringify({ ...currentSettings, ...settings }))
  }

  const value = {
    ...state,
    addExpense,
    updateExpense,
    deleteExpense,
    updateSettings,
    loadExpenses
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpense = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider')
  }
  return context
}