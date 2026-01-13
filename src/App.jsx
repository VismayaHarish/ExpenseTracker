import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ExpenseProvider } from './context/ExpenseContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <ExpenseProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ExpenseProvider>
  )
}

export default App