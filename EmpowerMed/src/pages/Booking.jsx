import React, { useState, useEffect } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
//import Calendar from "react-calendar";
//import "react-calendar/dist/Calendar.css";

export default function Booking() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const appointmentTypes = ["Appointment Type 1", "Appointment Type 2"];

  // Fetch available times from backend
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/calendar/availability?date=${selectedDate.toISOString().split("T")[0]}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setAvailableTimes(data.times || []);
        setSelectedTime(null);
      } catch (err) {
        console.error("Error fetching times", err);
        setAvailableTimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedType || !selectedDate || !selectedTime) {
      return alert("Please select appointment type, date, and time.");
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calendar/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: selectedType,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Appointment booked successfully!");
        setSelectedTime(null);
      } else {
        alert("Booking failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error booking appointment.");
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4 bg-light">
      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Body>
          <h2 className="text-center mb-4">Select Appointment Type</h2>
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            {appointmentTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "primary" : "outline-primary"}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
            <div className="flex-fill">
              <h4 className="text-center mb-2">Select Date</h4>
              <div className="d-flex justify-content-center">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                />
              </div>
            </div>

            <div className="flex-fill">
              <h4 className="text-center mb-2">Select Time</h4>
              {loading ? (
                <div className="text-center mt-3">
                  <Spinner animation="border" size="sm" /> Loading...
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "success" : "outline-success"}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center mt-3 text-muted">No times available.</p>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Button
              onClick={handleBook}
              disabled={!selectedType || !selectedDate || !selectedTime || availableTimes.length === 0}
            >
              Book Appointment
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
