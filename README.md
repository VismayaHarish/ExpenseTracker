# 💰 Expense Tracker

A complete expense tracking application built with React and AWS services. Track your daily expenses, analyze spending patterns, and manage your budget effectively.

## ✨ Features

### 📱 User Interface
- **Modern Dashboard** - Clean, responsive design optimized for mobile
- **Expense Management** - Add, edit, and delete expenses with ease
- **Smart Navigation** - Bottom navigation for mobile-first experience
- **Dark/Light Theme** - Toggle between themes for comfortable viewing

### 💳 Expense Management
- **Quick Entry** - Add expenses with amount, category, date, and description
- **Payment Methods** - Track Cash, UPI, Card, and Bank transfers
- **Categories** - 9 predefined categories with emoji icons:
  - 🍔 Food
  - 🚗 Transport  
  - 🏠 Rent
  - 🛍️ Shopping
  - 🎮 Entertainment
  - 💡 Bills
  - 💊 Health
  - 🎓 Education
  - 📝 Others

### 📊 Analytics & Reports
- **Visual Charts** - Pie charts and bar graphs using Recharts
- **Category Breakdown** - See spending by category with percentages
- **Time Filters** - View expenses by week, month, quarter, or year
- **Spending Trends** - Monthly spending analysis
- **Summary Stats** - Total, average, and highest expenses

### 🎯 Budget Management
- **Monthly Budgets** - Set and track monthly spending limits
- **Budget Alerts** - Visual indicators when approaching or exceeding budget
- **Progress Tracking** - Real-time budget utilization display

### 🔍 Search & Filter
- **Smart Search** - Find expenses by description or category
- **Category Filter** - Filter by specific expense categories
- **Date Range Filter** - View expenses for specific time periods
- **Real-time Results** - Instant filtering as you type

### ⚙️ Settings & Data
- **Multi-Currency** - Support for ₹, $, €, £, ¥
- **Data Export/Import** - Backup and restore your data as JSON
- **Local Storage** - Works offline with browser storage
- **AWS Integration** - Optional cloud sync with DynamoDB

## 🏗️ Architecture

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Clean, consistent icons
- **Date-fns** - Modern date utility library

### Backend (AWS)
- **DynamoDB** - NoSQL database for expense storage
- **S3** - Static website hosting
- **CloudFront** - Global CDN for fast delivery
- **Cognito** - Identity management (optional)
- **CloudFormation** - Infrastructure as Code

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- AWS CLI (for cloud deployment)
- AWS Account (optional - app works locally)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

The app works immediately with localStorage - no AWS setup required for local development!

### AWS Cloud Deployment

1. **Configure AWS CLI**
   ```bash
   aws configure
   ```

2. **Deploy Infrastructure**
   ```bash
   cd aws
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access Your App**
   The deployment script will provide your CloudFront URL.

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.jsx       # App layout with navigation
│   ├── context/             # React Context for state management
│   │   └── ExpenseContext.jsx
│   ├── pages/               # Main application pages
│   │   ├── Dashboard.jsx    # Home screen with expense list
│   │   ├── AddExpense.jsx   # Add/edit expense form
│   │   ├── Reports.jsx      # Analytics and charts
│   │   └── Settings.jsx     # App configuration
│   ├── services/            # External service integrations
│   │   └── expenseService.js # AWS DynamoDB + localStorage
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── aws/                     # AWS infrastructure
│   ├── cloudformation.yaml  # Infrastructure template
│   └── deploy.sh           # Deployment script
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create `.env` file (optional):
```env
# AWS Configuration (optional)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_DYNAMODB_TABLE=ExpenseTracker
REACT_APP_IDENTITY_POOL_ID=your_identity_pool_id

# For development only (use Cognito in production)
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key
```

### AWS Resources Created
- **DynamoDB Table** - Stores expense data
- **S3 Bucket** - Hosts the web application  
- **CloudFront Distribution** - CDN for global delivery
- **Cognito Identity Pool** - Manages user authentication
- **IAM Roles** - Secure access permissions

## 📱 Mobile Experience

The app is designed mobile-first with:
- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly** - Large buttons and touch targets
- **Bottom Navigation** - Easy thumb navigation
- **Fast Loading** - Optimized for mobile networks
- **Offline Support** - Works without internet connection

## 🔒 Security

- **No Personal Data** - Only expense amounts and categories stored
- **Local Storage** - Data stays on your device by default
- **AWS Security** - Industry-standard cloud security when using AWS
- **No Authentication Required** - Simple, privacy-focused design

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to AWS S3

### Adding Features
The app is built with extensibility in mind:
- Add new categories in `ExpenseContext.jsx`
- Create new pages in `src/pages/`
- Extend charts in `Reports.jsx`
- Add new themes in `Settings.jsx`

## 📊 Data Storage

### Local Storage (Default)
- Expenses stored in browser localStorage
- Settings saved locally
- Works offline
- No setup required

### AWS DynamoDB (Optional)
- Cloud storage for multi-device sync
- Automatic backups
- Scalable and reliable
- Requires AWS setup

## 🎨 Customization

### Themes
- Light and dark themes included
- Easy to add new themes in Tailwind config
- System theme detection

### Categories
- Easily add new expense categories
- Custom icons and colors
- Flexible category system

### Currency
- Multiple currency support
- Easy to add new currencies
- Localized formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- Check the Issues tab for common problems
- Review AWS documentation for cloud setup
- Ensure AWS credentials are properly configured
- Verify Node.js version compatibility

---

Built with ❤️ using React and AWS