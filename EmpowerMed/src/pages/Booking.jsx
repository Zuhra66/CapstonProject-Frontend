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
    "Student Appointment"
  ]

  const userTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
  const providerTimeZone = "America/Los_Angeles";
  const userIsInProviderTZ = userTimeZone === providerTimeZone;

  function getTZAbbreviation(timeZone, date = new Date()) {
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short"
      });
      const parts = dtf.formatToParts(date);
      const tz = parts.find(p => p.type === "timeZoneName");
      return tz ? tz.value : "";
    } catch {
      return "";
    }
  }

  function convertToUserTime(pstTime, date) {
    if (!pstTime || !date) return pstTime;

    const [time, modifier] = pstTime.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const dateStr = date.toISOString().split("T")[0];

    const providerDate = new Date(
      new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${minutes}:00`)
        .toLocaleString("en-US", { timeZone: providerTimeZone })
    );

    return providerDate.toLocaleTimeString("en-US", {
      timeZone: userTimeZone,
      hour: "numeric",
      minute: "2-digit"
    });
  }

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
    if (!selectedType) {
      showValidationError("Please select an appointment type.");
      return;
    }

    if (!email) {
      showValidationError("Please enter your email.");
      return;
    }

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
        const userTime = convertToUserTime(selectedTime, selectedDate);

        showSuccess(
          `Your appointment has been booked successfully!\n\nDetails:\n• Date: ${selectedDate.toDateString()}\n• Time: ${userTime}${
            !userIsInProviderTZ ? ` (${selectedTime} PST)` : ""
          }\n• Type: ${selectedType}\n\nA confirmation has been sent to ${email}`
        );

        setAvailableTimes((prev) => prev.filter((t) => t !== selectedTime));
        
        resetForm();
      } else {
        showError(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
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
            <div className="calendar-wrapper">
              <Calendar value={selectedDate} onChange={setSelectedDate} />
            </div>

            <div className="times-wrapper">
              <h4 className="available-times-title">Available Times</h4>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading available times...</p>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="times-grid">
                  {availableTimes.map((time) => {
                    const userTime = convertToUserTime(time, selectedDate);

                    return (
                      <button
                        key={time}
                        className={`time-button ${selectedTime === time ? "selected-time" : ""}`}
                        onClick={() => handleTimeClick(time)}
                        disabled={isSubmitting}
                      >
                        {userTime} ({getTZAbbreviation(userTimeZone, selectedDate)})

                        {!userIsInProviderTZ && (
                          <div className="provider-time-label">
                            (Provider time: {time} {getTZAbbreviation(providerTimeZone, selectedDate)})
                          </div>
                        )}
                      </button>
                    );
                  })}
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

      <Modal 
        show={showModal} 
        onHide={() => !isSubmitting && setShowModal(false)} 
        centered
        backdrop={isSubmitting ? "static" : true}
        size="md"
      >
        <Modal.Header
          closeButton={!isSubmitting}
          style={{ padding: "0.75rem 1rem" }}
        >
          <Modal.Title style={{ fontSize: "1.1rem" }}>Confirm Appointment</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1rem" }}>
          <div className="appointment-details mb-3 p-2 rounded" style={{ fontSize: "0.9rem" }}>
            <p className="mb-1">
              <strong>Date:</strong> {selectedDate.toDateString()}
            </p>
            <p className="mb-0">
              <strong>Time:</strong> {convertToUserTime(selectedTime, selectedDate)}
              {!userIsInProviderTZ && ` (${selectedTime} PST)`}
            </p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.9rem" }}>
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
                className="mb-1 appointment-radio"
                style={{ fontSize: "0.9rem" }}
              />
            ))}
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontSize: "0.9rem" }}>Email for confirmation:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.9rem" }}
            />
            <Form.Text style={{ fontSize: "0.8rem" }}>
              We'll send a confirmation email to this address
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer style={{ padding: "0.75rem" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
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

      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)} 
        centered
        backdrop="static"
        size="sm"
      >
        <Modal.Header closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiCheckCircle className="me-2" size={18} />
            Success!
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center" style={{ padding: "1rem" }}>
          <div className="mb-2">
            <FiCheckCircle size={36} />
          </div>
          <p style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowSuccessModal(false);
              resetForm();
            }}
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showErrorModal} 
        onHide={() => setShowErrorModal(false)} 
        centered
        backdrop="static"
        size="sm"
      >
        <Modal.Header closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertTriangle className="me-2" size={18} />
            Error
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center" style={{ padding: "1rem" }}>
          <div className="mb-2">
            <FiAlertTriangle size={36} />
          </div>
          <p style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => setShowErrorModal(false)}
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showValidationModal} 
        onHide={() => setShowValidationModal(false)} 
        centered
        size="sm"
      >
        <Modal.Header closeButton style={{ padding: "0.75rem 1rem" }}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertCircle className="me-2" size={18} />
            Required
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center" style={{ padding: "1rem" }}>
          <div className="mb-2">
            <FiAlertCircle size={36} />
          </div>
          <p style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => setShowValidationModal(false)}
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}