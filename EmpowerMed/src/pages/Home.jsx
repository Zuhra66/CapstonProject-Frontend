import React from 'react';
// import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, useScroll, useTransform } from 'framer-motion';
import dianaImg from '../assets/dr.diana.png';
import blueberriesImg from '../assets/blueberries-wellness.jpg';
import arrowImg from '../assets/arrow-decoration.png';
import leafIcon from '../assets/leaf.png';
import flowerImg from '../assets/flower-icon.png'
import '../styles/Global.css';

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.9]);

  return (
    <main className="home-root" role="main">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content text-center px-3">
          <motion.h1
            className="hero-title display-font mb-4 pb-5"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              color: '#ffffff',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '2px',
              fontWeight: 200,
            }}
          >
            Start Your Wellness<br />Journey
          </motion.h1>
          
          <div className="d-flex justify-content-center gap-4 mt-4">
            <motion.a
              href="/membership"
              className="btn btn-primary"
              initial={{ opacity: 0, y: -40 }}
               animate={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.2, ease: 'easeOut', delay: 0.2 }
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{
                scale: 0.8,
                transition: { duration: 0.1 }
              }}
            >
              Become a Member
            </motion.a>

            <motion.a
              href="/appointment"
              className="btn btn-primary"
              initial={{ opacity: 0, y: -40 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.2, ease: 'easeOut', delay: 0.2 }
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{
                scale: 0.8,
                transition: { duration: 0.1 }
              }}
              
            >
              Book an Appointment
            </motion.a>
          </div>
        </div>
      </section>

      {/* About Section */}
          <section className="about-section">
            <div className="container">
              <div className="about-content">
                <div className="about-grid">
                  {/* Left side - Image */}
                  <motion.div 
                    className="about-image"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  >
                    <img src={dianaImg} alt="Dr. Diana Galvan" className="about-img"/>
                  </motion.div>

                  {/* Right side - Text Content */}
                  <motion.div 
                    className="about-text-content"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                  >
                    <h2 className="about-title">Dr. Diana Galvan</h2>
                    
                    <p className="about-description">
                      It all started with a <strong>passion to help people</strong>. Now, 
                      I am a <span style={{ color: 'var(--main-blue)', fontWeight: 600 }}>life coach</span> who 
                      focuses on helping people mentally, emotionally, physically, spiritually, and 
                      nutritionally by offering <span style={{ color: 'var(--main-blue)', fontWeight: 600 }}>affordable life-coaching</span>.
                    </p>

                    <div className="about-divider"></div>

                    <motion.a 
                      href="/about" 
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.a>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

      {/* Mission Section */}
      <section 
        className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-box">
              <motion.div
                className="mission-text"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <h2 className="mission-title">Your Partner in Total Wellness</h2>
                
                <div className="mission-icon">
                  <img src={leafIcon} alt="leaf icon" className="leaf-icon"/>
                </div>

                <p className="mission-description">
                  At <span className='custom-span'>EmpowerMEd</span>, we aim to help you <strong>achieve balance</strong> in <span className='custom-span'>mind</span>, <span className='custom-span'>body</span>, <span className="custom-span">spirit</span>, <span className='custom-span'>emotions</span>, and <span className='custom-span'>nutrition</span>. Our mission is to <strong>empower you</strong> with the tools to <strong>restore harmony</strong> and <strong>thrive</strong> in every aspect of your life.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Availability Section */}
      <section className="hours-section">
        <div className="container">
          <div className="hours-grid">
            {/* Left side - Hours */}
            <motion.div 
              className="hours-content"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <h2 className="hours-title">Hours & Availability</h2>
              
              <div className="hours-icon">
                <img src={flowerImg} alt="flower icon" className="flower-icon" />
              </div>

              <div className="hours-list">
                <div className="hours-item">
                  <span className="day">Monday</span>
                  <span className="time">9:00AM - 11:00AM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Tuesday</span>
                  <span className="time">9:00AM - 11:00AM</span>
                  <span className="label">All In Health</span>
                </div>
                <div className="hours-item">
                  <span className="day">Wednesday</span>
                  <span className="time">1:00PM - 5:00PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Thursday</span>
                  <span className="time">9:00AM - 12:00PM</span>
                  <span className="label">All In Health</span>
                </div>
                <div className="hours-item">
                  <span className="day">Friday</span>
                  <span className="time">9:00AM - 5:00PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Saturday</span>
                  <span className="time">9:00AM - 5:00PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sunday</span>
                  <span className="closed">Closed</span>
                </div>
              </div>
            </motion.div>

            {/* Right side - Circle Image */}
            <motion.div 
              className="hours-image"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <img src={arrowImg} alt="" className="arrow-decoration" />
              <div className="circle-image"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="locations-section">
        <div className="container">
          <div className="locations-grid">
            {/* Left side - Map */}
            <motion.div 
              className="locations-map"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50363.89434787654!2d-121.0018!3d37.6391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809ac672b28397f9%3A0x921f6aaa74197fdb!2sModesto%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Modesto & Turlock Location"
              ></iframe>
            </motion.div>

            {/* Right side - Location Info */}
            <motion.div 
              className="locations-content"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            >
              <h2 className="locations-title">Locations</h2>
              
              <div className="location-info">
                <h3 className="location-name">Modesto & Turlock</h3>
                <p className="location-phone">(209) 922-2007</p>
                <a href="mailto:empowermed.threeinternational.com" className="location-email">
                  empowermed.threeinternational.com
                </a>
                
                <a 
                  href="https://maps.google.com/?q=Modesto+Turlock+CA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="get-directions"
                >
                  Get Directions
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}