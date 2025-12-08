import { useState } from "react";
import { motion } from "framer-motion";
import CheckoutDrawer from "../components/CheckoutDrawer.jsx";
import "../styles/Membership.css";

const membershipImg =
  "https://images.unsplash.com/photo-1636240976456-2c91842b79a0?q=80&w=2070&auto=format&fit=crop";

export default function Membership() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Membership Plans
  const studentPlan = {
    id: "student",
    type: "student",
    title: "Student Membership",
    description: "Free 60-minute consultation. Afterward, 3 sessions for $70.",
    priceLabel: "Initial Consultation",
    price: "FREE",
  };

  const generalPlan = {
    id: "general",
    type: "general",
    title: "General Membership",
    description:
      "Unlimited access to wellness coaching and support for one flat fee.",
    priceLabel: "Monthly Membership",
    price: "$99 / month",
  };

  // Motion animations
  const titleFade = {
    hidden: { opacity: 0, y: -35 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  const cardFade = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay: 0.15 },
    },
  };

  return (
    <div className="membership-page">

      {/* ---------- FULL-WIDTH BLUE HERO BANNER ---------- */}
      <motion.div
        className="membership-hero-banner"
        variants={titleFade}
        initial="hidden"
        animate="visible"
      >
        <h1 className="display-font membership-banner-title">Membership</h1>
        <p className="membership-banner-subtitle">
          Empowering your wellness journey with personalized and accessible support.
        </p>
      </motion.div>

      {/* ---------- TWO-COLUMN HERO CARD ---------- */}
      <motion.div
        className="membership-hero-card"
        variants={cardFade}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT IMAGE */}
        <div
          className="membership-hero-image"
          style={{ backgroundImage: `url(${membershipImg})` }}
        />

        {/* RIGHT CONTENT */}
        <div className="membership-hero-body">
          <h2 className="display-font card-title">Why Become a Member?</h2>
          <div className="divider"></div>

          <p className="body-font">
            Membership gives you reliable access to expert wellness guidance,
            ongoing support, and personalized care designed to help you thrive.
          </p>

          {/* FEATURE LIST VERTICAL STYLE */}
          <div className="features-vertical">
            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>Unlimited 24/7 access via text or call</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>Virtual coaching anywhere in California</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>In-home wellness visits (within 20 miles)</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>Preventative wellness planning</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>Patient & physician advocacy</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <p>Exclusive partner discounts</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---------- MEMBERSHIP ACCESS & FEE (NOW SEPARATE SECTION) ---------- */}
      <div className="membership-fee-section">
        <h3 className="membership-fee-title">Membership Access and Fee</h3>

        <p className="membership-fee-text">
          <strong>General Membership:</strong> One flat fee of $99 per month — that’s it!
        </p>

        <p className="membership-fee-text">
          <strong>Student Membership:</strong> FREE 60-minute consultation for high school and
          college students. Afterward, enjoy 3 sessions for just $70.
        </p>

        {/* Buttons */}
        <div className="membership-buttons">
          <button
            className="btn student-btn"
            onClick={() => {
              setSelectedPlan(studentPlan);
              setDrawerOpen(true);
            }}
          >
            Student Membership
          </button>

          <button
            className="btn main-btn"
            onClick={() => {
              setSelectedPlan(generalPlan);
              setDrawerOpen(true);
            }}
          >
            General Membership
          </button>
        </div>
      </div>

      {/* ---------- CHECKOUT DRAWER ---------- */}
      {drawerOpen && (
        <CheckoutDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          plan={selectedPlan}
          hasConsult={false}
        />
      )}
    </div>
  );
}
