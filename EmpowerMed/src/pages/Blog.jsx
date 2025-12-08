// src/pages/Blog.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Blog.css";

// Use same base URL as rest of app & strip trailing slashes
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

function BlogHeader({ subtitleExtra }) {
  return (
    <>
      <h1 className="blog-title">EMPOWERMED BLOG – INSIGHTS &amp; REFLECTIONS</h1>
      <p className="blog-subtitle">
        A space dedicated to sharing stories, inspiration, healing moments, and tools for
        personal growth.
      </p>

      {subtitleExtra && (
        <p className="blog-subtitle">{subtitleExtra}</p>
      )}

      <div className="blog-themes">
        <h2 className="blog-themes-title">Blog Themes</h2>
        <ul className="blog-themes-list">
          <li>Emotional resilience</li>
          <li>Faith reflections</li>
          <li>Mindset growth</li>
          <li>Burnout recovery</li>
          <li>Life lessons</li>
          <li>Wellness strategies</li>
          <li>Leadership &amp; purpose</li>
          <li>Empowerment stories</li>
        </ul>
        <p className="blog-themes-note">
          Each entry is designed to encourage, uplift, and guide you on your wellness journey.
        </p>
      </div>
    </>
  );
}

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blog`);

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend error:", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // Backend returns { posts: [...] }
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
          ? data.posts
          : [];

        setPosts(normalized);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <BlogHeader subtitleExtra="Loading posts…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <BlogHeader />
          <p className="blog-subtitle blog-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <BlogHeader />
          <p className="blog-subtitle">No published posts yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-inner">
        <BlogHeader />
        <div className="blog-grid">
          {posts.map((post) => {
            const { id, title, slug, publishedAt, preview } = post;

            if (!slug) return null;

            return (
              <Link key={id} to={`/blog/${slug}`} className="blog-card">
                <div className="blog-card-header">
                  <span className="blog-card-tag">Wellness</span>
                  {publishedAt && (
                    <span className="blog-card-date">
                      {new Date(publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="blog-card-title">{title || "Untitled post"}</h2>
                <p className="blog-card-preview">
                  {preview || "Click to read the full article."}
                </p>
                <span className="blog-card-link">Read more →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Blog;
