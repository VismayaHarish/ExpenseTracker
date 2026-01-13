import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
})

const dynamodb = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.REACT_APP_DYNAMODB_TABLE || 'ExpenseTracker'

class ExpenseService {
  async getExpenses(userId = 'default') {
    try {
      // If AWS credentials are not configured, use localStorage
      if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID) {
        return this.getExpensesFromLocalStorage()
      }

      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false // Sort by timestamp descending
      }

      const result = await dynamodb.query(params).promise()
      return result.Items || []
    } catch (error) {
      console.error('Error fetching expenses:', error)
      // Fallback to localStorage
      return this.getExpensesFromLocalStorage()
    }
  }

  async addExpense(expense, userId = 'default') {
    const newExpense = {
      id: Date.now().toString(),
      userId,
      ...expense,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    try {
      // If AWS credentials are not configured, use localStorage
      if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID) {
        return this.addExpenseToLocalStorage(newExpense)
      }

      const params = {
        TableName: TABLE_NAME,
        Item: newExpense
      }

      await dynamodb.put(params).promise()
      return newExpense
    } catch (error) {
      console.error('Error adding expense:', error)
      // Fallback to localStorage
      return this.addExpenseToLocalStorage(newExpense)
    }
  }

  async updateExpense(expense, userId = 'default') {
    try {
      // If AWS credentials are not configured, use localStorage
      if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID) {
        return this.updateExpenseInLocalStorage(expense)
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          userId,
          id: expense.id
        },
        UpdateExpression: 'SET amount = :amount, category = :category, #date = :date, description = :description, paymentMethod = :paymentMethod, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#date': 'date'
        },
        ExpressionAttributeValues: {
          ':amount': expense.amount,
          ':category': expense.category,
          ':date': expense.date,
          ':description': expense.description,
          ':paymentMethod': expense.paymentMethod,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }

      const result = await dynamodb.update(params).promise()
      return result.Attributes
    } catch (error) {
      console.error('Error updating expense:', error)
      // Fallback to localStorage
      return this.updateExpenseInLocalStorage(expense)
    }
  }

  async deleteExpense(id, userId = 'default') {
    try {
      // If AWS credentials are not configured, use localStorage
      if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID) {
        return this.deleteExpenseFromLocalStorage(id)
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          userId,
          id
        }
      }

      await dynamodb.delete(params).promise()
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      // Fallback to localStorage
      return this.deleteExpenseFromLocalStorage(id)
    }
  }

  // LocalStorage fallback methods
  getExpensesFromLocalStorage() {
    const expenses = localStorage.getItem('expenses')
    return expenses ? JSON.parse(expenses) : []
  }

  addExpenseToLocalStorage(expense) {
    const expenses = this.getExpensesFromLocalStorage()
    expenses.unshift(expense)
    localStorage.setItem('expenses', JSON.stringify(expenses))
    return expense
  }

  updateExpenseInLocalStorage(updatedExpense) {
    const expenses = this.getExpensesFromLocalStorage()
    const index = expenses.findIndex(expense => expense.id === updatedExpense.id)
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedExpense, updatedAt: new Date().toISOString() }
      localStorage.setItem('expenses', JSON.stringify(expenses))
      return expenses[index]
    }
    throw new Error('Expense not found')
  }

  deleteExpenseFromLocalStorage(id) {
    const expenses = this.getExpensesFromLocalStorage()
    const filteredExpenses = expenses.filter(expense => expense.id !== id)
    localStorage.setItem('expenses', JSON.stringify(filteredExpenses))
    return true
  }
}

export const expenseService = new ExpenseService()