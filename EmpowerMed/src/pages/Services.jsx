<<<<<<< HEAD
import "../styles/services.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Services() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Welcome to Services",
      icon: "💙",
      description: (
        <div>
          <p>
            At EmpowerMEd, every session is designed to nurture the whole person — mentally, physically, emotionally, spiritually, and nutritionally.
          </p>
          <p>
            Dr. Diana Galván offers personalized and affordable services that meet clients where they are, helping them restore balance, direction, and confidence in every area of life.
          </p>
        </div>
      ),
    },
    {
      title: "Coaching for All Ages",
      icon: "✨",
      description:
        "EmpowerMEd provides life and wellness coaching for teens, adults, professionals, and couples. Sessions help clients identify their goals, strengthen emotional resilience, and create sustainable habits for personal and professional growth."
    },
    {
      title: "Vocational Counseling & Assessments",
      icon: "💼",
      description:
        "As a Department of Rehabilitation–contracted counselor, Dr. Galván offers career and vocational assessments to help clients discover their strengths, clarify goals, and find meaningful employment. Services include career exploration, job readiness, workplace wellness, and return-to-work planning for individuals with disabilities or those navigating major life transitions."
    },
    {
      title: "Physician & Professional Coaching",
      icon: "💚",
      description:
        "Tailored to the unique demands of healthcare and leadership, EmpowerMEd supports physicians, residents, and healthcare teams in preventing burnout and cultivating joy in medicine. Coaching integrates behavioral science, wellness education, and faith-based grounding to enhance performance and restore purpose."
    },
    {
      title: "Couples & Relationship Coaching",
      icon: "💞",
      description:
        "For couples seeking harmony and connection, sessions offer a safe space to build communication, trust, and shared vision—strengthening relationships through understanding and grace."
    },
    {
      title: "Five-Element Wellness Approach",
      icon: "🌸",
      description: (
        <div>
          <p>Each EmpowerMEd session integrates the five elements of wellness:</p>
          <ul className="wellness-list">
            <li><strong>Mental</strong>: mindfulness, mindset, and stress management</li>
            <li><strong>Physical</strong>: energy, rest, and nutrition awareness</li>
            <li><strong>Emotional</strong>: resilience, boundaries, and self-compassion</li>
            <li><strong>Spiritual</strong>: faith-based grounding and purpose alignment</li>
            <li><strong>Nutritional</strong>: balanced choices that support body and mind</li>
          </ul>
        </div>
      )
    },
    {
      title: "Accessible & Affordable Care",
      icon: "🌼",
      description:
        "Dr. Galván believes wellness should be within reach for everyone. EmpowerMEd offers affordable coaching packages and flexible options to ensure accessible care for all communities."
    },
    {
      title: "Serving Clients Everywhere",
      icon: "🌍",
      description:
        "EmpowerMEd supports individuals across California and globally through secure Zoom sessions. In-person services are also available in Modesto and Turlock, California."
    }
  ];

  const [selected, setSelected] = useState(0); 

  const exploreServices = () => setSelected(1);
  const backToIntro = () => setSelected(0);

  return (
    <div className="services-page">
      <div style={{ height: '140px' }}></div>

      {/* MAIN CARD */}
      <div id="scene">
        {/* LEFT MENU */}
        {selected !== 0 && (
          <div id="left-zone">
            <ul className="list">
              {services.slice(1).map((service, idx) => (
                <li className="item" key={service.title}>
                  <input
                    type="radio"
                    id={`radio_${service.title}`}
                    name="services_carousel"
                    value={service.title}
                    checked={selected === idx + 1}
                    onChange={() => setSelected(idx + 1)}
                  />
                  <label htmlFor={`radio_${service.title}`}>
                    {service.title}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selected !== 0 && <div id="middle-border"></div>}

        {/* RIGHT CONTENT */}
        <div id="right-zone">
          <div className="right-content-scroll">
            <span className="picto">{services[selected].icon}</span>
            <h1>{services[selected].title}</h1>
            <div className="description">{services[selected].description}</div>
          </div>

          {selected === 0 ? (
            <div className="carousel-buttons">
              <button className="toggle-btn" onClick={exploreServices}>
                Explore Services
              </button>
            </div>
          ) : (
            <div className="detail-buttons">
              <button className="toggle-btn" onClick={() => navigate("/membership")}>
                Membership Page
              </button>
              <button className="toggle-btn" onClick={backToIntro}>
                Back to Services
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

=======
function Services() {
  return (
    <div className="page-content services-section text-center">
      <h1>Welcome to EmpowerMed</h1>
      <p>This is the home page placeholder.</p>
      <p>This is the home page placeholder.</p>
      <p>This is the home page placeholder.</p>
      <p>This is the home page placeholder.</p>
      <p>This is the home page placeholder.</p>
    </div>
  );
}
>>>>>>> 8b38515e5a8a0510b55b11665764e075fafab12a
export default Services;
