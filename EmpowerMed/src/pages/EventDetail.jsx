// src/pages/EventDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Events.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

// Normalize whatever backend sends (`/uploads/...`, `uploads/...`, full URL, etc.)
function getRawFilePath(ev) {
  const raw = ev.imageUrl || ev.image_url;
  if (!raw) return null;
  // if backend already returned a full URL, keep it
  if (/^https?:\/\//i.test(raw)) return raw;
  // otherwise force it to start with a single /
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

// For IMAGES we’re fine using absolute URLs
function resolveImageUrl(ev) {
  const raw = getRawFilePath(ev);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${API_BASE_URL}${raw}`;
}

export default function EventDetail() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadEvent() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");

        const json = await res.json();
        if (!alive) return;

        const ev = json.event || json;
        setEvent(ev);
      } catch (err) {
        console.error("Error fetching event:", err);
        if (!alive) return;
        setError("Could not load this event.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadEvent();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="event-detail">
        <p>Loading event…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail">
        <p className="event-error">{error || "Could not load this event."}</p>
        <Link to="/events" className="back-link">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const rawPath = getRawFilePath(event);
  const isPdf = rawPath && /\.pdf(\?|#|$)/i.test(rawPath);

  // Images: use full API URL
  const imageUrl = !isPdf ? resolveImageUrl(event) : null;

  // PDFs: keep SAME-ORIGIN path when possible so iframe works
  const pdfUrl = isPdf
    ? /^https?:\/\//i.test(rawPath)
      ? rawPath
      : rawPath // e.g. "/uploads/events/1234-flyer.pdf"
    : null;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">
        ← Back to Events
      </Link>

      <div className="event-detail-card">
        <header className="event-detail-header">
          <h1 className="event-detail-title">
            {event.title || "Untitled event"}
          </h1>
          {(event.startTime || event.start_time) && (
            <p className="event-detail-date">
              {formatDateTime(event.startTime || event.start_time)}
            </p>
          )}
          {event.location && (
            <p className="event-card-location">{event.location}</p>
          )}
        </header>

        {/* MEDIA AREA: PDF in a big box OR image */}
        {pdfUrl && (
          <div className="event-detail-media">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="event-detail-pdf-link"
            >
              View event flyer (PDF)
            </a>

            <div className="event-detail-pdf-box">
              <iframe
                src={pdfUrl}
                title="Event flyer"
                className="event-detail-pdf-iframe"
              />
            </div>
          </div>
        )}

        {imageUrl && !pdfUrl && (
          <div className="event-detail-media">
            <img
              src={imageUrl}
              alt={event.title || "Event image"}
              className="event-detail-image"
            />
          </div>
        )}

        {event.description && (
          <div className="event-detail-body">
            <p>{event.description}</p>
          </div>
        )}

        {(event.endTime || event.end_time) && (
          <p className="event-card-time-range">
            Ends: {formatDateTime(event.endTime || event.end_time)}
          </p>
        )}
      </div>
    </div>
  );
}
