// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LoginRedirect from './pages/LoginRedirect.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Products from './pages/Products.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Education from './pages/EducationalHub.jsx';
import EducationAdmin from './pages/EducationAdmin.jsx';
import About from './pages/About.jsx';
import Appointment from './pages/Appointment.jsx';
import Account from './pages/Account.jsx';
import Booking from './pages/Booking.jsx';
import Membership from './pages/Membership.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminEvents from './pages/AdminEvents.jsx';
import AdminBlog from './pages/AdminBlog.jsx';
import AdminNewsletter from './components/AdminNewsletter.jsx'; 
import AdminRoute from './lib/AdminRoute.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminAuditLogs from './components/AdminAuditLogs.jsx';

function App() {
  return (
    <>
      <Navbar />

      <main className="page-content">
        <div className="container mb-5">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/education" element={<Education />} />
            <Route path="/about" element={<About />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/account" element={<Account />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/membership" element={<Membership />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/audit"
              element={
                <AdminRoute>
                  <AdminAuditLogs />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <AdminEvents />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <AdminBlog />
                </AdminRoute>
              }
            />

            {/* Admin Education Hub */}
            <Route
              path="/admin/education"
              element={
                <AdminRoute>
                  <EducationAdmin />
                </AdminRoute>
              }
            />

            {/* 404 fallback */}
            <Route
              path="/admin/newsletter"  // Add this route
              element={
                <AdminRoute>
                  <AdminNewsletter />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
