// src/pages/EducationalHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import s from "../styles/EducationalHub.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

/**
 * Static, curated content for EmpowerMEd Education & Resources.
 * These are merged with any content returned by /api/education.
 */
const STATIC_ARTICLES = [
  {
    id: "burnout-alison",
    title:
      "Mental Health Studies – Understanding Behaviour, Burnout and Depression",
    href: "https://alison.com/course/mental-health-studies-understanding-behaviour-burnout-and-depression",
    summary:
      "Free online course (English & Spanish) exploring behaviour, burnout, depression, and foundations of mental health.",
    minutes: 120,
    tags: ["Burnout", "Free Course", "Spanish / English"],
    cover_url: "",
  },
  {
    id: "burnout-physicourses",
    title: "How Practitioners Can Beat Burnout",
    href: "https://www.physicourses-platform.com/p/free-course-beat-provider-burnout?utm_source=chatgpt.com",
    summary:
      "Free course designed for healthcare professionals to recognize, prevent, and recover from provider burnout.",
    minutes: 90,
    tags: ["Burnout", "Free Course", "Healthcare"],
    cover_url: "",
  },
  {
    id: "emotion-regulation-pp",
    title: "Emotional Regulation: 5 Evidence-Based Techniques",
    href: "https://positivepsychology.com/emotion-regulation/",
    summary:
      "Evidence-based strategies to understand emotions, build emotional regulation skills, and respond more calmly to stress.",
    minutes: 15,
    tags: ["Stress", "Emotional Regulation", "Lifestyle"],
    cover_url: "",
  },
  {
    id: "stress-yipa",
    title: "Regulating Stress to Revitalize Mental Health",
    href: "https://training.yipa.org/blended-interactive-course/regulating-stress-to-revitalize-mental-health/",
    summary:
      "Training that teaches the “3 R’s” model—Rest, Restoration, and Revitalization—to support mental health.",
    minutes: 60,
    tags: ["Stress", "Free Course"],
    cover_url: "",
  },
  {
    id: "nervous-system-embodiment",
    title: "Nervous System Regulation: 8-Week Embodied Resilience",
    href: "https://embodimentunlimited.com/nervous-system-regulation/",
    summary:
      "An 8-week program offering practical tools for nervous system regulation, embodied resilience, and healthy boundaries.",
    minutes: 240,
    tags: ["Trauma & Nervous System", "Boundaries", "Lifestyle"],
    cover_url: "",
  },
  {
    id: "nervous-system-mbf",
    title: "Emotional Processing & Nervous System Regulation",
    href: "https://mindbodyfoodinstitute.com/emotional-processing-nervous-system-regulation-certification/",
    summary:
      "Training focused on somatic practices, trauma, emotional processing, and nervous system health.",
    minutes: 240,
    tags: ["Trauma & Nervous System", "Stress"],
    cover_url: "",
  },
  {
    id: "boundaries-embedded",
    title: "Healthy Boundaries in Embodied Resilience",
    href: "https://embodimentunlimited.com/nervous-system-regulation/?utm_source=chatgpt.com",
    summary:
      "Within the Embodiment Unlimited course, weeks 3+ focus deeply on healthy boundaries, consent, and embodied communication.",
    minutes: 60,
    tags: ["Boundaries", "Trauma & Nervous System"],
    cover_url: "",
  },
  {
    id: "faith-resilience-overview",
    title: "Faith & Spiritual Resilience",
    href: "#faith-spiritual-resilience",
    summary:
      "Overview of how faith, Scripture, and spiritual practices can support mental and emotional wellness.",
    minutes: 5,
    tags: ["Faith & Spiritual"],
    cover_url: "",
  },
  {
    id: "lifestyle-overview",
    title: "Lifestyle Wellness Foundations",
    href: "#lifestyle-wellness",
    summary:
      "Key rhythms—sleep, movement, hydration, nutrition, rest, and community—that support whole-person health.",
    minutes: 5,
    tags: ["Lifestyle"],
    cover_url: "",
  },
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

export default function EducationalHub() {
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load content from API and merge with static content
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

        if (!res.ok) {
          throw new Error(`Education API error ${res.status}`);
        }

        const data = await res.json();

        if (!alive) return;

        const apiArticles = data.articles || [];
        const apiVideos = data.videos || [];
        const apiDownloads = data.downloads || [];

        // Merge static content first (so it always appears),
        // then any dynamic content from the API.
        setArticles([...STATIC_ARTICLES, ...apiArticles]);
        setVideos([...STATIC_VIDEOS, ...apiVideos]);
        setDownloads([...STATIC_DOWNLOADS, ...apiDownloads]);
      } catch (e) {
        console.error(e);
        if (!alive) return;

        // If API fails, still show static curated content
        setArticles(STATIC_ARTICLES);
        setVideos(STATIC_VIDEOS);
        setDownloads(STATIC_DOWNLOADS);
        setErr(""); // keep UI clean, we still have content
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, tag]);

  // Apply client-side search & tag filtering to articles
  const filteredArticles = useMemo(() => {
    if (!articles.length) return [];

    return articles.filter((a) => {
      const tags = a.tags || [];
      const byTag = tag === "All" || tags.includes(tag);

      const haystack = `${a.title ?? ""} ${a.summary ?? ""} ${tags.join(
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
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Featured Articles &amp; Courses</h2>
          <div className={s.grid}>
            {filteredArticles.map((a) => (
              <article key={a.id} className={s.card}>
                {a.href && a.href !== "#" ? (
                  <a href={a.href} target="_blank" rel="noopener noreferrer">
                    {a.cover_url ? (
                      <img className={s.thumb} src={a.cover_url} alt={a.title} />
                    ) : (
                      <div className={s.thumb} aria-label="No image available" />
                    )}
                  </a>
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
            ))}
            {!filteredArticles.length && (
              <div className={s.muted}>
                No results for this filter. Try a different tag or search term.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Video Guides */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Video Guides</h2>
          <p className={s.muted}>
            Video-based trainings and workshops will appear here as they become
            available.
          </p>
          <div className={s.gridSmall}>
            {videos.map((v) => (
              <a
                key={v.id}
                className={s.videoCard}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {v.thumb_url ? (
                  <img
                    className={s.videoThumb}
                    src={v.thumb_url}
                    alt={v.title}
                  />
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

      {/* Downloads / Free resources */}
      {!loading && !err && (
        <section className={s.wrap}>
          <h2 className={s.sectionTitle}>Free Resources</h2>
          <p className={s.cardSummary}>
            These tools are designed to be simple, printable, and easy to use in
            your own wellness journey or with small groups, families, and care
            teams.
          </p>
          <ul className={s.downloads}>
            {downloads.map((d) => (
              <li key={d.id} className={s.downloadItem}>
                <div>
                  <div className={s.dlTitle}>{d.title}</div>
                  <div className={s.muted}>{d.file_size}</div>
                </div>
                {d.href && d.href !== "#" ? (
                  <a className={s.dlBtn} href={d.href} download>
                    Download
                  </a>
                ) : (
                  <button className={s.dlBtn} type="button" disabled>
                    Coming soon
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

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
