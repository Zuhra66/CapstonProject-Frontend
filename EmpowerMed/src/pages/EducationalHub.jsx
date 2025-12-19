// src/pages/EducationalHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import s from "../styles/EducationalHub.module.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

// Tags used for filter pills
const TAGS = [
  "All",
  "Burnout",
  "Stress",
  "Trauma & Nervous System",
  "Boundaries",
  "Faith & Spiritual",
  "Lifestyle",
  "Free Course",
  "Spanish / English",
];

// Could be populated later if you have video-specific links
const STATIC_VIDEOS = [];

const STATIC_DOWNLOADS = [
  {
    id: "reflection-worksheets",
    title: "Reflection Worksheets",
    href: "#",
    file_size: "PDF – coming soon",
  },
  {
    id: "weekly-wellness-tools",
    title: "Weekly Wellness Tools",
    href: "#",
    file_size: "PDF – coming soon",
  },
  {
    id: "mindset-challenges",
    title: "Mindset Challenges",
    href: "#",
    file_size: "PDF – coming soon",
  },
  {
    id: "printable-guides",
    title: "Printable Guides",
    href: "#",
    file_size: "PDF – coming soon",
  },
  {
    id: "spanish-english-resources",
    title: "Spanish / English Resources",
    href: "#",
    file_size: "Bilingual PDFs – coming soon",
  },
  {
    id: "biblical-affirmations",
    title: "Biblical Affirmations",
    href: "#",
    file_size: "Printable cards – coming soon",
  },
];

// 🔧 Helper: if URL is relative (/uploads/...), prefix with backend base URL
function withApiBase(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url; // some other relative URL; leave as-is
}

// 🔎 Helper: derive a thumbnail for videos
function getVideoThumb(v) {
  // 1) Prefer explicit thumbnail URL from API/DB
  if (v.thumb_url) return withApiBase(v.thumb_url);
  if (v.thumb) return withApiBase(v.thumb);

  // 2) Try to infer from YouTube link
  if (v.href) {
    const match = v.href.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (match && match[1]) {
      const id = match[1];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }

  // 3) Fallback: no thumbnail
  return "";
}

export default function EducationalHub() {
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Load content from API ONCE; client-side handles search & tags
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/education`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Education API error ${res.status}`);
        }

        const data = await res.json();
        if (!alive) return;

        const apiArticles = data.articles || [];
        const apiVideos = data.videos || [];
        const apiDownloads = data.downloads || [];

        setArticles(apiArticles);
        setVideos([...STATIC_VIDEOS, ...apiVideos]);
        setDownloads([...STATIC_DOWNLOADS, ...apiDownloads]);
      } catch (e) {
        console.error(e);
        if (!alive) return;

        // If API fails, just show no articles and keep static downloads
        setArticles([]);
        setVideos(STATIC_VIDEOS);
        setDownloads(STATIC_DOWNLOADS);
        setErr("Unable to load education resources right now.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []); // 👈 no q/tag deps

  // ✅ Client-side search & tag filtering
  const filteredArticles = useMemo(() => {
    if (!articles.length) return [];

    const selectedTag = tag.toLowerCase();

    return articles.filter((a) => {
      const tags = (a.tags || []).map((t) => t.toLowerCase());
      const byTag = tag === "All" || tags.includes(selectedTag);

      const haystack = `${a.title ?? ""} ${a.summary ?? ""} ${(a.tags || []).join(
        " "
      )}`.toLowerCase();
      const byQ = q ? haystack.includes(q.toLowerCase()) : true;

      return byTag && byQ;
    });
  }, [articles, q, tag]);

  return (
    <div className={s.page}>
      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <h1 className={s.title}>Education &amp; Resources</h1>
          <p className={s.subtitle}>
            EmpowerMEd provides educational tools designed to strengthen your
            mental, emotional, spiritual, and physical wellness.
          </p>

          <div className={s.toolbar}>
            <div className={s.search}>
              <span className={s.searchIcon}>🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search topics (burnout, stress, faith, boundaries)…"
                aria-label="Search education content"
              />
            </div>

            <div className={s.tags}>
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`${s.pill} ${tag === t ? s.pillActive : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Status messages */}
      <section className={s.wrap}>
        {loading && <div className={s.muted}>Loading resources…</div>}
        {err && !loading && <div className={s.muted}>{err}</div>}
      </section>

      {/* Core topics overview / purpose */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Core Topics</h2>
          <p className={s.cardSummary}>
            Our educational materials focus on understanding burnout, stress and
            emotional regulation, trauma and the nervous system, healthy
            boundaries, faith &amp; spiritual resilience, and lifestyle
            wellness. The goal is to{" "}
            <strong>teach, empower, and equip individuals</strong> to make
            sustainable changes that support lifelong wellness.
          </p>
        </section>
      )}

      {/* Featured Articles & Courses */}
      <section className={s.wrap}>
        <h2 className={s.sectionTitle}>Featured Articles &amp; Courses</h2>
        <div className={s.grid}>
          {filteredArticles.map((a) => {
            const coverUrl = withApiBase(a.cover_url || a.cover || "");
            return (
              <article key={a.id} className={s.card}>
                {a.href && a.href !== "#" ? (
                  <a href={a.href} target="_blank" rel="noopener noreferrer">
                    {coverUrl ? (
                      <img className={s.thumb} src={coverUrl} alt={a.title} />
                    ) : (
                      <div className={s.thumb} aria-label="No image available" />
                    )}
                  </a>
                ) : coverUrl ? (
                  <img className={s.thumb} src={coverUrl} alt={a.title} />
                ) : (
                  <div className={s.thumb} aria-label="No image available" />
                )}

                <div className={s.cardBody}>
                  {a.href && a.href !== "#" ? (
                    <a
                      className={s.cardTitle}
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {a.title}
                    </a>
                  ) : (
                    <div className={s.cardTitle}>{a.title}</div>
                  )}

                  <p className={s.cardSummary}>{a.summary}</p>
                  <div className={s.metaRow}>
                    {a.minutes && (
                      <span className={s.meta}>{a.minutes} min read</span>
                    )}
                    <div className={s.tagRow}>
                      {(a.tags || []).map((t) => (
                        <span key={t} className={s.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {!filteredArticles.length && !loading && !err && (
            <div className={s.muted}>
              No results for this filter. Try a different tag or search term.
            </div>
          )}
        </div>
      </section>

      {/* Video Guides */}
      <section className={s.wrap}>
        <h2 className={s.sectionTitle}>Video Guides</h2>
        <p className={s.muted}>
          Video-based trainings and workshops will appear here as they become
          available.
        </p>
        <div className={s.gridSmall}>
          {videos.map((v) => {
            const thumbUrl = getVideoThumb(v);
            return (
              <a
                key={v.id}
                className={s.videoCard}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {thumbUrl ? (
                  <img className={s.videoThumb} src={thumbUrl} alt={v.title} />
                ) : (
                  <div className={s.videoThumb} aria-label="No thumbnail" />
                )}
                <div className={s.videoBody}>
                  <div className={s.videoTitle}>{v.title}</div>
                  <div className={s.videoMeta}>
                    <span>{v.duration}</span>
                    <span className={s.dot}>•</span>
                    <span>{(v.tags || []).join(", ")}</span>
                  </div>
                </div>
              </a>
            );
          })}
          {!videos.length && !loading && (
            <div className={s.muted}>No videos yet.</div>
          )}
        </div>
      </section>

      {/* Purpose section at the bottom */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Our Educational Purpose</h2>
          <p className={s.cardSummary}>
            The purpose of EmpowerMEd’s educational material is to{" "}
            <strong>teach, empower, and equip</strong> individuals to make
            sustainable changes that support lifelong wellness. We believe that
            combining evidence-based tools, faith-informed practices, and
            practical resources creates a pathway toward mental, emotional,
            spiritual, and physical wholeness.
          </p>
        </section>
      )}
    </div>
  );
}
