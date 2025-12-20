import "../styles/Membership.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function CheckoutDrawer({ plan, onClose }) {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  const isStudent = plan?.type === "student";
  const isGeneral = plan?.type === "general";

  async function startPayPalCheckout(planType) {
    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/memberships/paypal/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planType }),
        }
      );

      const data = await res.json();

      if (!data.approvalUrl) {
        alert("Unable to start PayPal checkout.");
        return;
      }

      window.location.href = data.approvalUrl;
    } catch (err) {
      alert("Authentication error. Please refresh and try again.");
    }
  }

  async function handleCheckout(planType) {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: {
          returnTo: "/membership",
          resumeCheckout: true,
          planType,
        },
      });
      return;
    }

    startPayPalCheckout(planType);
  }

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <button className="drawer-close" onClick={onClose}></button>

        <h2 className="drawer-title">
          {isStudent ? "Student Membership" : "General Membership"}
        </h2>
        <p className="drawer-subtitle">
          Review your options and continue.
        </p>

        <div className="drawer-summary">
          {isStudent ? (
            <>
              <div className="drawer-summary-row">
                <span>Initial Consultation:</span>
                <span>FREE (one time)</span>
              </div>
              <div className="drawer-summary-row">
                <span>After Consultation:</span>
                <span>3 sessions for $70</span>
              </div>
            </>
          ) : (
            <>
              <div className="drawer-summary-row">
                <span>Monthly Membership:</span>
                <span>$99 / month</span>
              </div>
              <div className="drawer-summary-row">
                <span>Access:</span>
                <span>Full 24/7 Wellness Coaching</span>
              </div>
            </>
          )}
        </div>

        <div className="drawer-actions">
          {isStudent && (
            <div className="consult-cta">
              <p className="consult-text">
                Before starting your student membership, you may schedule a{" "}
                <strong>free 60-minute consultation.</strong>
              </p>

              <button
                className="drawer-button secondary"
                onClick={() => {
                  onClose();
                  navigate("/booking");
                }}
              >
                Click Here to Book Your Free Consultation
              </button>
            </div>
          )}

          {isStudent && (
            <button
              className="drawer-button primary"
              onClick={() => handleCheckout("student")}
            >
              Begin Student Membership – $70/month
            </button>
          )}

          {isGeneral && (
            <button
              className="drawer-button primary"
              onClick={() => handleCheckout("general")}
            >
              Begin General Membership – $99/month
            </button>
          )}

          <button className="drawer-button secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}