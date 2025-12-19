import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "../styles/ConversationPanel.css";

/**
 * mode:
 *  - "admin" → admin messages go right
 *  - "user"  → user messages go right
 */
export default function ConversationPanel({
  title = "Conversation",
  messages = [],
  mode = "user",             
  onSend,
  disabled = false,
}) {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim() || disabled) return;
    onSend({ message: draft.trim() });
    setDraft("");
  };

  return (
    <div className="conversation-panel">

      {/* HEADER */}
      <div className="conversation-header">
        <h5 className="conversation-title">{title}</h5>
      </div>

      {/* SCROLLING MESSAGE AREA */}
      <div className="conversation-history">
        {messages.length === 0 ? (
          <p className="text-muted text-center mt-3">
            {disabled
              ? "Select a user to start messaging."
              : "No messages yet. Start the conversation below."}
          </p>
        ) : (
          messages.map((msg) => {
            const isOutgoing =
              mode === "admin"
                ? msg.sender_role === "admin"
                : msg.sender_role === "user";

            return (
              <div
                key={`msg-${msg.id}`}
                className={`bubble ${isOutgoing ? "outgoing" : "incoming"}`}
              >
                <div className="bubble-text">{msg.text}</div>
                <div className="bubble-time">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COMPOSER */}
      <div className="conversation-reply">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder={
            disabled
              ? "Select a user to start messaging"
              : "Type your message…"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={disabled}
        />

        <Button
          type="button"
          className="mt-2 send-button"
          onClick={handleSend}
          disabled={!draft.trim() || disabled}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
