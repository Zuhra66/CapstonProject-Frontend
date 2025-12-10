import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Use the same hook as Admin
import "../styles/Blog.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

function BlogHeader() {
    return (
        <div className="blog-hero">
            <h1 className="blog-title">EMPOWERMED BLOG</h1>
            <p className="blog-subtitle">
                Insights, reflections, and tools for your wellness journey
            </p>
        </div>
    );
}

function BlogCard({ post, isAuthenticated, getAccessTokenSilently }) {
    const [liked, setLiked] = useState(post.user_liked);
    const [likeCount, setLikeCount] = useState(post.like_count);

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            alert("Please login to like posts");
            return;
        }

        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    scope: "openid profile email"
                }
            });
            
            const response = await fetch(`${API_BASE_URL}/api/blog/${post.slug}/like`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                setLiked(!liked);
                setLikeCount(prev => liked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    return (
        <Link to={`/blog/${post.slug}`} className="blog-card">
            {post.cover_image_url && (
                <div className="blog-card-image">
                    <img 
                        src={`${API_BASE_URL}${post.cover_image_url}`} 
                        alt={post.title}
                        loading="lazy"
                    />
                </div>
            )}
            <div className="blog-card-content">
                <div className="blog-card-header">
                    {post.category && (
                        <span className="blog-card-category">{post.category}</span>
                    )}
                    {post.is_featured && (
                        <span className="blog-card-featured">Featured</span>
                    )}
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                    <div className="blog-card-meta">
                        {post.author?.avatar && (
                            <img 
                                src={post.author.avatar} 
                                alt={post.author.name}
                                className="blog-card-avatar"
                            />
                        )}
                        <span className="blog-card-author">{post.author?.name}</span>
                        <span className="blog-card-date">
                            {new Date(post.published_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="blog-card-stats">
                        <button 
                            className={`blog-card-like ${liked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            ♥ {likeCount}
                        </button>
                        <span className="blog-card-views">👁 {post.view_count}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ hasMore: false, offset: 0, limit: 9 });
    
    // Use the same Auth0 hook as your Admin components
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    const loadPosts = async (reset = false) => {
        try {
            const offset = reset ? 0 : pagination.offset;
            const url = `${API_BASE_URL}/api/blog?limit=${pagination.limit}&offset=${offset}`;
            
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (reset) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
            
            setPagination(prev => ({
                ...prev,
                offset: offset + data.posts.length,
                hasMore: data.pagination.hasMore
            }));
        } catch (err) {
            setError("Failed to load blog posts");
            console.error("Load posts error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(true);
    }, []);

    if (loading && posts.length === 0) {
        return (
            <div className="blog-page">
                <div className="blog-inner">
                    <BlogHeader />
                    <div className="blog-loading">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-page">
            <div className="blog-inner">
                <BlogHeader />
                
                {error && (
                    <div className="blog-error">
                        <p>{error}</p>
                        <button onClick={() => loadPosts(true)}>Retry</button>
                    </div>
                )}

                {posts.length === 0 && !loading ? (
                    <div className="blog-empty">
                        <p>No blog posts yet. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="blog-grid">
                            {posts.map(post => (
                                <BlogCard 
                                    key={post.id} 
                                    post={post} 
                                    isAuthenticated={isAuthenticated}
                                    getAccessTokenSilently={getAccessTokenSilently}
                                />
                            ))}
                        </div>
                        
                        {pagination.hasMore && (
                            <div className="blog-load-more">
                                <button 
                                    onClick={() => loadPosts(false)}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}