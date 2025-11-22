// src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Events.css";

function extractSlug(page) {
  const slugProp = page.properties["Slug (URL text)"];
  return slugProp?.rich_text?.[0]?.plain_text || "";
}

function extractThumbnail(page) {
  const thumbProp = page.properties["Thumbnail"];
  const file = thumbProp?.files?.[0];
  if (!file) return null;

  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return null;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("http://localhost:3001/api/events");
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Could not load events.");
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Events</h1>
        <p className="events-subtitle">
          Explore highlights from classes, workshops, and community events.
        </p>
      </div>

      {error && <p className="events-error">{error}</p>}

      <div className="events-grid">
        {events.map((page) => {
          const slug = extractSlug(page);
          const thumbUrl = extractThumbnail(page);

          if (!slug || !thumbUrl) return null;

          return (
            <Link
              key={page.id}
              to={`/events/${slug}`}
              className="event-card-link"
            >
              <div className="event-card">
                <img
                  src={thumbUrl}
                  alt={page.properties.Name.title?.[0]?.plain_text || "Event"}
                  className="event-card-image"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
