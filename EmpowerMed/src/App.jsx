import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth0 } from '@auth0/auth0-react';
import useAuthFetch from './hooks/useAuthFetch';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Membership from './pages/Membership.jsx';
import Products from './pages/Products.jsx';
import Blog from './pages/Blog.jsx';
import Education from './pages/Education.jsx';
import About from './pages/About.jsx';
import Appointment from './pages/Appointment.jsx';
import Account from './pages/Account.jsx';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (isAuthenticated) {
      authFetch('/auth/sync', { method: 'POST' })
        .then(() => console.log('User synced successfully'))
        .catch((err) => console.error('User sync error:', err));
    }
  }, [isAuthenticated]);

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/education" element={<Education />} />
          <Route path="/about" element={<About />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
