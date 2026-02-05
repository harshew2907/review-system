import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Register />} /> 

        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['System Administrator']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Normal User']}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/owner-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Store Owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;