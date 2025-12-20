import React from "react";
import "../styles/AdminInboxList.css";

export default function AdminInboxList({
  conversations = [],
  activeUserId,
  onSelectUser,
  onStartNew,
}) {
  return (
    <div className="admin-inbox-list">
      <div className="inbox-header">
        <h5>Inbox</h5>
        <button className="new-message-btn" onClick={onStartNew}>
          + New Message
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-muted inbox-empty">No conversations yet</p>
      ) : (
        conversations.map((conv) => (
          <div
            key={`conv-${conv.userId}`}
            className={`inbox-item ${
              conv.userId === activeUserId ? "active" : ""
            }`}
            onClick={() => onSelectUser(conv.userId)}
          >
            <div className="inbox-email">
              {conv.userEmail || "Unknown user"}
            </div>

            <div className="inbox-preview">
              {conv.lastMessage?.text?.slice(0, 50) || "No messages yet"}
            </div>

            {conv.unreadCount > 0 && (
              <span className="inbox-badge">{conv.unreadCount}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}