# 📊 SplitBuddy - Complete Splitwise Clone

A comprehensive, full-stack expense-sharing application built with **Vue 3**, **Express.js**, and **MongoDB**. SplitBuddy enables users to easily track shared expenses, split bills using multiple strategies, manage group finances, and automate settlement calculations with friends and groups.

## 🎯 Project Overview & Purpose

**SplitBuddy** is a modern, production-ready expense management system designed to simplify how friends and groups handle shared finances. The application features intelligent expense splitting, automated settlement calculations, comprehensive analytics, and real-time balance tracking.

### Core Functionality
- ✅ Track individual and group expenses with detailed categorization
- ✅ Split costs using multiple strategies (Equal, Exact, Percentage)
- ✅ Manage group finances with admin and member role-based permissions
- ✅ Calculate who owes whom automatically
- ✅ Settle debts efficiently with simplified settlement suggestions
- ✅ Monitor spending patterns with comprehensive analytics and insights
- ✅ Manage a friends network within the application

### Key Features
- **Authentication** - Email/Password + Google Sign-In with JWT tokens
- **Group Management** - Create groups (Trip, Home, Couple, Other), manage members with roles (Admin/Member)  
- **Smart Expense Tracking** - Equal, Exact, and Percentage split types with multiple categories
- **Settlements** - Automated balance calculations, payment tracking with status updates
- **Analytics** - Monthly summaries, yearly reports, category breakdowns, spending insights
- **Payment Methods** - Cash, Credit Card, Bank Transfer, UPI, Wallet tracking
- **Currency Support** - USD, EUR, GBP, INR, CAD, AUD multi-currency support
- **Email Notifications** - Group invites, settlement reminders, activity notifications
- **Modern UI/UX** - Responsive design with glassmorphism, intuitive navigation, real-time updates

---

## 🛠️ Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Vue 3 (Composition API) | Reactive frontend components and data binding |
| **Build Tool** | Vite 7 | Lightning-fast development and optimized production builds |
| **Router** | Vue Router 4 | Client-side routing with protected auth routes |
| **State Management** | Pinia with Persisted State | Centralized state for authentication and analytics data |
| **Styling** | Tailwind CSS 4 | Utility-first CSS for responsive design and glassmorphism UI |
| **HTTP Client** | Axios | API communication with JWT interceptors |
| **Design Pattern** | Composition API + Custom Hooks | Modern Vue development with reusable logic composition |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js (v20+) | JavaScript server runtime |
| **Server Framework** | Express 5 | Lightweight HTTP server and routing |
| **Database** | MongoDB + Mongoose ODM | NoSQL database with schema validation |
| **Authentication** | JWT (jsonwebtoken) | Stateless token-based authentication |
| **Password Hashing** | bcryptjs | Secure password storage and verification |
| **Input Validation** | express-validator | Server-side validation of requests |
| **Email Service** | Nodemailer + Gmail OAuth2 | Send notifications and group invitations |
| **Google Auth** | google-auth-library, googleapis | OAuth2 integration for Google Sign-In |
| **Environment Config** | dotenv | Secure configuration management |
| **CORS** | express-cors | Cross-origin resource sharing |

---

## 📁 Project Structure & File Organization

```
splitbuddy/
├── 📄 README.md                 # Project documentation
├── 📄 package.json              # Frontend dependencies
├── 📄 vite.config.js            # Vite build configuration
├── 📄 jsconfig.json             # JavaScript configuration
├── 📄 index.html                # HTML entry point
├── 📂 public/                   # Static assets (fonts, images, icons)
│
├── 📂 src/                      # 🎨 FRONTEND APPLICATION
│   ├── 📄 App.vue               # Root component (Layout wrapper)
│   ├── 📄 main.js               # Application initialization
│   ├── 📄 style.css             # Global CSS styles
│   │
│   ├── 📂 router/
│   │   └── 📄 index.js          # Route definitions with auth guards
│   │                             # Routes: /dashboard, /groups, /expenses, /analytics, etc.
│   │
│   ├── 📂 store/                # State Management (Pinia)
│   │   ├── 📄 AuthStore.js      # Auth state: user, token, login/logout, profile
│   │   └── 📄 ExpenseStore.js   # Analytics state: monthly summaries, yearly reports, insights
│   │
│   ├── 📂 services/
│   │   └── 📄 api.js            # Axios instance with JWT interceptors and API endpoints
│   │
│   ├── 📂 layout/               # Layout Components
│   │   ├── 📄 Header.vue        # Navigation bar with user menu
│   │   └── 📄 Footer.vue        # Footer content
│   │
│   ├── 📂 pages/                # Page Components (Full page views)
│   │   ├── 📂 Auth/             # Protected routes (require authentication)
│   │   │   ├── 📄 DashboardPage.vue        # Welcome dashboard, balance overview
│   │   │   ├── 📄 HomePage.vue             # Home with activity summaries
│   │   │   ├── 📄 GroupsPage.vue           # List, search, and create groups
│   │   │   ├── 📄 GroupDetailPage.vue      # Group details, expenses, member balances
│   │   │   ├── 📄 FriendsPage.vue          # Friends list, add friends, bilateral balances
│   │   │   ├── 📄 ExpensesPage.vue         # All user expenses with filters
│   │   │   ├── 📄 MonthlyExpensesPage.vue  # Detailed monthly breakdown table
│   │   │   ├── 📄 AnalyticsPage.vue        # Analytics dashboard (charts, insights)
│   │   │   └── 📄 EditProfilePage.vue      # User settings, currency preference
│   │   │
│   │   └── 📂 UnAuth/           # Public routes
│   │       └── 📄 AuthPage.vue  # Login/Register (glassmorphism design)
│   │
│   └── 📂 components/           # Reusable Components
│       ├── 📄 AddExpenseModal.vue           # Create/edit expense form
│       ├── 📄 AddTransactionModal.vue       # Quick transaction entry
│       ├── 📄 CreateGroupModal.vue          # Group creation form
│       ├── 📄 AddPartnerModal.vue           # Add friends form
│       ├── 📄 BalancesView.vue              # Shows who owes/is owed
│       ├── 📄 ExpenseItem.vue               # Single expense card
│       ├── 📄 ExpenseCategoryPie.vue        # Category distribution pie chart
│       ├── 📄 MonthlyTrendChart.vue         # Monthly expense trend chart
│       ├── 📄 MonthlyOverview.vue           # Monthly summary widget
│       ├── 📄 MonthlyBreakdownTable.vue     # Detailed transaction table
│       ├── 📄 CategoryBreakdown.vue         # Category analysis table
│       ├── 📄 PaymentMethodBreakdown.vue    # Payment method analysis
│       ├── 📄 ExpenseTrendAnalysis.vue      # Spending trend analysis graph
│       ├── 📄 SpendingInsights.vue          # AI-like insights display
│       ├── 📄 SharedExpenseTracker.vue      # Group expense tracking
│       ├── 📄 TransactionManager.vue        # Transaction list manager
│       ├── 📄 RecentTransactions.vue        # Latest transactions widget
│       ├── 📄 AnnualInsights.vue            # Yearly summary & insights
│       ├── 📄 YearlySummary.vue             # Annual financial overview
│       ├── 📄 MonthYearPicker.vue           # Date navigation control
│       └── 📄 UserAvatar.vue                # User profile picture display
│
└── 📂 server/                   # 🔧 BACKEND APPLICATION
    ├── 📄 index.js              # Express server entry point
    ├── 📄 package.json          # Backend dependencies
    │
    ├── 📂 config/
    │   └── 📄 database.js        # MongoDB connection setup with Mongoose
    │
    ├── 📂 middleware/
    │   └── 📄 auth.js            # JWT verification, optional auth, error handling
    │
    ├── 📂 models/               # Mongoose Schemas (Database Models)
    │   ├── 📄 User.js            # User model with password hashing, friends list
    │   ├── 📄 Group.js           # Group model with members, roles, settings
    │   ├── 📄 Expense.js         # Expense model with split types and categories
    │   └── 📄 Settlement.js      # Settlement model for tracking bill payments
    │
    ├── 📂 routes/               # API Route Handlers
    │   ├── 📄 auth.js            # Registration, login, Google auth, password change
    │   ├── 📄 users.js           # User profile, friends, balance, dashboard
    │   ├── 📄 groups.js          # Group CRUD, member management, leave group
    │   ├── 📄 expenses.js        # Expense CRUD, split calculation, settling
    │   ├── 📄 settlements.js     # Settlement creation, confirmation, history
    │   ├── 📄 analytics.js       # Monthly/yearly reports, category breakdown, insights
    │   └── 📄 debug.js           # Development utilities and testing
    │
    ├── 📂 utils/
    │   ├── 📄 jwt.js             # Token generation and verification functions
    │   └── 📄 mailer.js          # Email sending (invites, notifications, reminders)
    │
    └── 📂 scripts/              # Development Scripts
        ├── 📄 send_test_email.js    # Test email configuration
        └── 📄 check_mail_config.js  # Validate SMTP/Gmail setup
```

---

## 🎨 Frontend Architecture (Vue.js + Vite)

### Routing Structure

The application uses Vue Router 4 with auth guards to protect routes and redirect unauthenticated users.

```javascript
// Public Routes
GET /              → Redirects to /dashboard (if auth) or /auth (if not)
GET /auth          → AuthPage (Login/Signup with glassmorphism design)

// Protected Routes (Require Authentication)
GET /dashboard     → DashboardPage (balance overview, quick stats)
GET /home          → HomePage (welcome screen with recent activity)
GET /groups        → GroupsPage (create, search, list all groups)
GET /groups/:id    → GroupDetailPage (group expenses, member balances, settlements)
GET /friends       → FriendsPage (friends list, add friends, show balances with friends)
GET /expenses      → ExpensesPage (view all user expenses with filters)
GET /expenses/monthly → MonthlyExpensesPage (detailed monthly transaction table)
GET /expenses/analytics → AnalyticsPage (analytics dashboard with charts)
GET /profile/edit  → EditProfilePage (personal settings, currency, password)
```

### State Management with Pinia

#### **AuthStore** - Authentication & User State
```javascript
// Location: src/store/AuthStore.js

State Properties:
  - user: null | Object          // Current logged-in user data
  - token: string | null         // JWT authentication token
  - loading: boolean             // API request loading state
  - error: string | null         // Error message if any

Computed Properties:
  - isAuthenticated: boolean     // Check if user is logged in (token exists)

Actions (Methods):
  - login(email, password)       // Email/password login
  - register(userData)           // Create new account
  - loginWithGoogle(token)       // Google OAuth login
  - logout()                     // Clear user and token
  - updateProfile(userData)      // Update user info
  - fetchProfile()               // Get current user data
  - initializeAuth()             // Restore session from localStorage
  - changePassword(oldPass, newPass)  // Change password

Persistence:
  - Stored in localStorage for session restore on page refresh
  - Token auto-attached to API requests via Axios interceptor
```

#### **ExpenseStore** - Analytics & Expense State
```javascript
// Location: src/store/ExpenseStore.js

State Properties:
  - currentMonth: number         // Current month (1-12)
  - currentYear: number          // Current year
  - monthlySummary: Object       // Monthly expense summary
  - monthlyAnalytics: Object     // Detailed monthly analytics
  - yearlyReport: Object         // Yearly financial report
  - insights: Object             // Spending insights and patterns
  - userExpenses: Array          // All user expenses

Computed Properties:
  - monthName: string            // Display name of current month
  - displayDate: string          // Formatted month/year

Actions (Methods):
  - fetchMonthlySummary()        // Get monthly income/expense/balance
  - fetchMonthlyAnalytics()      // Get detailed monthly breakdown by category
  - fetchYearlyReport(year)      // Get yearly totals and comparisons
  - fetchInsights()              // Calculate spending insights
  - fetchUserExpenses(filters)   // Get expenses with category/method filters
  - previousMonth()              // Navigate to previous month
  - nextMonth()                  // Navigate to next month
  - setDateRange(month, year)    // Set specific month/year
```

### Key Frontend Components

**Page Components (Full-page views):**

| Page | Purpose | Key Features |
|------|---------|--------------|
| **DashboardPage** | User welcome & overview | Total balance, quick stats, navigate sections, quick actions |
| **GroupsPage** | Manage groups | Create groups, search, list with members, admin controls |
| **GroupDetailPage** | Group-specific view | Group expenses, member balances, settlements, activity |
| **FriendsPage** | Friends network | Add/search friends, view friend list, bilateral balances |
| **ExpensesPage** | All expenses | Filter by category, date, payment method, view details |
| **MonthlyExpensesPage** | Monthly analysis | Date picker, detailed table, category breakdown, charts |
| **AnalyticsPage** | Analytics dashboard | Monthly summary, yearly report, category/method breakdown, insights |
| **EditProfilePage** | User settings | Edit name/email, change password, currency preference |
| **AuthPage** | Authentication | Login and Register (glassmorphism design, Google auth) |

**Reusable Components:**

| Component | Function |
|-----------|----------|
| **AddExpenseModal** | Form to create/edit expense with split types |
| **AddTransactionModal** | Quick transaction entry |
| **CreateGroupModal** | Group creation form |
| **BalancesView** | Shows "who owes whom" in grouped/friend context |
| **ExpenseItem** | Card displaying single expense |
| **ExpenseCategoryPie** | Pie chart of spending by category |
| **MonthlyTrendChart** | Line chart showing expense trends |
| **CategoryBreakdown** | Table of expenses by category |
| **PaymentMethodBreakdown** | Analysis by payment method |
| **ExpenseTrendAnalysis** | Spending pattern analysis |
| **SpendingInsights** | Automated spending recommendations |
| **AnnualInsights** | Year-over-year analysis |

### API Integration (Axios)

```javascript
// Location: src/services/api.js

Features:
- Axios instance with base URL pointing to backend
- JWT token auto-attached to Authorization header on each request
- Request/Response interceptors for error handling
- Automatic token refresh on 401 Unauthorized
- Centralized API endpoints

Endpoint Structure:
- /api/auth/*        → Authentication endpoints
- /api/users/*       → User profile and friends
- /api/groups/*      → Group CRUD and management
- /api/expenses/*    → Expense CRUD and operations
- /api/settlements/* → Settlement tracking
- /api/analytics/*   → Analytics and reports
```

---

## 🔧 Backend Architecture (Node.js + Express)

### Express Server Setup

```javascript
// Location: server/index.js

Port: 5000 (or process.env.PORT)
CORS: Enabled for localhost:5173 (Vite dev server)

Middleware Stack:
1. express.json()                 // Parse JSON request bodies
2. express.urlencoded()           // Parse form data
3. CORS middleware                // Handle cross-origin requests
4. Logger middleware              // Log incoming requests
5. Route handlers                 // API routes
6. Error handler middleware       // Centralized error handling
```

### Database Connection

```javascript
// Location: server/config/database.js

MongoDB Connection:
- Uses Mongoose ODM for schema definition
- Connection URI from MONGODB_URI environment variable
- Supports both local MongoDB and MongoDB Atlas cloud
- Automatic reconnection with retry logic

Connection Options:
  - useNewUrlParser: true
  - useUnifiedTopology: true
```

### Authentication Middleware

```javascript
// Location: server/middleware/auth.js

JWT Verification:
- Extracts token from Authorization header ("Bearer <token>")
- Verifies token signature using JWT_SECRET
- Decodes token to get user ID
- Attaches user ID to request object (req.userId)

Error Handling:
- Missing token → 401 Unauthorized
- Invalid/expired token → 401 Unauthorized
- Malformed header → 401 Unauthorized

Optional Auth:
- Some endpoints allow requests with or without auth
- User ID is optional in request context
```

### Database Models (Mongoose Schemas)

#### **User Model**
```javascript
// Location: server/models/User.js

Schema Fields:
  name: String (1-50 chars, required)
  email: String (unique, validated, required)
  password: String (hashed with bcrypt, min 6 chars, optional for OAuth)
  avatar: String (URL to profile picture)
  phone: String (optional)
  currency: Enum ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  groups: [ObjectId] (references to Group documents)
  friends: [ObjectId] (references to other User documents)
  totalBalance: Number (net settlement amount)
  isEmailVerified: Boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)

Methods:
  - comparePassword(candidatePassword): Boolean
    Compares plaintext with bcrypt hash for login
  
  - toJSON(): Object
    Excludes password when serializing user data

Hooks:
  - Pre-save: Automatically hash password with bcrypt if modified
  - Pre-save: Validation of email format

Indices:
  - Email (unique, for fast lookups)
  - CreatedAt (for user list sorting)
```

#### **Group Model**
```javascript
// Location: server/models/Group.js

Schema Fields:
  name: String (1-100 chars, required)
  description: String (optional, max 500 chars)
  category: Enum ['trip', 'home', 'couple', 'other']
  image: String (URL to group picture)
  
  members: [{
    user: ObjectId → User reference
    role: Enum ['admin', 'member']
    joinedAt: Date (when member was added)
  }]
  
  expenses: [ObjectId] (references to Expense documents)
  totalExpenses: Number (sum of all expense amounts)
  currency: Enum ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  isActive: Boolean (soft delete flag)
  createdBy: ObjectId (User reference - group creator)
  createdAt: Date (auto)
  updatedAt: Date (auto)

Methods:
  - addMember(userId, role): void
    Adds user to members array
  
  - removeMember(userId): void
    Removes user from members array
  
  - calculateBalance(userId): Number
    Calculates net balance for user in group

Hooks:
  - Post-delete: Clean up related expenses and settlements

Indices:
  - members.user (for finding groups by member)
  - createdBy (for user's groups query)
  - isActive (for active/inactive filtering)
```

#### **Expense Model**
```javascript
// Location: server/models/Expense.js

Schema Fields:
  title: String (1-200 chars, required)
  description: String (optional, max 1000 chars)
  amount: Number (required, must be > 0)
  currency: Enum ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  
  category: Enum ['food', 'transport', 'accommodation', 'entertainment', 
                   'shopping', 'utilities', 'salary', 'investment', 'other']
  
  transactionType: Enum ['income', 'expense', 'investment']
  
  paymentMethod: Enum ['cash', 'credit_card', 'debit_card', 'bank_transfer', 
                       'upi', 'wallet', 'other']
  
  tags: [String] (optional, for custom categorization)
  
  group: ObjectId (reference to Group, optional)
  paidBy: ObjectId (reference to User who paid - required)
  
  splitType: Enum ['equal', 'exact', 'percentage']
  
  splits: [{
    user: ObjectId → User reference
    amount: Number (share amount in currency)
    percentage: Number (percentage for percentage splits)
    paid: Boolean (if user has paid back their share)
  }]
  
  receipt: String (URL to receipt image/document)
  date: Date (when expense occurred)
  isSettled: Boolean (if all splits are paid)
  notes: String (additional notes)
  createdBy: ObjectId (User reference)
  createdAt: Date
  updatedAt: Date

Validation:
  - For 'exact': sum of splits must equal amount
  - For 'percentage': sum of percentages must equal 100
  - For 'equal': amount is divided by number of participants

Methods:
  - calculateUserShare(userId): Number
    Returns what user owes or is owed
  
  - markAsSettled(): void
    Sets isSettled to true when all payments done

Hooks:
  - Pre-save: Validate splits based on splitType
  - Post-save: Update group.totalExpenses

Indices:
  - group + date (for group expense queries)
  - paidBy (for user's expenses)
  - splits.user (for finding user's shares)
  - createdAt (for sorting)
```

#### **Settlement Model**
```javascript
// Location: server/models/Settlement.js

Schema Fields:
  group: ObjectId (reference to Group, required)
  from: ObjectId (reference to User - who pays)
  to: ObjectId (reference to User - who receives)
  amount: Number (> 0, payment amount)
  currency: Enum ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  
  status: Enum ['pending', 'confirmed', 'cancelled']
  method: Enum ['cash', 'bank_transfer', 'paypal', 'venmo', 'other']
  
  notes: String (optional, why payment made)
  settledAt: Date (when payment was made)
  relatedExpenses: [ObjectId] (expense documents this settles)
  confirmedBy: ObjectId (User who confirmed settlement)
  createdAt: Date
  updatedAt: Date

Methods:
  - confirm(userId): void
    Marks settlement as confirmed by userId
  
  - cancel(): void
    Sets status to 'cancelled'

Hooks:
  - Post-save: Update related expenses' isSettled field

Indices:
  - group + status (for settlement queries)
  - from + to (for user pair lookups)
  - status + createdAt (for settlement list sort)
```

### Database Relationships

```
User (1) ←→ (Many) Group          // Via members array
User (1) ←→ (Many) User           // Via friends array

User (1) ←→ (Many) Expense        // As paidBy
User (1) ←→ (Many) Expense        // In splits array

User (1) ←→ (Many) Settlement     // As from or to

Group (1) ←→ (Many) Expense       // Via expenses array
Group (1) ←→ (Many) Settlement    // Via group reference

Expense (1) ←→ (Many) Settlement  // Via relatedExpenses
```

---

## 🔌 API Endpoints Documentation

### Authentication Routes (`/api/auth`)

```
POST /api/auth/register
  Request: { name, email, password, currency }
  Response: { user: { id, name, email, ... }, token: "jwt_token" }
  Purpose: Create new user account

POST /api/auth/login
  Request: { email, password }
  Response: { user: { ... }, token: "jwt_token" }
  Purpose: Email/password login

POST /api/auth/google
  Request: { token: "google_id_token" }
  Response: { user: { ... }, token: "jwt_token" }
  Purpose: Google OAuth sign-in/sign-up

GET /api/auth/me
  Headers: { Authorization: "Bearer {token}" }
  Response: { user: { ... } }
  Purpose: Get current logged-in user profile

PUT /api/auth/profile
  Headers: { Authorization: "Bearer {token}" }
  Request: { name, phone, avatar, currency }
  Response: { user: { ... } }
  Purpose: Update user profile

PUT /api/auth/change-password
  Headers: { Authorization: "Bearer {token}" }
  Request: { oldPassword, newPassword }
  Response: { message: "Password changed" }
  Purpose: Change user password
```

### User Routes (`/api/users`)

```
GET /api/users/search?q=query
  Query: q (search term for name/email)
  Response: { users: [...] }
  Purpose: Search for users to add as friends

POST /api/users/friends/:userId
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Send friend request/add friend

DELETE /api/users/friends/:userId
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Remove friend

GET /api/users/friends
  Headers: { Authorization: "Bearer {token}" }
  Response: { friends: [...] }
  Purpose: Get list of user's friends

GET /api/users/balance
  Headers: { Authorization: "Bearer {token}" }
  Response: { balance: { total, owed, owing } }
  Purpose: Get user's total balance across all groups

GET /api/users/dashboard
  Headers: { Authorization: "Bearer {token}" }
  Response: { groups, friends, recentExpenses, balances }
  Purpose: Get dashboard data
```

### Group Routes (`/api/groups`)

```
POST /api/groups
  Headers: { Authorization: "Bearer {token}" }
  Request: { name, description, category, currency, members: [ids] }
  Response: { group: { ... } }
  Purpose: Create new group

GET /api/groups
  Headers: { Authorization: "Bearer {token}" }
  Response: { groups: [...] }
  Purpose: Get all groups user belongs to

GET /api/groups/:groupId
  Headers: { Authorization: "Bearer {token}" }
  Response: { group: { ... }, expenses: [...], balances: {...} }
  Purpose: Get single group details with expenses and balances

PUT /api/groups/:groupId
  Headers: { Authorization: "Bearer {token}" }
  Request: { name, description, category, currency }
  Response: { group: { ... } }
  Purpose: Update group settings (admin only)

DELETE /api/groups/:groupId
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Delete group (admin only)

POST /api/groups/:groupId/members
  Headers: { Authorization: "Bearer {token}" }
  Request: { userId, role }
  Response: { member: { ... } }
  Purpose: Add member to group (admin only)

DELETE /api/groups/:groupId/members/:userId
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Remove member from group

POST /api/groups/:groupId/leave
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Current user leaves group
```

### Expense Routes (`/api/expenses`)

```
POST /api/expenses
  Headers: { Authorization: "Bearer {token}" }
  Request: { 
    title, amount, currency, category, paymentMethod, 
    groupId, splitType, splits: [{ userId, amount }],
    date, notes, receipt
  }
  Response: { expense: { ... } }
  Purpose: Create new expense with splits

GET /api/expenses/group/:groupId
  Headers: { Authorization: "Bearer {token}" }
  Query: { limit, skip, startDate, endDate }
  Response: { expenses: [...], total }
  Purpose: Get group expenses (paginated)

GET /api/expenses/user
  Headers: { Authorization: "Bearer {token}" }
  Query: { category, paymentMethod, startDate, endDate }
  Response: { expenses: [...] }
  Purpose: Get user's expenses with filters

GET /api/expenses/:expenseId
  Headers: { Authorization: "Bearer {token}" }
  Response: { expense: { ... } }
  Purpose: Get single expense details

PUT /api/expenses/:expenseId
  Headers: { Authorization: "Bearer {token}" }
  Request: { title, amount, category, ... (same as POST) }
  Response: { expense: { ... } }
  Purpose: Update expense (only creator)

DELETE /api/expenses/:expenseId
  Headers: { Authorization: "Bearer {token}" }
  Purpose: Delete expense (only creator)

POST /api/expenses/:expenseId/settle
  Headers: { Authorization: "Bearer {token}" }
  Request: { confirmedBy }
  Response: { settlement: { ... } }
  Purpose: Mark expense/split as settled
```

### Settlement Routes (`/api/settlements`)

```
POST /api/settlements
  Headers: { Authorization: "Bearer {token}" }
  Request: { groupId, from, to, amount, method, notes }
  Response: { settlement: { ... } }
  Purpose: Create settlement record

GET /api/settlements/group/:groupId
  Headers: { Authorization: "Bearer {token}" }
  Query: { status }
  Response: { settlements: [...] }
  Purpose: Get group settlements

PUT /api/settlements/:settlementId
  Headers: { Authorization: "Bearer {token}" }
  Request: { status, method, notes }
  Response: { settlement: { ... } }
  Purpose: Update settlement

POST /api/settlements/:settlementId/confirm
  Headers: { Authorization: "Bearer {token}" }
  Response: { settlement: { ... } }
  Purpose: Confirm settlement as paid
```

### Analytics Routes (`/api/analytics`)

```
GET /api/analytics/monthly/summary
  Headers: { Authorization: "Bearer {token}" }
  Query: { month, year }
  Response: { 
    totalIncome, totalExpense, totalInvestment, 
    balance, owedAmount, owingAmount 
  }
  Purpose: Get monthly summary for user

GET /api/analytics/monthly/breakdown
  Headers: { Authorization: "Bearer {token}" }
  Query: { month, year }
  Response: { byCategory: {...}, byPaymentMethod: {...} }
  Purpose: Get monthly breakdown by category and method

GET /api/analytics/yearly/:year
  Headers: { Authorization: "Bearer {token}" }
  Response: { monthlySummaries: [...], total: {...} }
  Purpose: Get yearly financial report

GET /api/analytics/insights
  Headers: { Authorization: "Bearer {token}" }
  Response: { insights: [...] }
  Purpose: Get spending insights and recommendations

GET /api/analytics/expenses
  Headers: { Authorization: "Bearer {token}" }
  Query: { category, paymentMethod, month, year }
  Response: { expenses: [...] }
  Purpose: Get filtered expenses for analysis
```

---

## 💡 Key Functionalities Explained

### Expense Splitting Strategies

**1. Equal Split**
```
Amount: $100
Members: 4 people (Alice, Bob, Charlie, David)

Calculation: $100 ÷ 4 = $25 per person
Result: Each person owes $25

Data Structure:
{
  splitType: 'equal',
  splits: [
    { user: alice_id, amount: 25 },
    { user: bob_id, amount: 25 },
    { user: charlie_id, amount: 25 },
    { user: david_id, amount: 25 }
  ]
}
```

**2. Exact Amount Split**
```
Amount: $100
Exact Distribution:
  - Alice: $40
  - Bob: $35
  - Charlie: $25

Data Structure:
{
  splitType: 'exact',
  splits: [
    { user: alice_id, amount: 40 },
    { user: bob_id, amount: 35 },
    { user: charlie_id, amount: 25 }
  ]
}
```

**3. Percentage Split**
```
Amount: $100
Percentage Distribution:
  - Alice: 50%
  - Bob: 30%
  - Charlie: 20%

Calculated Amounts:
  - Alice: $100 × 0.50 = $50
  - Bob: $100 × 0.30 = $30
  - Charlie: $100 × 0.20 = $20

Data Structure:
{
  splitType: 'percentage',
  splits: [
    { user: alice_id, percentage: 50, amount: 50 },
    { user: bob_id, percentage: 30, amount: 30 },
    { user: charlie_id, percentage: 20, amount: 20 }
  ]
}
```

### Settlement System

**How Settlement Works:**

```
Step 1: Track Expenses
  - Alice pays $100 for dinner, splits 3 ways (Alice, Bob, Charlie)
  - Each person's share: $33.33
  - Bob owes Alice: $33.33
  - Charlie owes Alice: $33.33

Step 2: Calculate Balances
  For each person in a group:
    - totalPaid = sum of all amounts where paidBy = person
    - totalOwed = sum of all amounts where person in splits
    - netBalance = totalPaid - totalOwed
  
  Example:
    Alice:   paid $100, owes $33.33  → balance = +$66.67 (is owed)
    Bob:     paid $0, owes $33.33    → balance = -$33.33 (owes)
    Charlie: paid $0, owes $33.33    → balance = -$33.33 (owes)

Step 3: Simplified Settlements
  The system matches creditors with debtors to minimize transactions
  
  Simple case (shown above):
    Bob pays Alice: $33.33
    Charlie pays Alice: $33.33
  
  Complex case (cycles):
    Alice owes Bob: $20
    Bob owes Charlie: $30
    Charlie owes Alice: $15
    
    Simplified to:
    Alice pays Charlie: $5 (net)
    Charlie pays Bob: $30
    Bob pays Alice: $20 (net)

Step 4: Recording Settlements
  When payment made:
    - Create Settlement record
    - Both parties can confirm
    - Expense marked as isSettled = true
```

### Group Management & Roles

**Admin Role:**
- Can edit group settings (name, description, category, currency)
- Can add/remove members
- Can delete group
- Can edit any expense
- Full access to group analytics

**Member Role:**
- Can add expenses to group
- Can view group expenses and balances
- Can view group analytics
- Can leave group (remove self)
- Can only edit own added expenses

**Member Addition:**
```
1. Admin clicks "Add Member"
2. Search for user by email/name
3. Select role (admin/member)
4. Send invitation (email notification)
5. New member added to group.members array
```

### Authentication Flow

**Email/Password Registration:**
```
1. User enters: name, email, password, currency
2. Server validates: email unique, password length ≥ 6
3. Hash password with bcrypt (salt rounds: 10)
4. Create User document in MongoDB
5. Generate JWT token { userId, exp: 7 days }
6. Return { user, token } to client
7. Client stores token in localStorage
```

**Email/Password Login:**
```
1. User enters: email, password
2. Find user by email
3. Compare submitted password with hashed password
4. If match: Generate JWT token
5. Return { user, token }
6. If no match: Return 401 Unauthorized
```

**Google OAuth Login:**
```
1. User clicks "Sign in with Google"
2. Google popup appears, user authenticates
3. Google returns ID token (JWT)
4. Client sends ID token to /api/auth/google
5. Server verifies token signature with Google public key
6. Extract user email, name, avatar from token
7. Check if user exists in DB
   - If exists: Generate app JWT token
   - If not: Create new User document
8. Return { user, token }
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20.19.0 or higher (check: `node --version`)
- **npm** or **yarn** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning repository)
- **Google OAuth credentials** (optional, for Google Sign-In)

### Project Setup

**Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd splitbuddy
```

**Step 2: Install Frontend Dependencies**
```bash
npm install
```

**Step 3: Install Backend Dependencies**
```bash
cd server
npm install
cd ..
```

**Step 4: Create Environment Configuration**
```bash
# Copy example env file
cp server/.env.example server/.env
```

**Step 5: Configure Environment Variables**

Edit `server/.env` with your settings:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/splitbuddy
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/splitbuddy

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Google OAuth (optional, for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email Configuration (Gmail SMTP)
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SENDER_EMAIL=noreply@splitbuddy.com
SENDER_NAME=SplitBuddy
```

### Database Setup

**Local MongoDB:**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running (should connect without error)
mongosh
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Running the Application

**Terminal 1: Start Backend Server**
```bash
cd server
npm run start
# or for development with auto-reload:
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2: Start Frontend Dev Server**
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

**Access the Application**
Open browser and navigate to: `http://localhost:5173`

### Build for Production

```bash
# Build frontend
npm run build
# Output: dist/ folder with optimized files

# Build backend (if needed)
# Usually Node.js runs source files directly
```

---

## 📊 Code Example: Creating an Expense

### Frontend (Vue Component)

```javascript
// AddExpenseModal.vue

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/store/AuthStore'

const authStore = useAuthStore()
const title = ref('')
const amount = ref('')
const category = ref('food')
const splitType = ref('equal')
const selectedMembers = ref([])
const loading = ref(false)

async function submitExpense() {
  loading.value = true
  try {
    const payload = {
      title: title.value,
      amount: parseFloat(amount.value),
      category: category.value,
      paidBy: authStore.user.id,
      splitType: splitType.value,
      splits: selectedMembers.value.map(memberId => ({
        user: memberId,
        // amount will be calculated in backend
      })),
      date: new Date(),
    }
    
    await api.post('/expenses', payload)
    // Emit event or refetch expenses
    emit('expense-created')
    resetForm()
  } catch (error) {
    console.error('Error creating expense:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### Backend (Express Route)

```javascript
// server/routes/expenses.js

router.post('/', verify, async (req, res) => {
  try {
    const { title, amount, category, paidBy, splitType, splits, date } = req.body
    
    // Validation
    if (!title || !amount || !Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({ error: 'Invalid expense data' })
    }
    
    // Calculate split amounts
    let calculatedSplits = splits
    
    if (splitType === 'equal') {
      const shareAmount = amount / splits.length
      calculatedSplits = splits.map(s => ({
        user: s.user,
        amount: shareAmount,
      }))
    }
    
    // Validate splits sum
    const totalSplits = calculatedSplits.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(totalSplits - amount) > 0.01) {
      return res.status(400).json({ error: 'Splits must sum to expense amount' })
    }
    
    // Create expense
    const expense = new Expense({
      title,
      amount,
      category,
      paidBy,
      splitType,
      splits: calculatedSplits,
      date: date || new Date(),
      createdBy: req.userId,
    })
    
    await expense.save()
    
    // Update group totalExpenses if group specified
    if (req.body.groupId) {
      await Group.findByIdAndUpdate(
        req.body.groupId,
        { $inc: { totalExpenses: amount } }
      )
    }
    
    res.status(201).json({ expense })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

---

## 📝 Code Example: Calculating Group Balances

```javascript
// server/utils/balanceCalculator.js

function calculateGroupBalances(expenses, members) {
  const balances = {}
  
  // Initialize balances for all members
  members.forEach(memberId => {
    balances[memberId] = { paid: 0, owes: 0 }
  })
  
  // Calculate paid amounts and owed amounts
  expenses.forEach(expense => {
    // Person who paid
    balances[expense.paidBy].paid += expense.amount
    
    // People who owe
    expense.splits.forEach(split => {
      balances[split.user].owes += split.amount
    })
  })
  
  // Calculate net balance (positive = is owed, negative = owes)
  Object.keys(balances).forEach(memberId => {
    balances[memberId].net = 
      balances[memberId].paid - balances[memberId].owes
  })
  
  return balances
}

function simplifySettlements(balances) {
  // Separate creditors and debtors
  const creditors = [] // People who paid more
  const debtors = []   // People who owe
  
  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance.net > 0) {
      creditors.push({ memberId, amount: balance.net })
    } else if (balance.net < 0) {
      debtors.push({ memberId, amount: -balance.net })
    }
  })
  
  // Create minimal settlements
  const settlements = []
  
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0]
    const debtor = debtors[0]
    
    const settleAmount = Math.min(creditor.amount, debtor.amount)
    
    settlements.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount: settleAmount,
    })
    
    creditor.amount -= settleAmount
    debtor.amount -= settleAmount
    
    if (creditor.amount === 0) creditors.shift()
    if (debtor.amount === 0) debtors.shift()
  }
  
  return settlements
}
```

---

## 🔐 Security Features

1. **Password Hashing** - bcryptjs with 10 salt rounds
2. **JWT Tokens** - Secure token-based authentication
3. **CORS Protection** - Limited to frontend domain
4. **Input Validation** - Server-side validation on all routes
5. **Password Reset** - Secure password change mechanism
6. **SQL Injection Prevention** - Mongoose schema validation
7. **XSS Protection** - Vue3 auto-escaping
8. **Rate Limiting** - Can be added using express-rate-limit

---

## 📈 Analytics Features

The application tracks multiple analytics dimensions:

- **Monthly Analytics**: Income, expenses, investments, net balance
- **Category Breakdown**: Spending by expense category
- **Payment Method Analysis**: Distribution by payment method
- **Trend Analysis**: Monthly trends over year
- **Yearly Reports**: Annual summaries and comparisons
- **Spending Insights**: Patterns and recommendations

---

## 🐛 Development & Debugging

### Common Issues

**MongoDB Connection Error**
```bash
# Make sure MongoDB is running
mongosh  # Test connection

# Check MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/splitbuddy
```

**Port Already in Use**
```bash
# Change PORT in .env or:
# macOS/Linux: Kill process
lsof -ti:5000 | xargs kill -9

# Windows: Use different port
PORT=5001
```

**JWT Token Issues**
```bash
# Clear localStorage and reload
localStorage.clear()

# Ensure JWT_SECRET is >32 chars and consistent
JWT_SECRET=your_very_long_secret_key_here_at_least_32_characters
```

### Debug Scripts

```bash
# Test email configuration
cd server
npm run check-mail

# Send test email
npm run send-test-email
```

---

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is open source. See LICENSE file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions, please open an issue on the repository or contact the development team.

---

**Last Updated:** March 2026  
**Version:** 1.0.0
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
