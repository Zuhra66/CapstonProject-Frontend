// src/pages/Appointment.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/appointment.css";

export default function Appointment() {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [messageFilter, setMessageFilter] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* -----------------------------------------------------
     FETCH USER APPOINTMENTS
  ----------------------------------------------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAppointments = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });

        const res = await fetch(`${API_URL}/calendar/user-appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setAppointments(data.appointments || []);
        setFilteredAppointments(data.appointments || []);
      } catch (err) {
        console.error("❌ Error fetching appointments:", err);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, getAccessTokenSilently]);

  /* -----------------------------------------------------
     FETCH USER MESSAGES
  ----------------------------------------------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadMessages = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });

        const res = await fetch(`${API_URL}/messages/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setReceivedMessages(data.messages || []);
      } catch (err) {
        console.error("❌ Error loading received messages:", err);
      }
    };

    loadMessages();
  }, [isAuthenticated, getAccessTokenSilently]);

  /* -----------------------------------------------------
     FILTERING LOGIC — MATCHES ADMIN LOGIC
  ----------------------------------------------------- */

  // Normalize date to yyyy-mm-dd
  const normalizeDate = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  useEffect(() => {
    let results = [...appointments];
    const now = new Date();

    /* ---------- STATUS FILTER ---------- */
    if (statusFilter !== "all") {
      results = results.filter((appt) => {
        const status = appt.status || "scheduled";

        // Determine appointment end date reliably
        let end;
        if (appt.end_time) end = new Date(appt.end_time);
        else if (appt.start_time) end = new Date(appt.start_time);
        else end = new Date(`${appt.date}T23:59:59`);

        switch (statusFilter) {
          case "upcoming":
            return end >= now && status !== "canceled";
          case "past":
            return end < now && status !== "canceled";
          case "canceled":
            return status === "canceled";
          default:
            return true;
        }
      });
    }

    /* ---------- DATE FILTER (OVERRIDES STATUS) ---------- */
    if (filterDate) {
      results = results.filter(
        (appt) => normalizeDate(appt.date) === filterDate
      );
    }

    setFilteredAppointments(results);
  }, [filterDate, statusFilter, appointments]);

  /* -----------------------------------------------------
     CANCEL APPOINTMENT
  ----------------------------------------------------- */
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/calendar/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointmentId: id }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "canceled" } : a))
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  /* -----------------------------------------------------
     SEND MESSAGE TO ADMIN
  ----------------------------------------------------- */
  const handleSendMessage = async () => {
    if (!message.trim()) return alert("Message cannot be empty.");

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/messages/user-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Message sent!");
        setMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* -----------------------------------------------------
     FORMAT DATE/TIME
  ----------------------------------------------------- */
  const formatDateTime = (date, time) => {
    const d = new Date(date);
    const t = new Date(time);

    return `${d.toDateString()} @ ${t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  /* -----------------------------------------------------
     UI
  ----------------------------------------------------- */
  return (
    <div className="admin-dashboard">
      <section className="mini-hero">
        <h1 className="mini-hero-title">My Appointments</h1>
      </section>

      <div className="admin-grid">
        <div className="row-1">
          {/* LEFT COLUMN — APPOINTMENTS */}
          <div className="col">
            <div className="gradient-card">
              {/* FILTER SECTION */}
              <div className="inner-card">
                <h2>Filter Appointments</h2>

                <div className="filter-row">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />

                  <select
                    className="rounded-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="canceled">Canceled</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              {/* APPOINTMENTS LIST */}
              <div className="inner-card">
                <h2>My Scheduled Appointments</h2>

                <div className="scroll-box tall">
                  {filteredAppointments.length === 0 ? (
                    <p>No appointments.</p>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <div key={appt.id} className="appointment-item-card">
                        <p><strong>{appt.appointment_type}</strong></p>
                        <p>{formatDateTime(appt.date, appt.start_time)}</p>
                        <p><strong>Status:</strong> {appt.status || "scheduled"}</p>

                        {appt.status !== "canceled" && (
                          <button
                            className="time-button cancel"
                            onClick={() => handleCancel(appt.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — MESSAGES */}
          <div className="col">
            <div className="gradient-card">
              <div className="inner-card">
                <h2>Messages From Admin</h2>

                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                />

                <div className="scroll-box">
                  {receivedMessages
                    .filter((m) =>
                      m.text.toLowerCase().includes(messageFilter.toLowerCase())
                    )
                    .map((msg) => (
                      <div key={msg.id} className="message-card">
                        <p>{msg.text}</p>
                        <small>{new Date(msg.sent_at).toLocaleString()}</small>
                      </div>
                    ))}
                </div>
              </div>

              <div className="inner-card">
                <h2>Send a Message</h2>
                <textarea
                  className="admin-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                ></textarea>

                <button className="book-button-wrapper" onClick={handleSendMessage}>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
