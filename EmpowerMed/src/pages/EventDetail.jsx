// src/pages/EventDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Events.css";

// ✅ Use backend env variable (Render) or localhost (dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function extractTitle(page) {
  const t = page?.properties?.Name?.title?.[0]?.plain_text;
  return t || "Event";
}

function extractDate(page) {
  const d = page?.properties?.["Event Date"]?.date?.start;
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function extractBodyImages(blocks = []) {
  return blocks
    .filter((b) => b.type === "image")
    .map((b) => {
      const img = b.image;
      if (img.type === "file") return img.file.url;
      if (img.type === "external") return img.external.url;
      return null;
    })
    .filter(Boolean);
}

function extractParagraphs(blocks = []) {
  return blocks
    .filter((b) => b.type === "paragraph")
    .map((b) =>
      (b.paragraph.rich_text || [])
        .map((rt) => rt.plain_text || "")
        .join("")
        .trim()
    )
    .filter((txt) => txt.length > 0);
}

export default function EventDetail() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError(null);

        // ✅ FIXED: use API_BASE_URL instead of localhost
        const res = await fetch(`${API_BASE_URL}/api/events/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();
        setPage(data.page);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Could not load this event.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="event-detail">
        <p>Loading event…</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="event-detail">
        <p className="event-error">{error || "Could not load this event."}</p>
        <Link to="/events" className="back-link">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const title = extractTitle(page);
  const date = extractDate(page);
  const images = extractBodyImages(blocks);
  const paragraphs = extractParagraphs(blocks);

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">
        ← Back to Events
      </Link>

      <div className="event-detail-card">
        <header className="event-detail-header">
          <h1 className="event-detail-title">{title}</h1>
          {date && <p className="event-detail-date">{date}</p>}
        </header>

        {images.length > 0 && (
          <div className="event-detail-images">
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${title} flyer ${idx + 1}`}
                className="event-detail-image"
              />
            ))}
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="event-detail-body">
            {paragraphs.map((text, idx) => (
              <p key={idx}>{text}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
