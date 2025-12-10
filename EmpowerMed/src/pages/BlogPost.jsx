// src/pages/BlogPost.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Blog.css"; 

// ✅ Use env var in production, localhost in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function BlogPost() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);

        if (!res.ok) {
          const text = await res.text();
          console.error("Backend error:", text);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setPage(data.page || null);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <p>Loading post…</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="blog-page">
        <div className="blog-inner">
          <p style={{ color: "red" }}>{error || "Post not found."}</p>
        </div>
      </div>
    );
  }

  const props = page.properties || {};
  const title = props.Name?.title?.[0]?.plain_text || "Untitled post";
  const publishDateProp = props["Publish Date"];
  const publishDate = publishDateProp?.date?.start;

  return (
    <div className="blog-page">
      <div className="blog-inner blog-post">
        <article>
          <header className="blog-post-header">
            <h1 className="blog-post-title">{title}</h1>
            {publishDate && (
              <p className="blog-post-date">
                {new Date(publishDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </header>

          <section className="blog-post-content">
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </section>
        </article>
      </div>
    </div>
  );
}

/**
 * Renders a single Notion block (paragraph, heading, list, image, etc.)
 */
function BlockRenderer({ block }) {
  const { type } = block;
  const value = block[type];

  if (!value) return null;

  const getText = (rich) =>
    rich?.map((t) => t.plain_text).join("") || "";

  switch (type) {
    case "paragraph":
      return <p className="bp-paragraph">{getText(value.rich_text)}</p>;

    case "heading_1":
      return <h2 className="bp-heading-1">{getText(value.rich_text)}</h2>;

    case "heading_2":
      return <h3 className="bp-heading-2">{getText(value.rich_text)}</h3>;

    case "heading_3":
      return <h4 className="bp-heading-3">{getText(value.rich_text)}</h4>;

    case "bulleted_list_item":
      return (
        <ul className="bp-list">
          <li>{getText(value.rich_text)}</li>
        </ul>
      );

    case "numbered_list_item":
      return (
        <ol className="bp-list">
          <li>{getText(value.rich_text)}</li>
        </ol>
      );

    case "image": {
      const image = value;
      let src = "";

      if (image.type === "external") {
        src = image.external?.url;
      } else if (image.type === "file") {
        src = image.file?.url;
      }

      const alt = image.caption?.[0]?.plain_text || "";
      if (!src) return null;

      return (
        <figure className="bp-image-wrapper">
          <img src={src} alt={alt} className="bp-image" />
          {alt && (
            <figcaption className="bp-image-caption">{alt}</figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}

export default BlogPost;