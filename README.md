# 🌟 Store Rating System

A full-stack Store Rating System that allows users to rate retail/grocery stores, store owners to monitor customer feedback, and system administrators to manage stores and users. Built using the **MERN-like MySQL stack**: React.js for the frontend, Node.js + Express.js for the backend API, MySQL for persistent relational storage, and JWT for secure authentication.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features by Role](#key-features-by-role)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [Database Design & Schema](#database-design--schema)
5. [Directory Structure](#directory-structure)
6. [API Endpoints](#api-endpoints)
7. [Validation Policies](#validation-policies)
8. [Installation & Setup](#installation--setup)
9. [Development Scripts](#development-scripts)

---

## 🔍 Project Overview

The Store Rating System enables customers to rate and review stores they visit on a scale of 1 to 5 stars. The system dynamically computes the overall average rating of each store. In addition:
- **Normal Users** can search, view, and submit/modify their ratings.
- **Store Owners** get direct access to feedback analytics and customer lists for their stores.
- **Administrators** possess master privileges to register users of all roles and link stores to store owners.

---

## 👥 Key Features by Role

### 1. 🛡️ System Administrator (`ADMIN`)
* **Analytics Dashboard:** Monitor total user counts, registered stores, and rating submissions.
* **User Management:** Register/create new users of any role (User, Store Owner, Admin).
* **Store Management:** Register new stores, add addresses, and assign them to an active Store Owner.
* **Advanced Tables:** View lists of all registered users and stores, with full filter-by-search and dynamic sorting functionality.

### 2. 🏪 Store Owner (`STORE_OWNER`)
* **Store Metrics:** Select from owned stores and view their current real-time overall average rating.
* **Customer Feedback:** Access a sorted list of customers who rated their store, showing customer names, emails, addresses, specific ratings, and timestamps.
* **Security:** Change login credentials securely from the dashboard.

### 3. 👤 Normal User (`USER`)
* **Store Directory:** Search stores by name or address, and sort them by name, address, or overall rating.
* **Interactive Ratings:** Submit a 1-to-5 star rating for any store. If a rating is already submitted, the interface switches to allow modifying the existing rating.
* **Security:** Change password from the user settings card.

---

## 🛠️ Architecture & Technology Stack

* **Frontend:** React.js (Vite), React Router Dom (v7), Lucide Icons, Vanilla CSS (with modern color variables and flexbox grid layouts).
* **Backend:** Node.js, Express.js framework, CORS middleware, JWT (JSON Web Tokens) for session authorization, and BcryptJS for password hashing.
* **Database:** MySQL relational database accessed via the promise-based `mysql2` client.

---

## 🗄️ Database Design & Schema

The SQL queries in [db/schema.sql](file:///c:/Users/Hp/OneDrive/Desktop/rox/db/schema.sql) define three tables:

### 1. `users` Table
Stores user credentials, roles, and physical addresses.
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `stores` Table
Represents individual store listings assigned to store owners.
```sql
CREATE TABLE stores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. `ratings` Table
Stores rating values submitted by users for stores. Contains a check constraint to restrict values to 1-5 and a unique key preventing duplicate store reviews by the same user.
```sql
CREATE TABLE ratings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE(user_id, store_id)
);
```

---

## 📁 Directory Structure

```text
Roxiler_Project/
├── db/                             # Database Initialization
│   ├── init.js                     # Setup script to create database and tables
│   └── schema.sql                  # MySQL tables & constraints definition
│
├── backend/                        # Node.js + Express.js Server
│   ├── config/
│   │   └── db.js                   # MySQL Connection Pool configuration
│   ├── controllers/
│   │   ├── authController.js       # Register and Login logic
│   │   ├── ratingController.js     # Submit, modify, and list ratings
│   │   ├── storeController.js      # Store creation and store listings
│   │   └── userController.js       # Password updates, stats, and user tables
│   ├── middleware/
│   │   ├── auth.js                 # JWT parsing & Role Authorization checks
│   │   └── validate.js             # Input formatting and size validation
│   ├── routes/
│   │   ├── auth.js                 # POST /register, POST /login
│   │   ├── ratings.js              # POST /submit, PUT /modify, GET /owner-list
│   │   ├── stores.js               # POST /create, GET /list
│   │   └── users.js                # PUT /password, GET /stats, GET /list, GET /owners
│   ├── .env.example                # Sample environment variables config
│   ├── package.json                # Dependencies and devscripts
│   └── server.js                   # Main application entry point
│
└── frontend/                       # React.js SPA (Vite)
    ├── src/
    │   ├── assets/                 # Icons and media assets
    │   ├── components/
    │   │   ├── AdminDashboard.jsx  # Admin management & registration view
    │   │   ├── OwnerDashboard.jsx  # Owner's stats & customer ratings list
    │   │   ├── UserDashboard.jsx   # Normal customer store view & rating select
    │   │   ├── Navbar.jsx          # Header navigation and Logout trigger
    │   │   └── ProtectedRoute.jsx  # Wrapper checking permissions & role validity
    │   ├── pages/
    │   │   ├── Login.jsx           # User Authentication Login page
    │   │   └── Register.jsx        # Signup page (with dropdown to choose Role)
    │   ├── App.css                 # Clean style sheet & color palette variables
    │   ├── App.jsx                 # Routes & Protected Routing assignments
    │   ├── config.js               # Sets API_BASE_URL (points to backend port)
    │   └── main.jsx                # Application root rendering
    ├── index.html                  # Core HTML5 page container
    ├── vite.config.js              # Vite configuration
    └── package.json                # React package configurations
```

---

## 🚀 API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /register`: Registers a new user. Enforces strict input validators.
* `POST /login`: Validates password hashes and returns a signed JWT token + user details object.

### 👤 User Management (`/api/users`)
* `PUT /password` *(All Roles)*: Validates and updates user passwords.
* `GET /stats` *(Admin Only)*: Returns overall stats: total users, stores, and ratings.
* `GET /list` *(Admin Only)*: Fetches all users with sorting and filtering options.
* `GET /owners` *(Admin Only)*: Lists available store owners (useful for assigning when creating stores).
* `POST /create` *(Admin Only)*: Direct user creation by system administrators.

### 🏪 Store Management (`/api/stores`)
* `POST /create` *(Admin Only)*: Creates a new store and assigns it to a `STORE_OWNER`.
* `GET /list` *(All Roles)*: Retrieves stores. Normal users see overall ratings and their own submitted scores. Store owners see their own stores only. Admins see everything.

### ⭐️ Rating Management (`/api/ratings`)
* `POST /submit` *(Normal User Only)*: Creates a new rating record for a store (1 to 5).
* `PUT /modify` *(Normal User Only)*: Updates an existing rating score.
* `GET /owner-list` *(Store Owner Only)*: Returns the ratings submitted to the store owner's businesses with sorting filters.

---

## 🛡️ Validation Policies

Both the Frontend and Backend validate input format parameters to ensure data integrity:
1. **Name Requirements:** Must be between **20 and 60 characters** long.
2. **Email Formatting:** Enforces traditional RFC-compliant email string matching (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
3. **Password Security:** Must be between **8 and 16 characters** long, containing at least **one uppercase letter** and **one special character** (non-alphanumeric).
4. **Address Requirements:** Optional, but must not exceed **400 characters**.
5. **Rating Constraint:** Only integer values from **1 to 5** are accepted.

---

## ⚙️ Installation & Setup

Follow these steps to configure the application locally:

### 1. Database Setup
1. Verify that **MySQL Service** is running on your machine.
2. Log into your MySQL console and create the database or let the init script build it.
3. Configure the environment variables (see next step) before running the database initializer.

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file based on `.env.example`:

```ini
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_system
JWT_SECRET=super_secret_store_rating_jwt_key_2026
```

### 3. Initialize Database Tables
Navigate to the `backend/` folder and run the initializer script. This will connect to MySQL, create the database, and generate the schema.
```bash
cd backend
npm install
npm run db:init
```

### 4. Running the Backend
Start the backend Express server (uses `nodemon` for hot-reloading in development):
```bash
npm run dev
```
The server will start on port `5001` (visible at `http://localhost:5001`).

### 5. Running the Frontend
Open another terminal, navigate to the `frontend/` folder, install dependencies, and run Vite:
```bash
cd frontend
npm install
npm run dev
```
The client dashboard will run locally at `http://localhost:5173`.

---

## ⌨️ Development Scripts

### Backend (`backend/package.json`)
* `npm run dev`: Starts the Node server in watch-mode using `nodemon`.
* `npm start`: Runs the Node server in production.
* `npm run db:init`: Runs the database initialization script (`node ../db/init.js`).

### Frontend (`frontend/package.json`)
* `npm run dev`: Boots the Vite development server.
* `npm run build`: Bundles the React assets for production.
* `npm run lint`: Performs lint checks using ESLint rules.
* `npm run preview`: Launches a local server previewing the built production bundle.
