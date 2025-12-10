// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";

// Modal Component (inside same file)
function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Newsletter Success Modal Component
function NewsletterSuccessModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }} onClick={onClose}>
      <div className="modal-content" style={{
        background: 'var(--light-purple)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '2px solid var(--main-blue)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            marginBottom: '1.5rem',
            color: 'var(--main-blue)',
            fontSize: '3rem'
          }}>
            ✓
          </div>
          <h3 style={{
            fontFamily: 'var(--heading-font)',
            color: 'var(--main-blue)',
            marginBottom: '1rem',
            fontSize: '1.8rem'
          }}>
            Thank You!
          </h3>
          <p style={{
            fontFamily: 'var(--body-font)',
            color: 'var(--dark-text)',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {message}
          </p>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--main-blue)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontFamily: 'var(--body-font)',
              fontWeight: 'var(--fw-semi-bold)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'var(--light-blue)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'var(--main-blue)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Newsletter Error Modal Component
function NewsletterErrorModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }} onClick={onClose}>
      <div className="modal-content" style={{
        background: 'var(--light-purple)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '2px solid #FF6B6B',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            marginBottom: '1.5rem',
            color: '#FF6B6B',
            fontSize: '3rem'
          }}>
            ⚠️
          </div>
          <h3 style={{
            fontFamily: 'var(--heading-font)',
            color: '#FF6B6B',
            marginBottom: '1rem',
            fontSize: '1.8rem'
          }}>
            Oops!
          </h3>
          <p style={{
            fontFamily: 'var(--body-font)',
            color: 'var(--dark-text)',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {message}
          </p>
          <button 
            onClick={onClose}
            style={{
              background: '#FF6B6B',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontFamily: 'var(--body-font)',
              fontWeight: 'var(--fw-semi-bold)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#FF5252';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#FF6B6B';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Footer Component
export default function Footer() {
  const [email, setEmail] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

// In Footer.jsx, update the handleNewsletterSubmit function:
const handleNewsletterSubmit = async (e) => {
  e.preventDefault();
  
  if (!email) {
    setModalMessage("Please enter your email address");
    setIsErrorModalOpen(true);
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setModalMessage("Please enter a valid email address");
    setIsErrorModalOpen(true);
    return;
  }
  
  setIsLoading(true);
  
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    
    const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        name: '' 
      }),
    });

    if (response.ok) {
      const result = await response.json();
      setEmail('');
      
      if (result.verified) {
        // Already verified and subscribed
        setModalMessage("You're already subscribed to our newsletter!");
        setIsSuccessModalOpen(true);
      } else {
        // Needs verification
        setModalMessage("Thank you! Please check your email to confirm your subscription.");
        setIsSuccessModalOpen(true);
      }
    } else {
      const errorData = await response.json();
      setModalMessage(errorData.message || "Subscription failed. Please try again.");
      setIsErrorModalOpen(true);
    }
  } catch (error) {
    console.error("Newsletter error:", error);
    setModalMessage("Network error. Please check your connection and try again.");
    setIsErrorModalOpen(true);
  } finally {
    setIsLoading(false);
  }
};

  const handleLegalClick = (e, modalType) => {
    e.preventDefault();
    if (modalType === 'terms') {
      setIsTermsOpen(true);
    } else {
      setIsPrivacyOpen(true);
    }
  };

  return (
    <>
      <footer className={styles.footerSection}>
        <div className={styles.footerContent}>
          {/* Left side - Branding & Navigation */}
          <div className={styles.footerLeft}>
            <h3 className={styles.footerBrand}>EmpowerMEd</h3>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <Link to="/">Home</Link>
              <Link to="/services">Services</Link>
              <Link to="/products">Products</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/education">Educational Hub</Link>
              <Link to="/events">Events</Link>
              <Link to="/about">About</Link>
            </nav>
            <div className={styles.footerSocial}>
              <a href="mailto:EmpowerMEddev@gmail.com" aria-label="Email us">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/empowermed2025/?igsh=NTc4MTIwNjQ2YQ%3D%3D#" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61579225749042" target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right side - Newsletter & Copyright */}
          <div className={styles.footerRight}>
            <div className={styles.newsletter}>
              <h4 className={styles.newsletterTitle}>Stay in the loop</h4>
              <p className={styles.newsletterDescription}>
                Get wellness tips and updates 
              </p>
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  aria-label="Email for newsletter"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className={styles.newsletterButton}
                  disabled={isLoading}
                  style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                  {isLoading ? 'Subscribing...' : 'Sign Up'}
                </button>
              </form>
            </div>
            <div className={styles.footerBottom}>
              <p className={styles.footerCopyright}>
                © {new Date().getFullYear()} EmpowerMEd LLC. All rights reserved.
              </p>
              <div className={styles.footerLegal}>
                <a 
                  href="/privacy" 
                  onClick={(e) => handleLegalClick(e, 'privacy')}
                  className={styles.legalLink}
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms" 
                  onClick={(e) => handleLegalClick(e, 'terms')}
                  className={styles.legalLink}
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Newsletter Success Modal */}
      <NewsletterSuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)}
        message={modalMessage}
      />

      {/* Newsletter Error Modal */}
      <NewsletterErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)}
        message={modalMessage}
      />

      {/* Terms of Service Modal */}
      <Modal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)}
        title="Terms and Conditions"
      >
        <div className={styles.modalText}>
          <p>
            <strong>Welcome to EmpowerMEd Wellness ("Company," "we," "our," "us").</strong> 
            These Terms and Conditions ("Terms") govern your use of our website, 
            https://www.empowermedwellness.com/ ("Site"), and all services, programs, 
            products, and content offered by EmpowerMEd Wellness (collectively, the "Services"). 
            By accessing or using our Site or Services, you agree to be bound by these Terms. 
            If you do not agree, please do not use the Site or Services.
          </p>

          <h3>1. Business Information</h3>
          <p>
            EmpowerMEd Wellness is a professional coaching and wellness organization located 
            virtually and at 3600 Sisk Road, Suite 2D, Modesto, CA, USA. Our mission is to 
            empower physicians, healthcare professionals, and individuals through mental, 
            physical, emotional, spiritual, and nutritional wellness.
          </p>

          <h3>2. Use of the Site and Services</h3>
          <p>
            You agree to use the Site and Services only for lawful purposes and in accordance 
            with these Terms. You may not use the Site:
          </p>
          <ul>
            <li>In any way that violates applicable laws or regulations.</li>
            <li>To exploit, harm, or attempt to exploit or harm others, including minors.</li>
            <li>To transmit any unsolicited or unauthorized advertising or promotional material.</li>
          </ul>
          <p>
            We reserve the right to refuse service, terminate accounts, or remove content at our discretion.
          </p>

          <h3>3. Coaching, Counseling, and Educational Services Disclaimer</h3>
          <p>
            The information and services provided by EmpowerMEd Wellness are for educational, 
            informational, and coaching purposes only. They are not intended to diagnose, treat, 
            or replace medical or psychological care from a licensed professional. Participation 
            in coaching or educational sessions does not establish a therapist-client or 
            doctor-patient relationship.
          </p>

          <h3>4. Payment Terms</h3>
          <p>
            All payments for services are due at the time of booking unless otherwise stated. 
            EmpowerMEd Wellness accepts Venmo and Zelle as approved payment methods. Refunds 
            are not available after services have been rendered. Any disputes must be submitted 
            in writing within 10 business days of the transaction.
          </p>

          <h3>5. Intellectual Property Rights</h3>
          <p>
            All content on this Site, including text, graphics, logos, documents, videos, 
            and other materials, are the intellectual property of EmpowerMEd Wellness and 
            protected under applicable copyright and trademark laws. You may not reproduce, 
            distribute, or create derivative works from our materials without prior written consent.
          </p>

          <h3>6. Confidentiality</h3>
          <p>
            EmpowerMEd Wellness respects the confidentiality of all clients. Any personal 
            information shared during coaching, counseling, or educational sessions will 
            remain confidential unless disclosure is required by law (e.g., harm to self 
            or others, abuse, or court order).
          </p>

          <h3>7. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, EmpowerMEd Wellness, its owner 
            (Dr. Diana Galván), employees, and affiliates shall not be liable for any 
            direct, indirect, incidental, or consequential damages resulting from the 
            use or inability to use the Site or Services. You agree to use the Site 
            and Services at your own risk.
          </p>

          <h3>8. Third-Party Links</h3>
          <p>
            Our Site may contain links to third-party websites. These are provided for 
            convenience only. EmpowerMEd Wellness has no control over the content or 
            practices of third-party sites and assumes no responsibility for them. 
            Accessing such sites is at your own risk.
          </p>

          <h3>9. Modifications to the Terms</h3>
          <p>
            We may update or modify these Terms at any time without prior notice. 
            Changes will be effective upon posting on this page. Continued use of 
            the Site or Services constitutes your acceptance of the revised Terms.
          </p>

          <h3>10. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws 
            of the State of California, without regard to its conflict of law principles. 
            Any legal action or proceeding shall be brought exclusively in the courts 
            located in Stanislaus County, California.
          </p>

          <h3>11. Contact Information</h3>
          <p>
            If you have any questions about these Terms, please contact:<br />
            <strong>EmpowerMEd Wellness</strong><br />
            Attn: Dr. Diana Galván, Founder and Wellness Coach<br />
            Email: EmpowerMEddev@gmail.com<br />
            Address: 3600 Sisk Road, Suite 2D, Modesto, CA, USA
          </p>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
            <strong>EmpowerMEd Wellness © All Rights Reserved</strong>
          </p>
        </div>
        <button 
          className={styles.acknowledgeButton}
          onClick={() => setIsTermsOpen(false)}
        >
          I Understand and Acknowledge
        </button>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)}
        title="Privacy Policy"
      >
        <div className={styles.modalText}>
          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <strong>Effective Date: November 2025</strong><br />
            <strong>EmpowerMEd Wellness</strong><br />
          </p>

          <h3>1. Introduction</h3>
          <p>
            Welcome to EmpowerMEd Wellness! Your privacy is very important to us. 
            This policy explains how we collect, use, and protect your information 
            when you visit our website, book services, or purchase products. By using 
            this website, you agree to the terms described below.
          </p>

          <h3>2. Information We Collect</h3>
          <p>
            We collect only what's needed to provide you with quality wellness and 
            coaching services, including:
          </p>
          <ul>
            <li><strong>Contact details:</strong> your name, email address, and phone number.</li>
            <li><strong>Payment details:</strong> processed securely through third-party services like Zelle, Venmo, Cherry, or HSA/FSA. We do not store or process your full payment information directly.</li>
            <li><strong>Health and wellness information:</strong> only what you voluntarily share during sessions, forms, or consultations to help personalize your care.</li>
            <li><strong>Website analytics and cookies:</strong> used to understand how visitors use our site and improve your experience.</li>
          </ul>

          <h3>3. How We Use Your Information</h3>
          <p>Your information helps us:</p>
          <ul>
            <li>Schedule sessions and respond to inquiries</li>
            <li>Process payments and confirm orders</li>
            <li>Provide wellness coaching and related services</li>
            <li>Send updates, confirmations, and educational content (only if you opt in)</li>
            <li>Improve our website and client experience</li>
          </ul>
          <p>
            <strong>We will never sell, rent, or trade your personal information to others.</strong>
          </p>

          <h3>4. Sharing Information</h3>
          <p>
            We may share limited information only with:
          </p>
          <ul>
            <li>Payment processors (Zelle, Venmo, Cherry) to complete transactions</li>
            <li>Third-party vendors that help operate our website or scheduling tools (for example, analytics or booking software)</li>
            <li>Legal authorities if required by law to comply with legal obligations or protect rights and safety</li>
          </ul>
          <p>
            All partners are required to maintain confidentiality and use your information 
            only for agreed purposes.
          </p>

          <h3>5. Health and Wellness Privacy</h3>
          <p>
            Because EmpowerMEd Wellness provides wellness and coaching—not medical 
            treatment—we are not a HIPAA-covered entity. However, all information you 
            share is treated as confidential and protected with the same level of care 
            and respect as medical information.
          </p>

          <h3>6. Cookies and Analytics</h3>
          <p>
            Our website may use cookies and similar technologies to understand site 
            traffic and preferences. You can disable cookies in your browser at any time, 
            though some parts of the site may not function properly without them.
          </p>

          <h3>7. Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access and review your personal information</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of future communications</li>
          </ul>
          <p>
            To make any of these requests, email <strong>EmpowerMEddev@gmail.com</strong> with 
            "Privacy Request" in the subject line.
          </p>

          <h3>8. Data Protection</h3>
          <p>
            We take reasonable administrative and technical measures to protect your 
            data from unauthorized access, disclosure, or loss. While no online system 
            is completely secure, we work to maintain your trust and safeguard your information.
          </p>

          <h3>9. Children's Privacy</h3>
          <p>
            Our services are intended for adults. We do not knowingly collect information 
            from children under 13. If we discover that we have received information from 
            a child, we will delete it immediately.
          </p>

          <h3>10. Updates to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. The latest version will 
            always be posted on this page with the updated date.
          </p>

          <h3>11. Contact Us</h3>
          <p>
            If you have questions or concerns about this Privacy Policy or your information, 
            please contact:
          </p>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <strong>Email:</strong> EmpowerMEddev@gmail.com<br />
            <strong>Phone:</strong> (209) 922-2007<br />
            <strong>Website:</strong> https://www.empowermedwellness.com
          </p>
        </div>
        <button 
          className={styles.acknowledgeButton}
          onClick={() => setIsPrivacyOpen(false)}
        >
          I Understand and Acknowledge
        </button>
      </Modal>
    </>
  );
}