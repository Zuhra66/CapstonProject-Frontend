import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Modal, Button, Spinner } from "react-bootstrap";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiSend,
} from "react-icons/fi";

import "../styles/Appointment.css";

import ConversationPanel from "../components/ConversationPanel";

export default function AdminAppointments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { getAccessTokenSilently } = useAuth0();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendUser, setBackendUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [activeUserEmail, setActiveUserEmail] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const GOOGLE_CALENDAR_EMBED =
    "https://calendar.google.com/calendar/embed?src=empowermeddev%40gmail.com&ctz=America%2FLos_Angeles";

  const fetchCsrfToken = async () => {
    try {
      await fetch(`${API_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      // Error handled silently
    }
  };

  const getCsrfFromCookie = () => {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };

  const fetchBackendUser = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data?.user) setBackendUser(data.user);
      else setBackendUser(null);
    } catch (err) {
      setBackendUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCsrfToken();
      await fetchBackendUser();
      await fetchAppointments();
      await fetchMessages();
    })();
  }, []);

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
      showError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const res = await fetch(`${API_URL}/messages/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      // Error handled silently
    }
  };

  const conversations = useMemo(() => {
    const map = new Map();

    messages.forEach((msg) => {
      const otherEmail =
        msg.sender_role === "admin"
          ? msg.receiver_email
          : msg.sender_email;

      if (!otherEmail) return;

      if (!map.has(otherEmail)) {
        map.set(otherEmail, {
          email: otherEmail,
          userId: msg.sender_role === "admin"
            ? msg.receiver_id
            : msg.sender_id,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
        });
      }

      const conv = map.get(otherEmail);
      conv.messages.push(msg);
      conv.lastMessage = msg;

      if (!msg.read_at && msg.receiver_role === "admin") {
        conv.unreadCount += 1;
      }
    });

    return Array.from(map.values());
  }, [messages]);

  const activeConversation = useMemo(() => {
    if (!activeUserEmail) return null;
    return conversations.find(c => c.email === activeUserEmail) || null;
  }, [activeUserEmail, conversations]);

  async function searchUsers(query) {
    if (!query) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const res = await fetch(
        `${API_URL}/messages/admin-users?email=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(res.status);

      const data = await res.json();
      setUserResults(data.users);
    } catch (err) {
      // Error handled silently
    }
  }

  const sendAdminMessage = async (receiverId, message) => {
    const msg = (message || "").trim();
    if (!receiverId || !msg) throw new Error("Missing receiverId or message");

    setSendingMessage(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const attempt = async () => {
        const csrfToken = getCsrfFromCookie();

        return fetch(`${API_URL}/messages/admin-send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify({ userId: receiverId, message: msg }),
        });
      };

      let res = await attempt();

      if (res.status === 403) {
        await fetchCsrfToken();
        res = await attempt();
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error("Failed to send message");
      }

      await fetchMessages();
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const hasDateFilter = !!searchDate;

    let results = [...appointments];

    const normalizeDate = (d) => {
      if (!d) return "";
      return new Date(d).toISOString().split("T")[0];
    };

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

    if (searchEmail.trim() !== "") {
      const needle = searchEmail.toLowerCase();
      results = results.filter((a) =>
        (a.email || "").toLowerCase().includes(needle)
      );
    } else {
      results = [...appointments];
    }

    if (searchType) {
      const needle = searchType.toLowerCase();
      results = results.filter((a) =>
        (a.appointment_type || "").toLowerCase().includes(needle)
      );
    }

    if (hasDateFilter) {
      results = results.filter((a) => normalizeDate(a.date) === searchDate);
    }

    setFilteredAppointments(results);
  }, [statusFilter, searchEmail, searchType, searchDate, appointments]);

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
        showSuccess(
          `Appointment for ${selectedAppointment.email} has been successfully canceled.\n\nA cancellation email has been sent to the client.`
        );
        await fetchAppointments();
      } else {
        showError(data.message || "Failed to cancel appointment. Please try again.");
      }
    } catch (err) {
      showError("Network error. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
      setShowCancelModal(false);
    }
  };

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
          <div className="col">
            <div className="gradient-card">
              <div className="inner-card">
                <h2>Filter Appointments</h2>

                <div className="filter-row">
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />

                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />

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

              <div className="inner-card">
                <h2>All Appointments</h2>

                <div className="scroll-box tall">
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading appointments...</p>
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <p className="text-muted text-center">
                      No appointments match filters.
                    </p>
                  ) : (
                    filteredAppointments.map((appt) => {
                      const statusLabel = appt.status || "scheduled";

                      let canCancel = false;
                      let end;

                      if (appt.end_time) end = new Date(appt.end_time);
                      else if (appt.start_time) end = new Date(appt.start_time);
                      else if (appt.date) end = new Date(`${appt.date}T23:59:59`);

                      if (end && end > new Date() && appt.status !== "canceled") {
                        canCancel = true;
                      }

                      return (
                        <div key={appt.id} className="appointment-item-card">
                          <p>
                            <strong>{appt.email}</strong>
                          </p>
                          <p>{appt.appointment_type}</p>
                          <p>{formatDateTime(appt.date, appt.start_time)}</p>
                          <p>
                            <strong>Status:</strong> {statusLabel}
                          </p>

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

<div className="col messages-col">
  <div className="gradient-card messages-card">
    <div className="inner-card admin-messages-layout">

      <div className="messages-sidebar">

        <div className="messages-header mb-2">
          <h2 className="mb-0">Messages</h2>
        </div>

        <div className="user-search-box mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search user by email…"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              searchUsers(e.target.value);
            }}
            autoComplete="off"
          />

          {userSearch && userResults.length > 0 && (
            <div className="user-search-results mt-2">
              {userResults.map((u) => (
                <div
                  key={u.id}
                  className="user-result"
                  onClick={() => {
                    setActiveUserEmail(u.email);
                    setActiveUserId(u.id);
                    setUserSearch("");
                  }}
                >
                  <strong>{u.email}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

      <div className="admin-inbox-wrapper">
        <div className="admin-inbox-header">
          <span>Conversations</span>
        </div>

        <div className="admin-inbox">
          {conversations.length === 0 ? (
            <p className="text-muted text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={`conv-${conv.email}`}
                className={`inbox-item ${
                  activeUserEmail === conv.email ? "active" : ""
                }`}
                onClick={() => {
                  setActiveUserEmail(conv.email);
                  setActiveUserId(conv.userId || null);
                }}
              >
                <strong>{conv.email}</strong>
                <div className="text-muted">
                  {conv.lastMessage?.text?.slice(0, 40) || "No messages yet"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

      <div className="messages-thread">
        <ConversationPanel
          title={
            activeUserEmail
              ? `Conversation with ${activeUserEmail}`
              : "Select or search for a user"
          }
          messages={activeConversation?.messages || []}
          mode="admin"    
          currentUserId={backendUser?.id}
          disabled={!activeUserId}
          onSend={({ message }) => {
            if (!activeUserId) return;
            sendAdminMessage(activeUserId, message);
          }}
        />
      </div>

    </div>
  </div>
</div>
</div>
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
                <p className="mb-1">
                  <strong>Client:</strong> {selectedAppointment.email}
                </p>
                <p className="mb-1">
                  <strong>Type:</strong> {selectedAppointment.appointment_type}
                </p>
                <p className="mb-0">
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedAppointment.date, selectedAppointment.start_time)}
                </p>
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