// src/pages/Booking.jsx
import React, { useState, useEffect } from "react";
import { Card, Spinner, Modal, Button, Form } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Booking.css";
import { useAuth } from "../lib/useAuth";   
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";

export default function Booking({ userId }) {
  const { user } = useAuth();               
  const finalUserId = userId || user?.id;  

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [email, setEmail] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const appointmentTypes = [
    "Membership Appointment",
    "General Appointment",
  ];

  // Fetch available times
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimes = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const res = await fetch(`${API_URL}/calendar/availability?date=${dateStr}`);
        const data = await res.json();
        setAvailableTimes(data.times || []);
      } catch (err) {
        console.error("Error fetching times:", err);
        setAvailableTimes([]);
        showError("Failed to load available times. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, [selectedDate, API_URL]);

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    setShowModal(true);
  };

  const showSuccess = (message) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const showError = (message) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const showValidationError = (message) => {
    setModalMessage(message);
    setShowValidationModal(true);
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (!selectedType) {
      showValidationError("Please select an appointment type.");
      return;
    }

    if (!email) {
      showValidationError("Please enter your email.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showValidationError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];

      const res = await fetch(`${API_URL}/calendar/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          time: selectedTime,
          email,
          appointment_type: selectedType,
          userId: finalUserId,  
        }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccess(`Your appointment has been booked successfully!\n\nDetails:\n• Date: ${selectedDate.toDateString()}\n• Time: ${selectedTime}\n• Type: ${selectedType}\n\nA confirmation has been sent to ${email}`);
        
        // Update available times
        setAvailableTimes((prev) => prev.filter((t) => t !== selectedTime));
        
        // Reset form
        resetForm();
      } else {
        showError(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const resetForm = () => {
    setSelectedTime(null);
    setSelectedType("");
    setEmail("");
  };

  return (
    <div className="booking-page">
      <Card className="booking-card">
        <Card.Body>
          <h1 className="booking-title text-center">Book an Appointment</h1>

          <div className="calendar-times-container">
            {/* Calendar */}
            <div className="calendar-wrapper">
              <Calendar value={selectedDate} onChange={setSelectedDate} />
            </div>

            {/* Times */}
            <div className="times-wrapper">
              <h4 className="available-times-title">Available Times</h4>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading available times...</p>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="times-grid">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      className={`time-button ${
                        selectedTime === time ? "selected-time" : ""
                      }`}
                      onClick={() => handleTimeClick(time)}
                      disabled={isSubmitting}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted">No times available for this date</p>
                  <p className="small text-muted">Please select another date</p>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Booking Confirmation Modal - COMPACT VERSION */}
      <Modal 
        show={showModal} 
        onHide={() => !isSubmitting && setShowModal(false)} 
        centered
        backdrop={isSubmitting ? "static" : true}
        size="md"
      >
        <Modal.Header
          closeButton={!isSubmitting}
          className="modal-header-custom"
          style={{ padding: "0.75rem 1rem" }}
        >
          <Modal.Title style={{ fontSize: "1.1rem" }}>Confirm Appointment</Modal.Title>
        </Modal.Header>

        <Modal.Body className="modal-body-custom" style={{ padding: "1rem" }}>
          <div className="appointment-details mb-3 p-2 rounded" style={{ fontSize: "0.9rem" }}>
            <p className="mb-1">
              <strong>Date:</strong> {selectedDate.toDateString()}
            </p>
            <p className="mb-0">
              <strong>Time:</strong> {selectedTime}
            </p>
          </div>

          {/* Radio Buttons for Appointment Type */}
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom" style={{ fontSize: "0.9rem" }}>
              <strong>Appointment Type:</strong>
            </Form.Label>
            {appointmentTypes.map((type) => (
              <Form.Check
                key={type}
                type="radio"
                name="appointmentType"
                label={type}
                value={type}
                checked={selectedType === type}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isSubmitting}
                className="mb-1 form-check-custom"
                style={{ fontSize: "0.9rem" }}
              />
            ))}
          </Form.Group>

          {/* Email */}
          <Form.Group>
            <Form.Label className="form-label-custom" style={{ fontSize: "0.9rem" }}>Email for confirmation:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="form-control-custom"
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.9rem" }}
            />
            <Form.Text className="form-text-custom" style={{ fontSize: "0.8rem" }}>
              We'll send a confirmation email to this address
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="modal-footer-custom" style={{ padding: "0.75rem" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
            className="modal-btn-cancel"
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="modal-btn-confirm"
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Booking...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal - COMPACT VERSION */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)} 
        centered
        backdrop="static"
        size="sm"
        contentClassName="compact-modal"
      >
        <Modal.Header className="modal-header-success" closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiCheckCircle className="me-2" size={18} />
            Success!
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-success text-center" style={{ padding: "1rem" }}>
          <div className="success-icon mb-2">
            <FiCheckCircle size={36} />
          </div>
          <p className="success-message" style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-success justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowSuccessModal(false);
              resetForm();
            }}
            className="modal-btn-ok"
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal - COMPACT VERSION */}
      <Modal 
        show={showErrorModal} 
        onHide={() => setShowErrorModal(false)} 
        centered
        backdrop="static"
        size="sm"
        contentClassName="compact-modal"
      >
        <Modal.Header className="modal-header-error" closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertTriangle className="me-2" size={18} />
            Error
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-error text-center" style={{ padding: "1rem" }}>
          <div className="error-icon mb-2">
            <FiAlertTriangle size={36} />
          </div>
          <p className="error-message" style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-error justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => setShowErrorModal(false)}
            className="modal-btn-ok"
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Validation Error Modal - COMPACT VERSION */}
      <Modal 
        show={showValidationModal} 
        onHide={() => setShowValidationModal(false)} 
        centered
        size="sm"
        contentClassName="compact-modal"
      >
        <Modal.Header className="modal-header-warning" closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertCircle className="me-2" size={18} />
            Required
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-warning text-center" style={{ padding: "1rem" }}>
          <div className="warning-icon mb-2">
            <FiAlertCircle size={36} />
          </div>
          <p className="warning-message" style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-warning justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => setShowValidationModal(false)}
            className="modal-btn-ok"
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}