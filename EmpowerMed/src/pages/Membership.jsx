import "../styles/Membership.css";

function Membership() {
  return (
    <div className="membership-page">

      {/* OUTER TRANSLUCENT CARD */}
      <article className="membership-card">

        {/* TOP */}
        <header className="membership-header">
          <h1>Membership Access and Fee</h1>
          <p>
            One flat fee of <span className="price">$99 per month</span> — that’s it!
          </p>
        </header>

        {/* MIDDLE: IMAGE + BULLET POINTS IN ONE CONTAINER */}
        <div className="membership-info-box">

          {/* LEFT: IMAGE */}
          <div className="membership-image">
            <img
              src="https://images.unsplash.com/photo-1636240976456-2c91842b79a0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Membership"
            />
          </div>

          {/* RIGHT: BULLET POINTS */}
          <div className="membership-features">
            <h2>Membership Includes:</h2>

            <ul>
              <li>Unlimited 24/7 access via text or call with a wellness coach</li>
              <li>Virtual coaching & counseling sessions anywhere in California</li>
              <li>In-home wellness visits within 20 miles of Modesto, CA</li>
              <li>Preventative wellness planning & stress management support</li>
              <li>Patient & Physician Wellness Advocacy & education</li>
              <li>Exclusive discounts with our trusted wellness partners</li>
              <li>Affordable, personalized resources for long-term health and balance</li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: BUTTONS*/}
        <div className="membership-buttons">
          <a 
            href="https://venmo.com/" 
            className="btn student-btn"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Student Membership
          </a>

          <a 
            href="https://venmo.com/" 
            className="btn main-btn"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Main Membership
          </a>
        </div>

      </article>
    </div>
  );
}

export default Membership;
