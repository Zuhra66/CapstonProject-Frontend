import React from 'react';
import styles from '../styles/ContactModal.module.css';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleCall = () => {
    window.location.href = 'tel:+12099222007';
  };

  const handleEmail = () => {
    window.location.href = 'mailto:EmpowerMEddev@gmail.com';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className="display-font">Contact EmpowerMEd</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Contact Information */}
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>📍</div>
            <div className={styles.contactDetails}>
              <h3 className="display-font">Address</h3>
              <p>3600 Sisk Rd, Suite 2D<br />Modesto, CA 95356</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>📞</div>
            <div className={styles.contactDetails}>
              <h3 className="display-font">Phone</h3>
              <p>+1 (209) 922-2007<br />Mon-Sat: 8:00 AM - 5:00 PM PST</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>✉️</div>
            <div className={styles.contactDetails}>
              <h3 className="display-font">Email</h3>
              <p>EmpowerMEddev@gmail.com</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>🌐</div>
            <div className={styles.contactDetails}>
              <h3 className="display-font">Online</h3>
              <p>www.empowermedwellness.com<br />Follow us on social media</p>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className={styles.emergencyNotice}>
          <div className={styles.emergencyIcon}>🚨</div>
          <div className={styles.emergencyText}>
            <strong>For Medical Emergencies:</strong> Please call 911 or visit your nearest emergency room immediately.
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.primaryButton} onClick={handleCall}>
            📞 Call Now
          </button>
          <button className={styles.secondaryButton} onClick={handleEmail}>
            ✉️ Send Email
          </button>
        </div>
      </div>
    </div>
  );
}