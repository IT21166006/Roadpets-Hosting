import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Gallery from "./components/Gallery";
import Banner from "./components/Banner";
import Home from "../src/pages/Home"; 
import Admin from "../src/pages/Admin";
import Postform from "./components/PostForm"; 
import Footer from "./components/Footer"
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Petdashboard from './components/Petdashboard'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router basename="/">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={
          <ProtectedRoute>
            <Postform />
          </ProtectedRoute>
        } />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/petdashboard" element={
          <ProtectedRoute>
            <Petdashboard />
          </ProtectedRoute>
        } />
        <Route path="/banner" element={<Banner />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
