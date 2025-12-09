// src/pages/AdminAppointments.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiMessageSquare, FiCalendar, FiSend } from "react-icons/fi";
import "../styles/Appointment.css";

export default function AdminAppointments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { getAccessTokenSilently } = useAuth0();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // FILTERS
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [messageFilter, setMessageFilter] = useState("");

  // MODAL STATES
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

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
      showError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH MESSAGES - UPDATED VERSION (Option 1)
  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      // Try different possible endpoints
      const endpoints = [
        `${API_URL}/api/messages/admin`,
        `${API_URL}/api/admin/messages`,
        `${API_URL}/messages`,
        `${API_URL}/admin/messages`,
        `${API_URL}/api/messages`
      ];

      let data = null;
      let successfulEndpoint = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: "include",
          });

          if (res.ok) {
            const responseData = await res.json();
            data = responseData;
            successfulEndpoint = endpoint;
            console.log(`✓ Messages loaded from: ${endpoint}`);
            break;
          } else {
            console.log(`✗ Endpoint ${endpoint} returned ${res.status}`);
          }
        } catch (err) {
          console.log(`✗ Endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }

      if (data) {
        // Handle different response formats
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (data.data && Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          console.warn("Unexpected messages response format:", data);
          setMessages([]);
        }
      } else {
        console.warn("No messages endpoint found, using empty array");
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      // Don't show error to user for this - just log it
      setMessages([]);
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
  const handleCancel = async () => {
    if (!selectedAppointment) return;
    
    setIsProcessing(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const csrfToken = getCsrfFromCookie();

      const res = await fetch(`${API_URL}/calendar/admin-cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ appointmentId: selectedAppointment.id }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccess(`Appointment for ${selectedAppointment.email} has been successfully canceled.\n\nA cancellation email has been sent to the client.`);
        await fetchAppointments();
      } else {
        showError(data.message || "Failed to cancel appointment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
      setShowCancelModal(false);
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

  // SEND REPLY - WITHOUT MODAL
  const handleReply = async () => {
    if (!reply.trim()) {
      showError("Message cannot be empty.");
      return;
    }

    setSendingMessage(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const csrfToken = getCsrfFromCookie();

      // Try different possible endpoints for sending
      const sendEndpoints = [
        `${API_URL}/api/messages/admin-send`,
        `${API_URL}/api/admin/messages/send`,
        `${API_URL}/messages/admin-send`,
        `${API_URL}/admin/messages/send`
      ];

      let sendSuccess = false;
      
      for (const endpoint of sendEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-XSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ message: reply }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              sendSuccess = true;
              showSuccess("Your message has been sent successfully!");
              setReply("");
              fetchMessages();
              break;
            }
          }
        } catch (err) {
          console.log(`Send endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }

      if (!sendSuccess) {
        showError("Unable to send message. The messaging feature may not be fully implemented yet.");
      }
    } catch (err) {
      console.error(err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // MODAL HELPERS
  const showSuccess = (message) => {
    setModalMessage(message);
    setModalTitle("Success");
    setShowConfirmModal(true);
  };

  const showError = (message) => {
    setModalMessage(message);
    setModalTitle("Error");
    setShowErrorModal(true);
  };

  const openCancelModal = (appt) => {
    setSelectedAppointment(appt);
    setShowCancelModal(true);
  };

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
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading appointments...</p>
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <p className="text-muted text-center">No appointments match filters.</p>
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
                              onClick={() => openCancelModal(appt)}
                              disabled={isProcessing}
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
                  {messages.length === 0 ? (
                    <p className="text-muted text-center">No messages available.</p>
                  ) : (
                    messages
                      .filter((m) =>
                        (m.text || "")
                          .toLowerCase()
                          .includes(messageFilter.toLowerCase())
                      )
                      .map((msg) => (
                        <div key={msg.id} className="message-card">
                          <p><strong>{msg.from_email || msg.email || 'Unknown'}</strong></p>
                          <p>{msg.text || msg.message || 'No message content'}</p>
                          <small>{msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'Unknown date'}</small>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="inner-card">
                <h2>Send Reply</h2>
                <textarea
                  className="admin-textarea"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows="4"
                ></textarea>

                <button 
                  className="book-button-wrapper" 
                  onClick={handleReply}
                  disabled={sendingMessage || !reply.trim()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {sendingMessage ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend size={16} />
                      Send Message
                    </>
                  )}
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

      {/* CANCEL APPOINTMENT MODAL */}
      <Modal 
        show={showCancelModal} 
        onHide={() => !isProcessing && setShowCancelModal(false)} 
        centered
        backdrop={isProcessing ? "static" : true}
        size="sm"
      >
        <Modal.Header className="modal-header-custom" closeButton={!isProcessing}>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertTriangle className="me-2" size={18} />
            Confirm Cancellation
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-custom text-center" style={{ padding: "1rem" }}>
          {selectedAppointment && (
            <>
              <div className="error-icon mb-2">
                <FiAlertTriangle size={36} />
              </div>
              <p className="mb-3" style={{ fontSize: "0.9rem" }}>
                Are you sure you want to cancel this appointment?
              </p>
              <div className="appointment-details p-2 mb-3 rounded" style={{ fontSize: "0.85rem" }}>
                <p className="mb-1"><strong>Client:</strong> {selectedAppointment.email}</p>
                <p className="mb-1"><strong>Type:</strong> {selectedAppointment.appointment_type}</p>
                <p className="mb-0"><strong>Date:</strong> {formatDateTime(selectedAppointment.date, selectedAppointment.start_time)}</p>
              </div>
              <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                A cancellation email will be sent to the client.
              </p>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-custom" style={{ padding: "0.75rem" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={isProcessing}
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
          >
            No, Keep
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCancel}
            disabled={isProcessing}
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Canceling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)} 
        centered
        backdrop="static"
        size="sm"
      >
        <Modal.Header className="modal-header-success" closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiCheckCircle className="me-2" size={18} />
            {modalTitle}
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
            onClick={() => setShowConfirmModal(false)}
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ERROR MODAL */}
      <Modal 
        show={showErrorModal} 
        onHide={() => setShowErrorModal(false)} 
        centered
        backdrop="static"
        size="sm"
      >
        <Modal.Header className="modal-header-error" closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <FiAlertCircle className="me-2" size={18} />
            {modalTitle}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-error text-center" style={{ padding: "1rem" }}>
          <div className="error-icon mb-2">
            <FiAlertCircle size={36} />
          </div>
          <p className="error-message" style={{ fontSize: "0.85rem" }}>
            {modalMessage}
          </p>
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-error justify-content-center" style={{ padding: "0.75rem" }}>
          <Button 
            variant="primary" 
            onClick={() => setShowErrorModal(false)}
            style={{ padding: "0.25rem 1rem", fontSize: "0.9rem" }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}