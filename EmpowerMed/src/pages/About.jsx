// src/pages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import doctorImg from '../assets/doctor.png';
import joinImg from '../assets/join.png';
import '../styles/Global.css';

export default function About() {
  const scrollVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <main className="page-root">

      {/* HERO */}
      <section
        className="hero-section"

      >
        <div className="hero-content text-center px-3">
          <motion.h1
            className="hero-title display-font mb-3 pb-3"
            style={{ fontFamily: 'var(--heading-font)', fontWeight: 'var(--fw-regular)' }}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            About EmpowerMEd
          </motion.h1>
          <motion.p
            className="body-font"
            style={{
              fontFamily: 'var(--body-font)',
              fontWeight: 'var(--fw-regular)',
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.9)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          >
            Holistic wellness for healthcare professionals and the communities they serve.
          </motion.p>
        </div>
      </section>

      {/* ABOUT DR. GALVAN */}
      <section className="about-section" style={{ paddingTop: '4.5rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="about-grid" style={{ alignItems: 'start' }}>
            <motion.div
              className="about-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scrollVariant}
              /* add a top margin so the image sits lower than the hero */
              style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center' }}
            >
              <img
                src={doctorImg}
                alt="Dr. Diana Galvan"
                className="about-img"
                style={{
                  maxWidth: '460px',      // slightly smaller to avoid overlap
                  width: '100%',
                  height: 'auto',
                  transform: 'translateY(0)', // keep natural placement
                  boxShadow: '0 10px 34px rgba(0,0,0,0.12)'
                }}
              />
            </motion.div>

            <motion.div
              className="about-text-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scrollVariant}
            >
              <h2
                className="about-title display-font"
                style={{ fontFamily: 'var(--heading-font)', fontWeight: 'var(--fw-bold)' }}
              >
                Dr. Diana Galvan
              </h2>

              <p
                className="about-description body-font"
                style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}
              >
                Dr. Diana Galvan is the Founder and Wellness Coach of <strong>EmpowerMEd</strong>, a holistic wellness organization dedicated to promoting the mental, emotional, and physical well-being of physicians, healthcare professionals, and the communities they serve. With over a decade of experience in medical education and behavioral science, Dr. Galvan has guided residents, faculty, and clinicians toward achieving balance, resilience, and long-term fulfillment in demanding healthcare environments.
              </p>

              <p
                className="about-description body-font"
                style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}
              >
                She earned her Doctorate in Education Leadership with a research focus on resident physician burnout and well-being and currently serves as Behavioral Science Faculty in Family Medicine. In addition, she holds a Master's in Rehabilitation Counseling and is completing her Licensed Professional Clinical Counselor (LPCC) credential.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMPANY INFO */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2
              className="about-title display-font"
              style={{ fontFamily: 'var(--heading-font)', fontWeight: 'var(--fw-bold)' }}
            >
              The Company
            </h2>

            <h3
              className="about-description body-font"
              style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-semi-bold)' }}
            >
              Mission Statement
            </h3>
            <p className="body-font" style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}>
              To empower individuals, especially healthcare professionals, to achieve sustainable well-being by offering compassionate, culturally competent, and integrative care rooted in education, coaching, and advocacy.
            </p>

            <h3
              className="about-description body-font"
              style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-semi-bold)' }}
            >
              Vision
            </h3>
            <p className="body-font" style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}>
              Build a lasting impact by making wellness, mental health, and leadership programs more accessible. Focus on empowering providers and leaders and shifting perspectives from burnout to a balanced approach to life, fostering healing and positive change.
            </p>

            <h3
              className="about-description body-font"
              style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-semi-bold)' }}
            >
              Company Type
            </h3>
            <p className="body-font" style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}>
              EmpowerMEd is structured as a Limited Liability Company (LLC) and offers programs to empower and educate healthcare providers and future leaders on resilience and wellness. There are plans to establish a nonprofit arm dedicated to underserved populations, promoting healthcare initiatives, addressing disparities, expanding access to care, and fostering community well-being.
            </p>
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2
              className="about-title display-font"
              style={{ fontFamily: 'var(--heading-font)', fontWeight: 'var(--fw-bold)' }}
            >
              Who We Are
            </h2>
            <p className="body-font" style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)', lineHeight: 1.7 }}>
              <strong>Founder: Dr. Diana Galvan</strong><br />
              Dr. Galvan is the oldest daughter of five children from a loving Middle Eastern and Hispanic family. As the eldest, she helped raise her younger siblings, shaping her deep sense of responsibility, compassion, and resilience. Raised in San Mateo, she pursued her Master’s degree in Rehabilitation Counseling in San Diego. She now teaches as a wellness instructor in the Psychology Department at Stanislaus State University. A mother of two, she enjoys traveling with her children, nurturing their curiosity and dreams. Recently, she served on a medical brigade in El Salvador, providing care for over 4,000 patients and offering rehabilitation counseling to more than 200 individuals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* JOIN CTA */}
      <section className="hours-section">
        <div className="container hours-grid">
          <motion.div
            className="hours-image"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              borderRadius: '50%',
              maxWidth: '400px',
              maxHeight: '400px',
              margin: '0 auto'
            }}
          >
            <img
              src={joinImg}
              alt="Join EmpowerMEd"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
          <motion.div
            className="hours-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2 className="hours-title display-font" style={{ fontFamily: 'var(--heading-font)', fontWeight: 'var(--fw-bold)' }}>
              Join the Wellness Movement
            </h2>
            <p className="body-font" style={{ fontFamily: 'var(--body-font)', fontWeight: 'var(--fw-regular)' }}>
              EmpowerMEd provides the tools, coaching, and support for healthcare professionals and communities to achieve sustainable well-being. Discover programs tailored for your balance, resilience, and growth.
            </p>
            <a href="/services" className="btn btn-primary mt-4">Get Started Today</a>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
