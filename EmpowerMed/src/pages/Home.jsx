// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import jasmineImg from '../assets/jasmine.png';
import blueberriesImg from '../assets/blueberries-wellness.jpg';
import arrowImg from '../assets/arrow-decoration.png';
import leafIcon from '../assets/leaf.png';
import flowerImg from '../assets/flower-icon.png';
import '../styles/Global.css';
import '../styles/WellnessDNAAnalyzer.css';
import lightImg from '../assets/light.png';

// Main Home Component
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3176.952357579847!2d-120.996583924294!3d37.63910037207168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80903e2e2a5bffff%3A0x5b5c5b5c5b5c5b5c!2s3600%20Sisk%20Rd%2C%20Modesto%20CA%2095356!5e0!3m2!1sen!2sus!4v1234567890";

  return (
    <main className="home-root" role="main">
      <section className="hero-section">
        <div className="hero-content text-center px-3">
          <motion.h1
            className="hero-title display-font mb-3 pb-3"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            Start Your Wellness<br />Journey
          </motion.h1>
          <div className="hero-buttons">
            <motion.a
              href="/membership"
              className="btn btn-primary"
              animate={{ opacity: 1, y: 0, transition: { duration: 1.2, ease: 'easeOut', delay: 0.2 } }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              Become a Member
            </motion.a>
            <motion.a
              href="/booking"
              className="btn btn-secondary"
              animate={{ opacity: 1, y: 0, transition: { duration: 1.2, ease: 'easeOut', delay: 0.3 } }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              Book an Appointment
            </motion.a>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <motion.div
              className="about-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <h2 className="about-title display-font">WELCOME TO EMPOWERMED</h2>
              <p className="about-subtitle body-font">
                Transforming wellness from the inside out:
              </p>
              <p className="about-subtitle body-font">
                Mentally, Emotionally, Spiritually, Physically, and Nutritionally
              </p>              
            </motion.div>

            <div className="about-main-grid">
              <motion.div
                className="about-image-main"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <img src={jasmineImg} alt="Wellness and coaching" className="about-img" />
              </motion.div>

              <motion.div
                className="about-text-block"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="text-content">
                  <p className="about-description body-font">
                    EmpowerMEd is a holistic wellness and coaching practice dedicated to helping physicians, 
                    professionals, and families find balance, clarity, and renewal.
                  </p>
                  <p className="about-description body-font">
                    Founded by Dr. Diana Galván, we combine evidence-based strategies, 
                    faith-centered encouragement, and personalized guidance to promote healing and lasting change. 
                    Whether you are seeking emotional clarity, career direction, lifestyle transformation, 
                    or resilience against burnout, EmpowerMEd is here to support you every step of the way.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="philosophy-section">
              <div className="philosophy-grid">
                <motion.div
                  className="philosophy-content"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                >
                  <h3 className="philosophy-title body-font">OUR PHILOSOPHY</h3>
                  <div className="philosophy-list">
                    <div className="philosophy-item">
                      <span className="philosophy-icon">💛</span>
                      <div className="philosophy-text">
                        <h4>Whole-Person Wellness</h4>
                        <p>Addressing all aspects of your wellbeing - mind, body, and spirit</p>
                      </div>
                    </div>
                    <div className="philosophy-item">
                      <span className="philosophy-icon">💛</span>
                      <div className="philosophy-text">
                        <h4>Faith-Led Guidance</h4>
                        <p>Evidence-based strategies with spiritual foundation and encouragement</p>
                      </div>
                    </div>
                    <div className="philosophy-item">
                      <span className="philosophy-icon">💛</span>
                      <div className="philosophy-text">
                        <h4>Empowering Coaching</h4>
                        <p>Support that builds confidence and independence, not dependency</p>
                      </div>
                    </div>
                    <div className="philosophy-item">
                      <span className="philosophy-icon">💛</span>
                      <div className="philosophy-text">
                        <h4>Safe Space</h4>
                        <p>Where every story is heard, valued, and respected</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="philosophy-image"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                >
                  <img src={lightImg} alt="Wellness light" className="circle-img" />
                </motion.div>
              </div>
            </div>

            <motion.div
              className="about-cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
            >
              <motion.a
                href="/about"
                className="btn btn-primary body-font"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More About Our Approach
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="dna-analyzer-section">
        <div className="container">
          <div className="dna-header">
            <motion.h2
              className="dna-title display-font"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Discover Your Unique
              <span className="gradient-text"> Wellness DNA</span>
            </motion.h2>
            <p className="dna-subtitle body-font">
              Unlock the blueprint of your complete wellbeing through our revolutionary program
            </p>
          </div>

          <motion.div
            className="dna-results-preview"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="preview-title">Our Five Personalized Wellness Strands</h3>
            <div className="preview-grid">
              <div className="preview-card">
                <div className="preview-icon">🧠</div>
                <h4>Mental Patterns</h4>
                <p>Your unique thought processes and stress responses</p>
              </div>
              <div className="preview-card">
                <div className="preview-icon">💖</div>
                <h4>Emotional Rhythm</h4>
                <p>How you process and express emotions naturally</p>
              </div>
              <div className="preview-card">
                <div className="preview-icon">⚡</div>
                <h4>Energy Flow</h4>
                <p>Your natural energy peaks and restoration needs</p>
              </div>
              <div className="preview-card">
                <div className="preview-icon">🌌</div>
                <h4>Spiritual Connection</h4>
                <p>Your innate sense of purpose and inner peace</p>
              </div>
              <div className="preview-card">
                <div className="preview-icon">🌿</div>
                <h4>Nutritional Code</h4>
                <p>What your body truly needs to thrive</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-box" style={{ backgroundImage: `url(${blueberriesImg})` }}>
              <motion.div
                className="mission-text"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <h2 className="mission-title display-font">Your Partner in Total Wellness</h2>
                <div className="mission-icon">
                  <img src={leafIcon} alt="leaf icon" className="leaf-icon" />
                </div>
                <p className="mission-description body-font">
                  At <span className='brand-name'>EmpowerMEd</span>, we aim to help you <strong>achieve balance</strong> in
                  <span className='highlight'> mind</span>, <span className='highlight'>body</span>,
                  <span className="highlight"> spirit</span>, <span className='highlight'>emotions</span>, and
                  <span className='highlight'> nutrition</span>. Our mission is to <strong>empower you</strong> with the tools to
                  <strong> restore harmony</strong> and <strong>thrive</strong> in every aspect of your life.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="hours-section">
        <div className="container">
          <div className="hours-grid">
            <motion.div
              className="hours-content"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <h2 className="hours-title display-font">Hours & Availability</h2>
              <div className="hours-icon">
                <img src={flowerImg} alt="flower icon" className="flower-icon" />
              </div>
              <div className="hours-list">
                <div className="hours-item body-font">
                  <span className="day">Monday</span>
                  <span className="time">9:00AM - 11:00AM</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Tuesday</span>
                  <span className="time">9:00AM - 11:00AM</span>
                  <span className="label">All In Health</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Wednesday</span>
                  <span className="time">1:00PM - 5:00PM</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Thursday</span>
                  <span className="time">9:00AM - 12:00PM</span>
                  <span className="label">All In Health</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Friday</span>
                  <span className="time">9:00AM - 5:00PM</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Saturday</span>
                  <span className="time">9:00AM - 5:00PM</span>
                </div>
                <div className="hours-item body-font">
                  <span className="day">Sunday</span>
                  <span className="closed">Closed</span>
                </div>
              </div>
            </motion.div>

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

      <section className="locations-section">
        <div className="container">
          <div className="locations-grid">
            <motion.div
              className="locations-map"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="EmpowerMEd Location - 3600 Sisk Rd Suite 2D, Modesto CA"
              ></iframe>
            </motion.div>
            <motion.div
              className="locations-content"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            >
              <h2 className="locations-title display-font">Our Location</h2>
              <div className="location-info">
                <h3 className="location-name body-font">Modesto Office</h3>
                <p className="location-address body-font">
                  3600 Sisk Rd, Suite 2D<br />Modesto, CA 95356
                </p>
                <p className="location-phone body-font">(209) 922-2007</p>
                <a href="mailto:EmpowerMEddev@gmail.com" className="location-email body-font">
                  EmpowerMEddev@gmail.com
                </a>
                <a
                  href="https://maps.google.com/?q=3600+Sisk+Rd+Suite+2D+Modesto+CA+95356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="get-directions body-font"
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