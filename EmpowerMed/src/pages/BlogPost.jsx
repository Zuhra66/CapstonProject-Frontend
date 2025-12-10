import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Use the same hook as Admin
import ReactMarkdown from "react-markdown";
import "../styles/Blog.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

export default function BlogPost() {
    const { slug } = useParams();
    // Use the same Auth0 hook as your Admin components
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        loadPost();
    }, [slug]);

    const loadPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            setPost(data.post);
            setComments(data.comments || []);
            setLiked(data.post.user_liked);
            setLikeCount(data.post.like_count);
        } catch (err) {
            setError("Failed to load blog post");
            console.error("Load post error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
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
            
            const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/like`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLiked(data.liked);
                setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.location.origin,
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    scope: 'openid profile email'
                }
            });
            return;
        }

        if (!newComment.trim()) {
            alert("Please enter a comment");
            return;
        }

        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    scope: "openid profile email"
                }
            });
            
            const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/comments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: newComment.trim(),
                    parent_id: replyTo
                })
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prev => {
                    if (replyTo) {
                        return addReplyToComments(prev, replyTo, data.comment);
                    }
                    return [data.comment, ...prev];
                });
                setNewComment("");
                setReplyTo(null);
            }
        } catch (error) {
            console.error("Comment error:", error);
            alert("Failed to post comment");
        }
    };

    const addReplyToComments = (comments, parentId, newComment) => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment]
                };
            }
            if (comment.replies) {
                return {
                    ...comment,
                    replies: addReplyToComments(comment.replies, parentId, newComment)
                };
            }
            return comment;
        });
    };

    if (loading) {
        return (
            <div className="blog-page">
                <div className="blog-inner blog-post">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-page">
                <div className="blog-inner blog-post">
                    <div className="blog-error">
                        <p>{error || "Post not found"}</p>
                        <Link to="/blog">Back to Blog</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-page">
            <div className="blog-inner blog-post">
                <article>
                    {post.cover_image_url && (
                        <div className="blog-post-cover">
                            <img 
                                src={`${API_BASE_URL}${post.cover_image_url}`} 
                                alt={post.title}
                                loading="lazy"
                            />
                        </div>
                    )}
                    
                    <header className="blog-post-header">
                        <div className="blog-post-meta">
                            {post.category && (
                                <span className="blog-post-category">{post.category}</span>
                            )}
                            {post.is_featured && (
                                <span className="blog-post-featured">Featured</span>
                            )}
                        </div>
                        <h1 className="blog-post-title">{post.title}</h1>
                        <div className="blog-post-author">
                            {post.author?.avatar && (
                                <img 
                                    src={post.author.avatar} 
                                    alt={post.author.name}
                                    className="blog-post-author-avatar"
                                />
                            )}
                            <div>
                                <span className="blog-post-author-name">
                                    {post.author?.name}
                                </span>
                                <span className="blog-post-date">
                                    {new Date(post.published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="blog-post-stats">
                        <button 
                            className={`blog-post-like ${liked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            ♥ {likeCount}
                        </button>
                        <span className="blog-post-views">👁 {post.view_count} views</span>
                    </div>

                    <div className="blog-post-content">
                        <ReactMarkdown>{post.content_md}</ReactMarkdown>
                    </div>

                    <section className="blog-comments">
                        <h2 className="blog-comments-title">
                            Comments ({comments.length})
                        </h2>

                        {!isAuthenticated ? (
                            <div className="blog-comments-login">
                                <p>Please <button onClick={() => loginWithRedirect({
                                    authorizationParams: {
                                        redirect_uri: window.location.origin,
                                        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                                        scope: 'openid profile email'
                                    }
                                })}>login</button> to post comments</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitComment} className="blog-comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                                    rows="4"
                                />
                                <div className="blog-comment-form-actions">
                                    {replyTo && (
                                        <button 
                                            type="button"
                                            onClick={() => setReplyTo(null)}
                                            className="blog-comment-cancel-reply"
                                        >
                                            Cancel Reply
                                        </button>
                                    )}
                                    <button type="submit" className="blog-comment-submit">
                                        {replyTo ? "Post Reply" : "Post Comment"}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="blog-comments-list">
                            {comments.map(comment => (
                                <Comment 
                                    key={comment.id} 
                                    comment={comment} 
                                    onReply={setReplyTo}
                                    isAuthenticated={isAuthenticated}
                                />
                            ))}
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
}

function Comment({ comment, onReply, isAuthenticated }) {
    return (
        <div className={`blog-comment ${comment.user_role === 'Administrator' ? 'admin' : ''}`}>
            <div className="blog-comment-header">
                <img 
                    src={comment.user_avatar || "/default-avatar.png"} 
                    alt={comment.user_name}
                    className="blog-comment-avatar"
                />
                <div>
                    <span className="blog-comment-author">{comment.user_name}</span>
                    {comment.user_role && (
                        <span className={`blog-comment-role ${comment.user_role.toLowerCase()}`}>
                            {comment.user_role}
                        </span>
                    )}
                    <span className="blog-comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className="blog-comment-content">
                <p>{comment.content}</p>
            </div>
            <div className="blog-comment-actions">
                {isAuthenticated && (
                    <button 
                        onClick={() => onReply(comment.id)}
                        className="blog-comment-reply"
                    >
                        Reply
                    </button>
                )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="blog-comment-replies">
                    {comment.replies.map(reply => (
                        <Comment 
                            key={reply.id} 
                            comment={reply} 
                            onReply={onReply}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}