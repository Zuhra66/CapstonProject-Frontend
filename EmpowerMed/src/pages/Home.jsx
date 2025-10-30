import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImg from '../assets/hero-placeholder.jpg';
import '../styles/theme.css';
import '../styles/layout.css';
import '../styles/buttons.css';

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.9]);

  return (
    <main className="home-root" role="main">
      {/* HERO */}
      <section
        className="hero-section text-light d-flex flex-column justify-content-center align-items-center position-relative"
        style={{
          backgroundColor: '#EDE8F5',
          minHeight: '100vh',
          overflow: 'hidden',
          position: 'relative',
          paddingTop: '120px', 
        }}
      >
        <Container fluid className="text-center mb-4" style={{ zIndex: 2 }}>
          <motion.h1
            className="hero-title display-font mb-4"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              color: '#3D52A0',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '2px',
            }}
          >
            Renew • Restore • Thrive
          </motion.h1>
        </Container>

        <Container>
          <Row className="align-items-start justify-content-center">
            <Col md={6} className="d-flex flex-column justify-content-start">
              <motion.p
                className="lead-para body-font mb-4"
                style={{
                  color: '#3D52A0',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  maxWidth: '90%',
                  marginTop: '0.5rem',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4 }}
              >
                EmpowerMEd blends modern clinical care and mindful wellness to help
                 you feel your best — personalized programs, trusted practitioners
                , and a community that supports you. Our core mission focuses on 
                healing and supporting healthcare professionals, "the healers," 
                while empowering communities. We aim to address comprehensive aspects
                of health, mental, emotional, spiritual, nutritional, and physical to 
                foster overall wellness.
              </motion.p>

              <div className="hero-ctas d-flex flex-wrap gap-3 mt-3">
                <Button
                  href="/membership"
                  style={{
                    backgroundColor: '#7091E6',
                    border: 'none',
                    color: '#EDE8F5',
                    fontWeight: 600,
                    padding: '0.9rem 2rem',
                    borderRadius: '10px',
                    boxShadow: '0 6px 15px rgba(61, 82, 160, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#3D52A0')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#7091E6')}
                >
                  Become a Member
                </Button>

                <motion.a
                  href="/appointment"
                  style={{
                    backgroundColor: '#7091E6',
                    border: 'none',
                    color: '#EDE8F5',
                    fontWeight: 600,
                    padding: '0.9rem 2rem',
                    borderRadius: '10px',
                    boxShadow: '0 6px 15px rgba(61, 82, 160, 0.3)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none', // remove underline
                    display: 'inline-block',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#3D52A0')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#7091E6')}
                >
                  Book an Appointment
                </motion.a>
              </div>
            </Col>

            <Col md={6} className="hero-media-col text-center">
              <motion.div
                className="hero-media"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.3, ease: 'easeOut' }}
              >
                <img
                  src={heroImg}
                  alt="Serene wellness scene"
                  className="img-fluid rounded-4 shadow-lg hero-img"
                  style={{
                    border: '6px solid #ADBBDA',
                    maxHeight: '80vh',
                    objectFit: 'cover',
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SERVICES */}
      <section className="services-section py-5" style={{ backgroundColor: '#EDE8F5' }}>
        <Container>
          <h2
            className="section-title text-center display-font mb-3"
            style={{ color: '#3D52A0' }}
          >
            Our Services
          </h2>
          <p
            className="section-sub text-center mb-5 body-font"
            style={{ color: '#7091E6' }}
          >
            Designed to support mind, body, and lifestyle — starting where you are.
          </p>

          <Row className="g-4">
            {[
              { title: 'Primary Care & Telehealth', desc: 'Comprehensive care with continuity and convenience.' },
              { title: 'Mental Wellness & Therapy', desc: 'Evidence-based therapy and community support.' },
              { title: 'Nutrition Management', desc: 'Personalized nutrition plans and coaching.' },
              { title: 'Holistic Treatments', desc: 'Massage, acupuncture, and restorative therapies.' },
            ].map((s, i) => (
              <Col md={6} lg={3} key={i}>
                <motion.article
                  className="service-card p-4 h-100 rounded-4 shadow-sm"
                  style={{
                    backgroundColor: '#ADBBDA',
                    color: '#3D52A0',
                    border: '2px solid #8697C4',
                    transition: 'transform 0.3s ease',
                  }}
                  whileHover={{ scale: 1.04 }}
                >
                  <h3
                    className="service-title body-font mb-2"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: '500',
                    }}
                  >
                    <span style={{ color: '#7091E6', fontSize: '1.5rem', lineHeight: '1' }}>•</span>
                    {s.title}
                  </h3>
                  <p className="service-desc mb-4">{s.desc}</p>
                  <Button
                    href="/products"
                    style={{
                      backgroundColor: '#7091E6',
                      border: 'none',
                      color: '#EDE8F5',
                      fontWeight: 500,
                      padding: '0.6rem 1.3rem',
                      borderRadius: '8px',
                    }}
                  >
                    Learn More
                  </Button>
                </motion.article>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* PROMO */}
      <section
        className="promo-section py-5 text-light"
        style={{ backgroundColor: '#3D52A0' }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="promo-title display-font mb-2">Join Our Wellness Community</h3>
              <p className="promo-sub body-font mb-0" style={{ color: '#EDE8F5' }}>
                Members receive guided plans, exclusive content, and priority booking.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                href="/signup"
                style={{
                  backgroundColor: '#EDE8F5',
                  color: '#3D52A0',
                  border: 'none',
                  fontWeight: 600,
                  padding: '0.85rem 1.75rem',
                  borderRadius: '10px',
                }}
              >
                Sign Up — It’s Free
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}
