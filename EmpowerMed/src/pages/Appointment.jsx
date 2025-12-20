// src/pages/Appointment.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Appointment.css";
import ConversationPanel from "../components/ConversationPanel";

export default function Appointment() {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [backendUser, setBackendUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
        setAppointments([]);
        setFilteredAppointments([]);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, getAccessTokenSilently]);

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
        setReceivedMessages([]);
      }
    };

    loadMessages();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMe = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBackendUser(data);
    };

    fetchMe();
  }, [isAuthenticated, getAccessTokenSilently]);

  const normalizeDate = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  useEffect(() => {
    let results = [...appointments];
    const now = new Date();

    if (statusFilter !== "all") {
      results = results.filter((appt) => {
        const status = appt.status || "scheduled";

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

    if (filterDate) {
      results = results.filter(
        (appt) => normalizeDate(appt.date) === filterDate
      );
    }

    setFilteredAppointments(results);
  }, [filterDate, statusFilter, appointments]);

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
      alert("Failed to cancel appointment");
    }
  };

  const handleSendMessage = async (message) => {
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
        setReceivedMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender_id: user.id,
            sender_role: "user",
            text: message,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const formatDateTime = (date, time) => {
    const d = new Date(date);
    const t = new Date(time);

    return `${d.toDateString()} @ ${t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="admin-dashboard">
      <section className="mini-hero">
        <h1 className="mini-hero-title">My Appointments</h1>
      </section>

      <div className="admin-grid">
        <div className="row-1">
          <div className="col">
            <div className="gradient-card">
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

          <div className="user-messages-page">
            <div className="col messages-col">
              <div className="gradient-card messages-card">
                <div className="inner-card admin-messages-layout">
                  {backendUser && (
                    <ConversationPanel
                      key={backendUser.id}
                      title="Conversation with Support"
                      messages={receivedMessages}
                      currentUserId={backendUser.id}
                      disabled={!isAuthenticated}
                      onSend={({ message }) => handleSendMessage(message)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}