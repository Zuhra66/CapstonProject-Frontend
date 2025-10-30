import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Membership from './pages/Membership';
import Products from './pages/Products';
import Blog from './pages/Blog';
import Education from './pages/Education';
import About from './pages/About';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [data, setData] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/endpoint`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(tokenData => {
        setCsrfToken(tokenData.csrfToken);
        console.log("CSRF token:", tokenData.csrfToken);
      })
      .catch(err => console.error("Error getting CSRF token:", err));
  }, []);

  const sendSecureData = () => {
    if (!csrfToken) return;
    fetch(`${API_URL}/secure`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ message: "This is secure!" })
    })
      .then(res => res.json())
      .then(response => console.log("Response:", response))
      .catch(err => console.error("Error posting data:", err));
  };

  return (
    <Router>
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
