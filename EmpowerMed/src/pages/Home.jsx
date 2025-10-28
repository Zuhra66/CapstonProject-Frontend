// src/pages/Home.jsx
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import heroImg from '../assets/hero-placeholder.jpg'; // add a high-res, soft wellness photo here
import '../styles/theme.css';
import '../styles/layout.css';
import '../styles/buttons.css';

export default function Home() {
  return (
    <main className="home-root" role="main">
      {/* HERO */}
      <section className="hero-section d-flex align-items-center">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="hero-title">Renew • Restore • Thrive</h1>
              <p className="lead-para">
                EmpowerMed blends modern clinical care and mindful wellness to help you feel your best—
                personalized programs, trusted practitioners, and a community that supports you.
              </p>
              <div className="hero-ctas d-flex gap-2 mt-3">
                <Button className="btn-primary-lg" href="/membership">Become a Member</Button>
                <Button className="btn-outline-lg" href="/appointment">Book an Appointment</Button>
              </div>
            </Col>
            <Col md={6} className="hero-media-col">
              <div className="hero-media">
                <img src={heroImg} alt="Serene wellness scene" className="img-fluid rounded-3 hero-img" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SERVICES */}
      <section className="services-section py-5">
        <Container>
          <h2 className="section-title text-center">Our Services</h2>
          <p className="section-sub text-center">Designed to support mind, body, and lifestyle — starting where you are.</p>

          <Row className="mt-4 g-4">
            {[
              { title: 'Primary Care & Telehealth', desc: 'Comprehensive care with continuity and convenience.' },
              { title: 'Mental Wellness & Therapy', desc: 'Evidence-based therapy and community support.' },
              { title: 'Nutrition & Weight Management', desc: 'Personalized nutrition plans and coaching.' },
              { title: 'Holistic Treatments', desc: 'Massage, acupuncture, and restorative therapies.' },
            ].map((s, i) => (
              <Col md={6} lg={3} key={i}>
                <article className="service-card p-4 h-100">
                  <div className="service-icon" aria-hidden="true">•</div>
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                  <div className="mt-auto">
                    <Button className="btn-secondary-sm" href="/products">Learn more</Button>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* PROMO / CTA */}
      <section className="promo-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="promo-title">Join Our Wellness Community</h3>
              <p className="promo-sub">Members receive guided plans, exclusive content, and priority booking.</p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button className="btn-primary-lg" href="/signup">Sign Up — It’s Free</Button>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}
