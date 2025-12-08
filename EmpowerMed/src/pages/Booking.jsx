// src/pages/Booking.jsx
import React, { useState, useEffect } from "react";
import { Card, Spinner, Modal, Button, Form } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Booking.css";
import { useAuth } from "../lib/useAuth";   

export default function Booking({ userId }) {
  const { user } = useAuth();               
  const finalUserId = userId || user?.id;  

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");

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

  const handleConfirmBooking = async () => {
    if (!selectedType) {
      alert("Please select an appointment type.");
      return;
    }

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];

      console.log("📤 Sending booking with userId:", finalUserId);

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
      console.log("📥 Booking response:", data);

      if (data.success) {
        alert("Your appointment has been booked!");
        setAvailableTimes((prev) => prev.filter((t) => t !== selectedTime));
      } else {
        alert("Booking failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed.");
    } finally {
      setSelectedTime(null);
      setSelectedType("");
      setEmail("");
      setShowModal(false);
    }
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
                <Spinner animation="border" />
              ) : availableTimes.length > 0 ? (
                <div className="times-grid">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      className={`time-button ${
                        selectedTime === time ? "selected-time" : ""
                      }`}
                      onClick={() => handleTimeClick(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No times available</p>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1f1f1f", color: "white" }}
        >
          <Modal.Title>Confirm Appointment</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "white" }}>
          <p>
            <strong>Date:</strong> {selectedDate.toDateString()}
          </p>
          <p>
            <strong>Time:</strong> {selectedTime}
          </p>

          {/* Radio Buttons for Appointment Type */}
          <Form.Group className="mt-3">
            <Form.Label>
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
                style={{ marginBottom: "8px" }}
              />
            ))}
          </Form.Group>

          {/* Email */}
          <Form.Group className="mt-3">
            <Form.Label>Email for confirmation:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#1f1f1f" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
