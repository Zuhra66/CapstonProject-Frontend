// src/pages/Events.jsx
import { useEffect, useState } from "react";
import "../styles/Events.css";

// Use your backend URL (change 5001 if your server uses a different port)
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

// Turn the image path from the DB into a full URL
function resolveImageUrl(ev) {
  const raw = ev.imageUrl || ev.image_url;
  if (!raw) return null;

  // If it's already absolute (starts with http/https), just use it
  if (/^https?:\/\//i.test(raw)) return raw;

  // Otherwise assume it's something like "/uploads/events/xxx.png"
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE_URL}${path}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/events`);

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Events backend error:", res.status, text);
          throw new Error(`Failed to load events (HTTP ${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Could not load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div className="events-page">
      <div className="events-inner">
        <div className="events-header">
          <h1 className="events-title">Events</h1>
          <p className="events-subtitle">
            Explore highlights from classes, workshops, and community events.
          </p>
        </div>

        {loading && (
          <p className="events-status">Loading events…</p>
        )}

        {!loading && error && (
          <p className="events-status events-error">{error}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="events-status">
            No upcoming events yet. Check back soon!
          </p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((ev) => {
              const imageUrl = resolveImageUrl(ev);

              return (
                <div key={ev.id} className="event-card">
                  {imageUrl && (
                    <div className="event-card-image-wrapper">
                      <img
                        src={imageUrl}
                        alt={ev.title || "Event image"}
                        className="event-card-image"
                      />
                    </div>
                  )}

                  <div className="event-card-content">
                    <div className="event-card-header">
                      <h2 className="event-card-title">
                        {ev.title || "Untitled event"}
                      </h2>
                      {ev.startTime || ev.start_time ? (
                        <span className="event-card-date">
                          {formatDateTime(ev.startTime || ev.start_time)}
                        </span>
                      ) : null}
                    </div>

                    {ev.location && (
                      <p className="event-card-location">
                        {ev.location}
                      </p>
                    )}

                    {ev.description && (
                      <p className="event-card-description">
                        {ev.description}
                      </p>
                    )}

                    {ev.endTime || ev.end_time ? (
                      <p className="event-card-time-range">
                        Ends: {formatDateTime(ev.endTime || ev.end_time)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
