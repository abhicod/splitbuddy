# SplitBuddy - Splitwise Clone

A comprehensive expense splitting application built with **Vue.js**, **Express.js**, and **MongoDB**. SplitBuddy allows users to easily track shared expenses, split bills, and manage settlements with friends and groups.

## 🚀 Features

### ✅ **Authentication & User Management**
- Dual authentication system: **Email/Password** and **Google Sign-In**
- Secure password hashing with bcrypt
- JWT-based session management
- Premium, unified Auth UI with glassmorphism design
- Profile management and settings
- Friends system with search functionality

### ✅ **Group Management**
- Create and manage expense groups
- Add/remove members from groups
- Different group categories (Trip, Home, Couple, Other)
- Group-specific currency settings
- Admin and member roles

### ✅ **Expense Tracking**
- Add expenses with detailed information
- Multiple split types:
  - **Equal Split**: Divide equally among participants
  - **Exact Amounts**: Specify exact amounts for each person
  - **Percentage Split**: Split by percentage
- Expense categories (Food, Transport, Accommodation, etc.)
- Receipt and notes support
- Edit and delete expenses

### ✅ **Smart Settlement System**
- Automatic balance calculations
- Simplified settlement suggestions
- Mark payments as settled
- Group and individual balance views
- Settlement history tracking

### ✅ **Modern UI/UX**
- Responsive design with Tailwind CSS
- Intuitive navigation and user experience
- Real-time updates and notifications
- Dashboard with activity summaries
- Comprehensive expense filtering and search

## 🛠️ Technology Stack

### **Frontend**
- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Vue Router** for navigation
- **Pinia** for state management
- **Tailwind CSS** for styling
- **Axios** for API communication

### **Backend**
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Express Validator** for input validation

## 📁 Project Structure

```
splitbuddy/
├── client/                     # Vue.js frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── AddExpenseModal.vue
│   │   │   ├── BalancesView.vue
│   │   │   ├── CreateGroupModal.vue
│   │   │   └── ExpenseItem.vue
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.vue
│   │   │   └── Footer.vue
│   │   ├── pages/             # Page components
│   │   │   ├── Auth/          # Authenticated pages
│   │   │   │   ├── DashboardPage.vue
│   │   │   │   ├── GroupsPage.vue
│   │   │   │   ├── GroupDetailPage.vue
│   │   │   │   ├── FriendsPage.vue
│   │   │   │   └── ExpensesPage.vue
│   │   │   └── UnAuth/        # Public pages
│   │   │       └── AuthPage.vue
│   │   ├── router/            # Vue Router configuration
│   │   ├── services/          # API services
│   │   ├── store/             # Pinia stores
│   │   └── main.js
│   └── package.json
└── server/                     # Express.js backend
    ├── config/                 # Database configuration
    ├── middleware/             # Custom middleware
    ├── models/                 # Mongoose models
    │   ├── User.js
    │   ├── Group.js
    │   ├── Expense.js
    │   └── Settlement.js
    ├── routes/                 # API routes
    │   ├── auth.js
    │   ├── users.js
    │   ├── groups.js
    │   └── expenses.js
    ├── utils/                  # Utility functions
    ├── index.js               # Server entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20.19.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd splitbuddy
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/splitbuddy
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

5. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google Sign-In/Sign-Up
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/search` - Search users
- `POST /api/users/friends/:userId` - Add friend
- `DELETE /api/users/friends/:userId` - Remove friend
- `GET /api/users/friends` - Get user's friends
- `GET /api/users/dashboard` - Get dashboard data

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/leave` - Leave group
- `PUT /api/groups/:groupId` - Update group

### Expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/group/:groupId` - Get group expenses
- `GET /api/expenses/:expenseId` - Get expense details
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense
- `GET /api/expenses/group/:groupId/balances` - Get group balances

## 🎯 Key Features in Detail

### Smart Split Calculations
- **Equal Split**: Automatically divides the expense equally among all participants
- **Exact Amounts**: Allows specifying exact amounts for each person with validation
- **Percentage Split**: Split by percentages with automatic calculation and validation

### Balance Settlement Algorithm
- Calculates optimal settlements to minimize the number of transactions
- Tracks who owes whom and by how much
- Provides simplified settlement suggestions
- Supports multiple currencies per group

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Immediate reflection of changes across the application
- **Intuitive Navigation**: Easy-to-use interface with clear visual hierarchy
- **Comprehensive Filtering**: Filter expenses by group, category, date, and status

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Authorization Middleware**: Route protection and user authorization

## 🚀 Deployment

### Backend Deployment
1. Set up production MongoDB instance
2. Configure environment variables for production
3. Deploy to cloud provider (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy static files to hosting service (Netlify, Vercel, AWS S3, etc.)
3. Update API base URL in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Inspired by **Splitwise** - the popular expense sharing application
- Built as a demonstration of modern full-stack development practices
- Uses modern JavaScript frameworks and best practices

---

**Happy Expense Splitting! 💰🎉**
