import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Membership.css";

export default function MembershipSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    if (countdown <= 0) {
      navigate("/account");
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="membership-success-container">
      <div className="membership-success-card">

        <div className="success-icon">🎉</div>

        <h1 className="display-font">Welcome to EmpowerMEd</h1>

        <p className="success-message">
          Your membership has been successfully activated.
        </p>

        <p className="success-subtext">
          {user?.email && (
            <>A confirmation has been sent to <strong>{user.email}</strong>.</>
          )}
        </p>

        <div className="success-actions">
          <button
            className="drawer-button primary"
            onClick={() => navigate("/account")}
          >
            Go to My Account
          </button>

          <button
            className="drawer-button secondary"
            onClick={() => navigate("/booking")}
          >
            Book a Session
          </button>
        </div>

        <p className="redirect-note">
          Redirecting to your account in {countdown} seconds…
        </p>

      </div>
    </div>
  );
}