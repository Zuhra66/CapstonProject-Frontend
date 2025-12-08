// src/pages/AdminAppointments.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/appointment.css";

export default function AdminAppointments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { getAccessTokenSilently } = useAuth0();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);

  // FILTERS
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [messageFilter, setMessageFilter] = useState("");

  const GOOGLE_CALENDAR_EMBED =
    "https://calendar.google.com/calendar/embed?src=empowermeddev%40gmail.com&ctz=America%2FLos_Angeles";

  // CSRF Helpers
  const fetchCsrfToken = async () => {
    try {
      await fetch(`${API_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err);
    }
  };

  const getCsrfFromCookie = () => {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchCsrfToken();
    fetchAppointments();
    fetchMessages();
  }, []);

  // FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/calendar/admin-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      setAppointments(data.appointments || []);
      setFilteredAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // FETCH MESSAGES
  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/messages/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // APPLY FILTERS
  useEffect(() => {
    const now = new Date();
    const hasDateFilter = !!searchDate;

    let results = [...appointments];

    const normalizeDate = (d) => {
      if (!d) return "";
      return new Date(d).toISOString().split("T")[0];
    };

    // STATUS FILTER (only applied when date filter is NOT active)
    if (!hasDateFilter) {
      results = results.filter((appt) => {
        const status = appt.status || "scheduled";

        let end;
        if (appt.end_time) end = new Date(appt.end_time);
        else if (appt.start_time) end = new Date(appt.start_time);
        else if (appt.date) end = new Date(appt.date);

        switch (statusFilter) {
          case "upcoming":
            return end && end >= now && status !== "canceled";
          case "past":
            return end && end < now && status !== "canceled";
          case "canceled":
            return status === "canceled";
          case "all":
          default:
            return true;
        }
      });
    }

    // EMAIL filter
    if (searchEmail.trim() !== "") {
      const needle = searchEmail.toLowerCase();
      results = results.filter((a) =>
        (a.email || "").toLowerCase().includes(needle)
      );
    } else {
      // Email cleared → reset base results then reapply other filters without email
      results = [...appointments];
    }

    // TYPE filter (membership/general)
    if (searchType) {
      const needle = searchType.toLowerCase();
      results = results.filter((a) =>
        (a.appointment_type || "").toLowerCase().includes(needle)
      );
    }

    // DATE filter overrides status
    if (hasDateFilter) {
      results = results.filter((a) => normalizeDate(a.date) === searchDate);
    }

    setFilteredAppointments(results);
  }, [statusFilter, searchEmail, searchType, searchDate, appointments]);

  // CANCEL APPOINTMENT
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const csrfToken = getCsrfFromCookie();

      await fetch(`${API_URL}/calendar/admin-cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ appointmentId: id }),
      });

      await fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  // DATE DISPLAY FORMATTER
  const formatDateTime = (date, time) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const formattedTime = new Date(time).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${formattedDate} @ ${formattedTime}`;
  };

  // SEND REPLY
  const handleReply = async () => {
    if (!reply.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const csrfToken = getCsrfFromCookie();

      await fetch(`${API_URL}/messages/admin-send`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ message: reply }),
      });

      setReply("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------------------------
     UI RENDER
  ------------------------------------------------ */
  return (
    <div className="admin-dashboard">
      {/* HERO */}
      <section className="mini-hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mini-hero-title"
        >
          Appointment & Messaging Management
        </motion.h1>
      </section>

      <div className="admin-grid">
        <div className="row-1">
          {/* LEFT COLUMN */}
          <div className="col">
            <div className="gradient-card">
              {/* FILTER CARD */}
              <div className="inner-card">
                <h2>Filter Appointments</h2>

                <div className="filter-row">

                  {/* EMAIL */}
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />

                  {/* DATE */}
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />

                  {/* TYPE DROPDOWN */}
                  <div className="dropdown-wrapper">
                    <label className="filter-label">Type:</label>
                    <select
                      className="rounded-dropdown"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="Membership Appointment">
                        Membership Appointment
                      </option>
                      <option value="General Appointment">
                        General Appointment
                      </option>
                    </select>
                  </div>

                  {/* STATUS DROPDOWN */}
                  <div className="dropdown-wrapper">
                    <label className="filter-label">Status:</label>
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
              </div>

              {/* APPOINTMENTS LIST */}
              <div className="inner-card">
                <h2>All Appointments</h2>

                <div className="scroll-box tall">
                  {loading ? (
                    <p>Loading...</p>
                  ) : filteredAppointments.length === 0 ? (
                    <p>No appointments match filters.</p>
                  ) : (
                    filteredAppointments.map((appt) => {
                      const statusLabel = appt.status || "scheduled";

                      // determine cancelability
                      let canCancel = false;
                      let end;

                      if (appt.end_time) end = new Date(appt.end_time);
                      else if (appt.start_time)
                        end = new Date(appt.start_time);
                      else if (appt.date)
                        end = new Date(`${appt.date}T23:59:59`);

                      if (end && end > new Date() && appt.status !== "canceled") {
                        canCancel = true;
                      }

                      return (
                        <div key={appt.id} className="appointment-item-card">
                          <p><strong>{appt.email}</strong></p>
                          <p>{appt.appointment_type}</p>
                          <p>{formatDateTime(appt.date, appt.start_time)}</p>
                          <p><strong>Status:</strong> {statusLabel}</p>

                          {canCancel && (
                            <button
                              className="time-button cancel"
                              onClick={() => handleCancel(appt.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MESSAGES */}
          <div className="col">
            <div className="gradient-card">
              <div className="inner-card">
                <h2>Messages Received</h2>

                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                />

                <div className="scroll-box">
                  {messages
                    .filter((m) =>
                      (m.text || "")
                        .toLowerCase()
                        .includes(messageFilter.toLowerCase())
                    )
                    .map((msg) => (
                      <div key={msg.id} className="message-card">
                        <p><strong>{msg.from_email}</strong></p>
                        <p>{msg.text}</p>
                        <small>{new Date(msg.sent_at).toLocaleString()}</small>
                      </div>
                    ))}
                </div>
              </div>

              <div className="inner-card">
                <h2>Send Reply</h2>
                <textarea
                  className="admin-textarea"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                ></textarea>

                <button className="book-button-wrapper" onClick={handleReply}>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="row-2">
          <div className="gradient-card">
            <div className="inner-card">
              <h2>Calendar View</h2>
              <iframe
                className="admin-calendar"
                src={GOOGLE_CALENDAR_EMBED}
                title="Admin Calendar"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
