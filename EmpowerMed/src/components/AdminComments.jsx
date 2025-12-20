import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { Link } from "react-router-dom";
import "../styles/AdminBlog.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

export default function AdminComments() {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        pages: 1
    });

    useEffect(() => {
        loadComments();
    }, [filter, pagination.page]);

    const loadComments = async () => {
        try {
            const token = await user.getToken();
            const response = await fetch(
                `${API_BASE_URL}/api/blog/admin/comments?status=${filter}&page=${pagination.page}&limit=20`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setComments(data.comments);
                setPagination(data.pagination);
            }
        } catch (error) {
            // Error handling would go here in production
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (commentId, action) => {
        try {
            const token = await user.getToken();
            const response = await fetch(
                `${API_BASE_URL}/api/blog/admin/comments/${commentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ action })
                }
            );

            if (response.ok) {
                loadComments();
            }
        } catch (error) {
            // Error handling would go here in production
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const token = await user.getToken();
            const response = await fetch(
                `${API_BASE_URL}/api/blog/admin/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                loadComments();
            }
        } catch (error) {
            // Error handling would go here in production
        }
    };

    if (loading) {
        return (
            <div className="admin-comments">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-comments">
            <div className="admin-comments-header">
                <h1>Comment Moderation</h1>
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending Review
                    </button>
                    <button 
                        className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                </div>
            </div>

            <div className="admin-comments-list">
                {comments.length === 0 ? (
                    <div className="empty-state">
                        <p>No comments to display</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-card">
                            <div className="comment-header">
                                <div className="comment-user">
                                    <img 
                                        src={comment.user_avatar || "/default-avatar.png"} 
                                        alt={comment.user_name}
                                        className="comment-avatar"
                                    />
                                    <div>
                                        <span className="comment-user-name">{comment.user_name}</span>
                                        <span className="comment-user-email">{comment.user_email}</span>
                                    </div>
                                </div>
                                <div className="comment-meta">
                                    <Link 
                                        to={`/blog/${comment.post_slug}`}
                                        target="_blank"
                                        className="comment-post"
                                    >
                                        {comment.post_title}
                                    </Link>
                                    <span className="comment-date">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="comment-content">
                                <p>{comment.content}</p>
                            </div>

                            <div className="comment-actions">
                                {filter === 'pending' ? (
                                    <>
                                        <button 
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAction(comment.id, 'approve')}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleAction(comment.id, 'reject')}
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleAction(comment.id, 'reject')}
                                    >
                                        Unapprove
                                    </button>
                                )}
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(comment.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pagination.pages > 1 && (
                <div className="pagination">
                    <button 
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button 
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}