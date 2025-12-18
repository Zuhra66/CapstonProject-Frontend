import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import "../styles/ConversationPanel.css";

export default function ConversationPanel({
  title = "Conversation",
  messages = [],
  currentUserId,
  onSend,
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const handleSend = () => {
  console.log("SENDING MESSAGE:", draft);

  if (!draft.trim()) return;

  onSend({ message: draft.trim() });
  setDraft("");
};


  return (
    <div className="conversation-panel single-thread">
      <div className="conversation-header">
        <h5 className="conversation-title">{title}</h5>
      </div>

      <div className="conversation-history">
        {messages.length === 0 ? (
          <p className="text-muted text-center mt-3">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          messages.map((msg) => {
            const isOutgoing = msg.sender_id === currentUserId;

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
        <div ref={bottomRef} />
      </div>

      <div className="conversation-reply">
        <Form.Control
            as="textarea"
            rows={3}
            placeholder="Type your message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
        />

        <Button
            type="button"       
            className="mt-2"
            onClick={handleSend}
            disabled={!draft.trim()}
        >
            Send
        </Button>
        </div>
    </div>
  );
}
