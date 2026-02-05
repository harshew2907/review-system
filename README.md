# Full-Stack Store Review & Management System

A comprehensive web application designed for managing and rating retail stores. This project features a robust Three-Tier architecture with dedicated interfaces for System Administrators, Store Owners, and Regular Users.


## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, React Router, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MySQL (XAMPP / phpMyAdmin)
- **Security:** JSON Web Tokens (JWT), BcryptJS (Password Hashing)

## 🚀 Key Features
- **Admin Dashboard:** Full User Management, Role Assignment (User/Owner/Admin), Store Creation, and System Statistics.
- **Owner Dashboard:** Real-time Average Rating tracking and detailed User Review logs.
- **User Dashboard:** Store discovery with real-time search/filter and interactive Star Rating system.
- **Security:** Secure Login/Signup with complex password validation and protected API routes.

## 📋 Project Structure
```text
/project-root
  ├── /frontend      # React application
  ├── /backend       # Node.js Express server
  ├── schema.sql     # Database structure for phpMyAdmin
  └── .gitignore     # Git exclusion rules

1. Database Configuration (XAMPP)
Start Apache and MySQL in your XAMPP Control Panel.
Navigate to http://localhost/phpmyadmin.
Create a new database named review system.
Click the Import tab and select the schema.sql file from this repository.

2. Backend Setup
Navigate to the backend folder: cd backend
Install dependencies: npm install
Create a .env file in the backend folder:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=review system
JWT_SECRET=your_secret_key_here
Start the server: npm start

3. Frontend Setup
Navigate to the frontend folder: cd frontend
Install dependencies: npm install
Start the React app: npm start

Security Features
Passwords: Never stored in plain text; hashed using salted Bcrypt.
Validation: Frontend and Backend validation for email formats and password complexity.
Authorization: Role-based access ensures users can only see data relevant to their account type.

This project is for educational purposes. Feel free to use it as a reference for full-stack development.

