// src/pages/Events.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Events.css";
import eventsHero from "../assets/events-hero.png";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

function normalizeEvent(ev) {
  const start = ev.startTime || ev.start_time || ev.start_at;
  const end = ev.endTime || ev.end_time || ev.end_at;

  const startDate = start ? new Date(start) : null;
  const dateKey =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDate.toISOString().slice(0, 10)
      : null;

  return {
    ...ev,
    id: ev.id,
    title: ev.title || "Untitled event",
    description: ev.description || "",
    location: ev.location || "",
    start,
    end,
    dateKey,
  };
}

function formatFullDate(dateObj) {
  if (!dateObj) return "";
  return dateObj.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Events() {
  const navigate = useNavigate();

  const today = new Date();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    let alive = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to load events");

        const json = await res.json();
        if (!alive) return;

        const list = Array.isArray(json.events) ? json.events : json;
        setEvents(list.map(normalizeEvent));
      } catch (err) {
        if (!alive) return;
        setError("Failed to load events.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      alive = false;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!ev.dateKey) continue;
      if (!map[ev.dateKey]) map[ev.dateKey] = [];
      map[ev.dateKey].push(ev);
    }
    return map;
  }, [events]);

  const goPrevMonth = () => {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ type: "empty", key: `empty-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(currentYear, currentMonth, day);
    const key = d.toISOString().slice(0, 10);
    const hasEvents = !!eventsByDate[key];
    const isToday = d.toDateString() === new Date().toDateString();
    const isSelected =
      selectedDate && d.toDateString() === selectedDate.toDateString();

    cells.push({
      type: "day",
      key,
      day,
      dateObj: d,
      hasEvents,
      isToday,
      isSelected,
    });
  }

  const selectedKey =
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? selectedDate.toISOString().slice(0, 10)
      : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  function handleDayClick(cell) {
    if (!cell || !cell.dateObj || cell.type === "empty") return;

    setSelectedDate(cell.dateObj);

    const dayEvents = eventsByDate[cell.key] || [];
    if (dayEvents.length === 1) {
      const ev = dayEvents[0];
      navigate(`/events/${ev.id}`);
    }
  }

  return (
    <div className="events-page">
      <section className="events-hero">
        <div className="events-hero-text">
          <h1 className="events-hero-title">EVENTS</h1>
          <p className="events-hero-subtitle">
            Discover upcoming EmpowerMed workshops, health events, and
            community gatherings—all in one place.
          </p>
        </div>

        <div className="events-hero-image-wrapper">
          <img
            src={eventsHero}
            alt="Event Management"
            className="events-hero-image"
          />
        </div>
      </section>

      <div className="events-inner">
        {loading && <p className="events-status">Loading events…</p>}
        {error && <p className="events-status events-error">{error}</p>}

        {!loading && !error && (
          <div className="events-layout">
            <aside className="events-sidebar">
              <div className="events-calendar-card">
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goPrevMonth}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <div className="calendar-month-label">{monthLabel}</div>
                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goNextMonth}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="calendar-grid">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((name) => (
                    <div key={name} className="calendar-day-name">
                      {name}
                    </div>
                  ))}

                  {cells.map((cell) => {
                    if (cell.type === "empty") {
                      return (
                        <div
                          key={cell.key}
                          className="calendar-day empty"
                        />
                      );
                    }

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        className={[
                          "calendar-day",
                          cell.isToday ? "today" : "",
                          cell.isSelected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleDayClick(cell)}
                      >
                        <span className="calendar-day-number">
                          {cell.day}
                        </span>
                        {cell.hasEvents && (
                          <span className="calendar-dot" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="events-main">
              <h2 className="events-month-heading">{monthLabel}</h2>
              <p className="events-selected-date">
                {formatFullDate(selectedDate)}
              </p>

              {selectedEvents.length === 0 ? (
                <p className="events-status">
                  No events scheduled for this date.
                </p>
              ) : (
                <ul className="events-list">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className="event-list-item">
                      <div className="event-list-content">
                        <button
                          type="button"
                          className="event-list-title btn btn-link p-0 text-start"
                          onClick={() => navigate(`/events/${ev.id}`)}
                        >
                          {ev.title}
                        </button>

                        {ev.start && (
                          <p className="event-list-datetime">
                            {new Date(ev.start).toLocaleString()}
                          </p>
                        )}
                        {ev.location && (
                          <p className="event-list-location">
                            {ev.location}
                          </p>
                        )}
                        {ev.description && (
                          <p className="event-list-description">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;