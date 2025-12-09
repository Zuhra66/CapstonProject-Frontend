import "../styles/Membership.css";


export default function CheckoutDrawer({ plan, onClose, hasConsult = false }) {
  const isStudent = plan.type === "student";
  const isGeneral = plan.type === "general";

  return (
    <div className="drawer-overlay">
      <div className="drawer">

        {/* CLOSE BUTTON */}
        <button className="drawer-close" onClick={onClose}>×</button>

        {/* TITLE */}
        <h2 className="drawer-title">
          {isStudent ? "Student Membership" : "General Membership"}
        </h2>
        <p className="drawer-subtitle">
          Review your options and continue.
        </p>

        {/* SUMMARY BOX */}
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

        {/* BUTTON OPTIONS */}
        <div className="drawer-actions">

          {/* STUDENT FLOW — FREE CONSULT BUTTON */}
          {isStudent && !hasConsult && (
            <a href="/booking" className="drawer-button primary">
              Book Free Consultation
            </a>
          )}

          {/* STUDENT FLOW — AFTER CONSULT, ENABLE MEMBERSHIP PURCHASE */}
          {isStudent && hasConsult && (
            <button className="drawer-button primary">
              Begin Student Membership – $70 (3 Sessions)
            </button>
          )}

          {/* GENERAL MEMBERSHIP BUTTON */}
          {isGeneral && (
            <button className="drawer-button primary">
              Begin General Membership – $99/month
            </button>
          )}

          {/* CANCEL */}
          <button className="drawer-button secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}