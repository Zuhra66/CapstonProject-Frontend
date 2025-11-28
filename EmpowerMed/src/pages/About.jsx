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
      <section className="hero-section">
        <div className="hero-content text-center px-3">
          <motion.h1
            className="hero-title display-font mb-3 pb-3"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            About EmpowerMEd
          </motion.h1>
          <motion.p
            className="body-font"
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.9)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          >
            Healing the healers and empowering individuals to thrive in every dimension of wellness
          </motion.p>
        </div>
      </section>

      {/* ABOUT EMPOWERMED */}
      <section className="about-section" >
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >

            <p className="about-description body-font">
              EmpowerMEd was created with one mission: to heal the healers and empower individuals and families to thrive in every dimension of wellness.
            </p>
            <p className="about-description body-font">
              Our work integrates clinical expertise, coaching strategies, and spiritual grounding to help you overcome burnout, break cycles, and step into the life God designed for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MEET DR. GALVAN - Side by Side Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-main-grid">
            <motion.div
              className="about-image-main"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scrollVariant}
            >
              <img
                src={doctorImg}
                alt="Dr. Diana Galvan"
                className="about-img2"
              />
            </motion.div>

            <motion.div
              className="about-text-block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scrollVariant}
            >
              <h2 className="about-title display-font">
                MEET THE FOUNDER – DR. DIANA GALVÁN
              </h2>

              <div className="text-content">
                <p className="about-description body-font">
                  Dr. Diana Galván is the Founder and Wellness Coach of EmpowerMEd, a holistic wellness organization dedicated to promoting the mental, emotional, and physical well-being of physicians, healthcare professionals, and the communities they serve. 
                </p>

                <p className="about-description body-font">
                  With over a decade of experience in medical education and behavioral science, Dr. Galván has guided residents, faculty, and clinicians toward achieving balance, resilience, and long-term fulfillment in demanding healthcare environments.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EXPERTISE SECTION - Full Width Below */}
      <section className="about-section" style={{ paddingTop: '0', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <div className="expertise-section">
              <h3 className="philosophy-title body-font">Areas of Expertise</h3>
              <div className="expertise-grid">
                <div className="expertise-item">Physician wellness</div>
                <div className="expertise-item">Burnout prevention</div>
                <div className="expertise-item">Life coaching & empowerment</div>
                <div className="expertise-item">Trauma-informed care</div>
                <div className="expertise-item">Career development</div>
                <div className="expertise-item">Family and parenting support</div>
                <div className="expertise-item">Bilingual (English/Spanish) support</div>
                <div className="expertise-item">Faith-centered guidance</div>
              </div>
            </div>

            <blockquote className="quote-block">
              "My passion is helping people reconnect with themselves, their calling, and their God-given purpose."
              <cite>— Dr. Diana Galván</cite>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* BACKGROUND & EDUCATION */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2 className="about-title display-font">
              BACKGROUND & EDUCATION
            </h2>
            
            <p className="about-description body-font">
              Dr. Galván earned her Doctorate in Education Leadership with a research focus on resident physician burnout and well-being and currently serves as Behavioral Science Faculty in Family Medicine. In addition, she holds a Master's in Rehabilitation Counseling and is completing her Licensed Professional Clinical Counselor (LPCC) credential.
            </p>

            <p className="about-description body-font">
              Dr. Galván is the oldest daughter of five children from a loving Middle Eastern and Hispanic family. As the eldest, she helped raise her younger siblings, shaping her deep sense of responsibility, compassion, and resilience. Raised in San Mateo, she pursued her Master's degree in Rehabilitation Counseling in San Diego. She now teaches as a wellness instructor in the Psychology Department at Stanislaus State University.
            </p>

            <p className="about-description body-font">
              A mother of two, she enjoys traveling with her children, nurturing their curiosity and dreams. Recently, she served on a medical brigade in El Salvador, providing care for over 4,000 patients and offering rehabilitation counseling to more than 200 individuals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2 className="about-title display-font">
              OUR APPROACH
            </h2>
            
            <div className="approach-grid">
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Trauma-Informed</h4>
                  <p>Understanding and addressing the impact of trauma with sensitivity and care</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Strength-Based</h4>
                  <p>Building on your existing strengths and resilience</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Evidence-Driven</h4>
                  <p>Utilizing proven methods and clinical expertise</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Spiritually Anchored</h4>
                  <p>Integrating faith and spiritual grounding in healing</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Client-Centered</h4>
                  <p>Tailoring approaches to your unique needs and goals</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">✔</span>
                <div className="approach-text">
                  <h4>Compassionate Care</h4>
                  <p>Providing confidential, empathetic support</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollVariant}
          >
            <h2 className="about-title display-font">
              MISSION & VISION
            </h2>

            <div className="mission-vision-grid">
              <div className="mission-vision-item">
                <h3 className="philosophy-title body-font">Our Mission</h3>
                <p className="body-font">
                  To empower individuals, especially healthcare professionals, to achieve sustainable well-being by offering compassionate, culturally competent, and integrative care rooted in education, coaching, and advocacy.
                </p>
              </div>
              
              <div className="mission-vision-item">
                <h3 className="philosophy-title body-font">Our Vision</h3>
                <p className="body-font">
                  Build a lasting impact by making wellness, mental health, and leadership programs more accessible. Focus on empowering providers and leaders and shifting perspectives from burnout to a balanced approach to life, fostering healing and positive change.
                </p>
              </div>
            </div>

            <div className="company-info">
              <h3 className="philosophy-title body-font">Company Structure</h3>
              <p className="body-font">
                EmpowerMEd is structured as a Limited Liability Company (LLC) and offers programs to empower and educate healthcare providers and future leaders on resilience and wellness. There are plans to establish a nonprofit arm dedicated to underserved populations, promoting healthcare initiatives, addressing disparities, expanding access to care, and fostering community well-being.
              </p>
            </div>
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
            <h2 className="hours-title display-font">
              Join the Wellness Movement
            </h2>
            <p className="body-font">
              EmpowerMEd provides the tools, coaching, and support for healthcare professionals and communities to achieve sustainable well-being. Discover programs tailored for your balance, resilience, and growth.
            </p>
            <p className="body-font">
              Dr. Galván is committed to restoring balance and purpose for individuals who serve, teach, lead, and care for others.
            </p>
            <a href="/services" className="btn btn-primary mt-4">Get Started Today</a>
          </motion.div>
        </div>
      </section>

    </main>
  );
}