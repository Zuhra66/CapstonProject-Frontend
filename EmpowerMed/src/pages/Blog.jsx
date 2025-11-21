// src/pages/Blog.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Blog.css";

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("http://localhost:3001/api/blog");

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend error:", text);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const normalized = Array.isArray(data) ? data : data.results || [];

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
          <h1 className="blog-title">Blog</h1>
          <p className="blog-subtitle">Loading posts…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <h1 className="blog-title">Blog</h1>
          <p className="blog-subtitle blog-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <h1 className="blog-title">Blog</h1>
          <p className="blog-subtitle">No published posts yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-inner">
        <h1 className="blog-title">EmpowerMEd Blog</h1>
        <p className="blog-subtitle">
          This blog shares easy-to-understand wellness insights, practical health tips, and empowering information to support your well-being.
        </p>

        <div className="blog-grid">
          {posts.map((page) => {
            const props = page.properties || {};

            const title =
              props.Name?.title?.[0]?.plain_text || "Untitled post";

            const slugProp = props["Slug (URL text)"] || props.Slug;
            const slug = slugProp?.rich_text?.[0]?.plain_text || "";

            const publishDateProp = props["Publish Date"];
            const publishDate = publishDateProp?.date?.start;

            // Optional preview text from a Notion property if you add one
            const preview =
              props.Summary?.rich_text?.[0]?.plain_text ||
              props.Description?.rich_text?.[0]?.plain_text ||
              props.Excerpt?.rich_text?.[0]?.plain_text ||
              "Click to read the full article.";

            if (!slug) return null; // don't show posts without a slug

            return (
              <Link
                key={page.id}
                to={`/blog/${slug}`}
                className="blog-card"
              >
                <div className="blog-card-header">
                  <span className="blog-card-tag">Wellness</span>
                  {publishDate && (
                    <span className="blog-card-date">
                      {new Date(publishDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="blog-card-title">{title}</h2>
                <p className="blog-card-preview">{preview}</p>
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
