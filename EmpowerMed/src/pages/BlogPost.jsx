import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ReactMarkdown from "react-markdown";
import { authedJson } from "../lib/api";
import "../styles/Blog.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");
const MAX_WORDS = 75;

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, commentContent, commentAuthor }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div 
        className="blog-modal-content delete-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            marginBottom: '1.5rem',
            color: '#e74c3c',
            fontSize: '3rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3 style={{
            fontFamily: "'Aboreto', cursive",
            color: '#e74c3c',
            marginBottom: '1rem',
            fontSize: '1.8rem',
            fontWeight: '700'
          }}>
            Delete Comment?
          </h3>
          <p style={{
            fontFamily: "'Lexend', sans-serif",
            color: '#2C3E50',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            Are you sure you want to delete this comment?
          </p>
          
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e5e9f7',
            borderRadius: '8px',
            padding: '1rem',
            margin: '1rem 0 1.5rem',
            textAlign: 'left'
          }}>
            <strong style={{
              fontFamily: "'Lexend', sans-serif",
              color: '#3D52A0',
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              {commentAuthor}
            </strong>
            <p style={{
              fontFamily: "'Lexend', sans-serif",
              color: '#34495e',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              margin: '0'
            }}>
              {commentContent}
            </p>
          </div>
          
          <p style={{
            fontFamily: "'Lexend', sans-serif",
            color: '#e74c3c',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '2rem',
            fontStyle: 'italic'
          }}>
            This action cannot be undone. The comment will be permanently removed.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <button 
              onClick={onClose}
              style={{
                background: '#f8f9fa',
                color: '#6C757D',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontFamily: "'Lexend', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e9ecef';
                e.target.style.color = '#495057';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.color = '#6C757D';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              style={{
                background: '#e74c3c',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontFamily: "'Lexend', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 15px rgba(231, 76, 60, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPost() {
    const { slug } = useParams();
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [deleteCommentInfo, setDeleteCommentInfo] = useState({ content: "", author: "", isReply: false, parentId: null });
    const textareaRef = useRef(null);

    useEffect(() => {
        loadPost();
    }, [slug]);

    useEffect(() => {
        calculateWordCount(newComment);
        adjustTextareaHeight();
    }, [newComment]);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!isAuthenticated) {
                setIsAdmin(false);
                return;
            }

            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts?limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    setIsAdmin(true);
                } else if (response.status === 403) {
                    setIsAdmin(false);
                }
            } catch (err) {
                setIsAdmin(false);
            }
        };

        if (isAuthenticated) {
            checkAdminStatus();
        } else {
            setIsAdmin(false);
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    const calculateWordCount = (text) => {
        const words = text.trim().split(/\s+/);
        const count = text.trim() === '' ? 0 : words.length;
        setWordCount(count);
        return count;
    };

    const loadPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
            
            if (!response.ok) throw new Error("Failed to load post");
            
            const data = await response.json();
            setPost(data.post);
            setComments(data.comments || []);
            setLiked(data.post.user_liked);
            setLikeCount(data.post.like_count);
        } catch (err) {
            setError("Failed to load blog post");
        } finally {
            setLoading(false);
        }
    };

    const loadComments = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch (err) {
            // Comments load silently
        }
    }, [slug, isAuthenticated, getAccessTokenSilently]);

    useEffect(() => {
        if (isAuthenticated) {
            loadComments();
        } else {
            setComments([]);
        }
    }, [isAuthenticated, loadComments]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert("Please login to like posts");
            return;
        }

        try {
            const data = await authedJson(
                `/api/blog/${slug}/like`,
                { method: "POST" },
                getAccessTokenSilently
            );
            
            setLiked(data.liked);
            setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            // Silent fail for likes
        }
    };

    const handleDeleteClick = (commentId, commentContent, commentAuthor, isReply = false, parentId = null) => {
        setCommentToDelete(commentId);
        setDeleteCommentInfo({
            content: commentContent,
            author: commentAuthor,
            isReply,
            parentId
        });
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!isAdmin || !commentToDelete) return;
        
        try {
            const data = await authedJson(
                `/api/blog/admin/comments/${commentToDelete}`,
                { method: "DELETE" },
                getAccessTokenSilently
            );

            if (data.success) {
                setComments(prev => {
                    if (deleteCommentInfo.isReply && deleteCommentInfo.parentId) {
                        return removeReplyFromComments(prev, deleteCommentInfo.parentId, commentToDelete);
                    }
                    return prev.filter(comment => comment.id !== commentToDelete);
                });
            }
        } catch (error) {
            alert("Failed to delete comment");
        } finally {
            setShowDeleteModal(false);
            setCommentToDelete(null);
            setDeleteCommentInfo({ content: "", author: "", isReply: false, parentId: null });
        }
    };

    const removeReplyFromComments = (comments, parentId, replyId) => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: comment.replies?.filter(reply => reply.id !== replyId) || []
                };
            }
            if (comment.replies) {
                return {
                    ...comment,
                    replies: removeReplyFromComments(comment.replies, parentId, replyId)
                };
            }
            return comment;
        });
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

        if (wordCount > MAX_WORDS) {
            alert(`Comment must be ${MAX_WORDS} words or less`);
            return;
        }

        setSubmitting(true);

        try {
            const data = await authedJson(
                `/api/blog/${slug}/comments`,
                {
                    method: "POST",
                    body: {
                        content: newComment.trim(),
                        parent_id: replyTo
                    }
                },
                getAccessTokenSilently
            );
            
            setComments(prev => {
                if (replyTo) {
                    return addReplyToComments(prev, replyTo, data.comment);
                }
                return [...prev, data.comment];
            });
            setNewComment("");
            setReplyTo(null);
            setWordCount(0);
        } catch (error) {
            alert(error.message || "Failed to post comment. Please try again.");
        } finally {
            setSubmitting(false);
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
                            disabled={submitting}
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
                            {isAuthenticated ? `Comments (${comments.length})` : 'Comments'}
                        </h2>

                        <div className="blog-comments-list">
                            {isAuthenticated ? (
                                comments.map(comment => (
                                    <Comment 
                                        key={comment.id} 
                                        comment={comment} 
                                        onReply={setReplyTo}
                                        onDelete={handleDeleteClick}
                                        isAuthenticated={isAuthenticated}
                                        isAdmin={isAdmin}
                                    />
                                ))
                            ) : (
                                <div className="blog-comments-login">
                                    <p>Please <button 
                                        onClick={() => loginWithRedirect({
                                            authorizationParams: {
                                                redirect_uri: window.location.origin,
                                                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                                                scope: 'openid profile email'
                                            }
                                        })}
                                        className="blog-login-button"
                                    >
                                        login
                                    </button> to view and post comments</p>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && (
                            <form onSubmit={handleSubmitComment} className="blog-comment-form">
                                <div className="blog-comment-input-wrapper">
                                    <textarea
                                        ref={textareaRef}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                                        rows="1"
                                        disabled={submitting}
                                        maxLength={525}
                                        className="blog-comment-textarea"
                                    />
                                    <div className={`blog-comment-word-count ${wordCount > MAX_WORDS ? 'warning' : ''}`}>
                                        {wordCount}/{MAX_WORDS} words
                                    </div>
                                </div>
                                <div className="blog-comment-form-actions">
                                    {replyTo && (
                                        <button 
                                            type="button"
                                            onClick={() => setReplyTo(null)}
                                            className="blog-comment-cancel-reply"
                                            disabled={submitting}
                                        >
                                            Cancel Reply
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        className="blog-comment-submit"
                                        disabled={submitting || !newComment.trim() || wordCount > MAX_WORDS}
                                    >
                                        {submitting ? "Posting..." : replyTo ? "Post Reply" : "Post Comment"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </article>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setCommentToDelete(null);
                    setDeleteCommentInfo({ content: "", author: "", isReply: false, parentId: null });
                }}
                onConfirm={handleDeleteConfirm}
                commentContent={deleteCommentInfo.content}
                commentAuthor={deleteCommentInfo.author}
            />
        </div>
    );
}

function Comment({ comment, onReply, onDelete, isAuthenticated, isAdmin }) {
    return (
        <div className="blog-comment">
            <div className="blog-comment-header">
                <div className="blog-comment-avatar">
                    {comment.user_name?.charAt(0) || 'U'}
                </div>
                <div className="blog-comment-user-info">
                    <span className="blog-comment-author">{comment.user_name}</span>
                    <span className="blog-comment-date">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
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
                {isAdmin && (
                    <button 
                        onClick={() => onDelete(comment.id, comment.content, comment.user_name, false, null)}
                        className="blog-comment-delete"
                        title="Delete comment"
                    >
                        Delete
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
                            onDelete={(id, content, author) => onDelete(id, content, author, true, comment.id)}
                            isAuthenticated={isAuthenticated}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}