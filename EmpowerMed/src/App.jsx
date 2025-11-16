import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Events from './pages/Events.jsx';
import Products from './pages/Products.jsx';
import Blog from './pages/Blog.jsx';
import Education from './pages/Education.jsx';
import About from './pages/About.jsx';
import Appointment from './pages/Appointment.jsx';
import Account from './pages/Account.jsx';
<<<<<<< HEAD
import Booking from './pages/Booking.jsx';
import Services from './pages/Services.jsx';
=======
import AdminDashboard from './pages/AdminDashboard.jsx';
>>>>>>> 8b38515e5a8a0510b55b11665764e075fafab12a

function App() {
  return (
    <>
      <Navbar />
<<<<<<< HEAD
      <div className="container mt-4 mb-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/education" element={<Education />} />
          <Route path="/about" element={<About />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
=======
      <main className="page-content">
        <div className="container mb-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/education" element={<Education />} />
            <Route path="/about" element={<About />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/account" element={<Account />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>
>>>>>>> 8b38515e5a8a0510b55b11665764e075fafab12a
      <Footer />
    </>
  );
}

export default App;




