import React, { useEffect, useMemo, useState } from "react";
import s from "../styles/EducationalHub.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TAGS = [
  "All",
  "New to EmpowerMed",
  "Hydration",
  "IV Therapy",
  "Skincare",
  "Routines",
  "Supplements",
  "Wellness",
];

export default function EducationalHub() {
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load content whenever q/tag changes
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const url = new URL(`${API_BASE}/api/education`);
        if (q) url.searchParams.set("q", q);
        if (tag && tag !== "All") url.searchParams.set("tag", tag);

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Education ${res.status}`);
        const data = await res.json();

        if (!alive) return;
        setArticles(data.articles || []);
        setVideos(data.videos || []);
        setDownloads(data.downloads || []);
      } catch (e) {
        console.error(e);
        if (alive) setErr("We couldn’t load education content. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, tag]);

  const filteredArticles = useMemo(() => {
    if (!articles.length) return [];
    if (!q && (tag === "All" || !tag)) return articles;

    return articles.filter((a) => {
      const tags = a.tags || [];
      const byTag = tag === "All" || tags.includes(tag);
      const hay = `${a.title ?? ""} ${a.summary ?? ""} ${tags.join(" ")}`.toLowerCase();
      const byQ = q ? hay.includes(q.toLowerCase()) : true;
      return byTag && byQ;
    });
  }, [articles, q, tag]);

  return (
    <div className={s.page}>
      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <h1 className={s.title}>Educational Hub</h1>
          <p className={s.subtitle}>Clinician-reviewed guides and resources.</p>

          <div className={s.toolbar}>
            <div className={s.search}>
              <span className={s.searchIcon}>🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search topics…"
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

      <section className={s.wrap}>
        {loading && <div className={s.muted}>Loading…</div>}
        {err && !loading && <div className={s.muted}>{err}</div>}
      </section>

      {/* Featured Articles */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Featured Articles</h2>
          <div className={s.grid}>
            {filteredArticles.map((a) => (
              <article key={a.id} className={s.card}>
                <a href={a.href} target="_blank" rel="noopener noreferrer">
                  {/* API uses cover_url */}
                  {a.cover_url ? (
                    <img className={s.thumb} src={a.cover_url} alt={a.title} />
                  ) : (
                    <div className={s.thumb} aria-label="No image available" />
                  )}
                </a>
                <div className={s.cardBody}>
                  <a
                    className={s.cardTitle}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.title}
                  </a>
                  <p className={s.cardSummary}>{a.summary}</p>
                  <div className={s.metaRow}>
                    <span className={s.meta}>
                      {(a.minutes ?? 3)} min read
                    </span>
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
            ))}
            {!filteredArticles.length && (
              <div className={s.muted}>No results. Try a different tag or search.</div>
            )}
          </div>
        </section>
      )}

      {/* Video Guides */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Video Guides</h2>
          <div className={s.gridSmall}>
            {videos.map((v) => (
              <a
                key={v.id}
                className={s.videoCard}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* API uses thumb_url */}
                {v.thumb_url ? (
                  <img className={s.videoThumb} src={v.thumb_url} alt={v.title} />
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
            ))}
            {!videos.length && <div className={s.muted}>No videos yet.</div>}
          </div>
        </section>
      )}

      {/* Downloads */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Downloads</h2>
          <ul className={s.downloads}>
            {downloads.map((d) => (
              <li key={d.id} className={s.downloadItem}>
                <div>
                  <div className={s.dlTitle}>{d.title}</div>
                  {/* API uses file_size */}
                  <div className={s.muted}>{d.file_size}</div>
                </div>
                <a className={s.dlBtn} href={d.href} download>
                  Download
                </a>
              </li>
            ))}
            {!downloads.length && <div className={s.muted}>No downloads yet.</div>}
          </ul>
        </section>
      )}
    </div>
  );
}
