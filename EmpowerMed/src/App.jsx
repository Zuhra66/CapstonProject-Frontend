import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Membership from './pages/Membership';
import Products from './pages/Products';
import Blog from './pages/Blog';
import Education from './pages/Education';
import Events from './pages/Events';
import About from './pages/About';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import './styles/custom-bootstrap.scss';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [data, setData] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  // Example: Fetch profile data if authenticated
  useEffect(() => {
    fetch(`${API_URL}/auth/profile`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(setData)
      .catch(err => console.error("Error fetching profile data:", err));
  }, []);

  // Get CSRF token
  useEffect(() => {
    fetch(`${API_URL}/csrf-token`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to get CSRF token');
        return res.json();
      })
      .then(tokenData => {
        setCsrfToken(tokenData.csrfToken);
        console.log("CSRF token:", tokenData.csrfToken);
      })
      .catch(err => console.error("Error getting CSRF token:", err));
  }, []);

  // Example: Sending secure POST request
  const sendSecureData = () => {
    if (!csrfToken) return;
    fetch(`${API_URL}/auth/signup`, {   // <-- use a real backend route
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email: 'test@example.com', password: '123456' })
    })
      .then(res => res.json())
      .then(response => console.log("Response:", response))
      .catch(err => console.error("Error posting secure data:", err));
  };

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/education" element={<Education />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      <Footer />
    </Router>
  );
}

export default App;
