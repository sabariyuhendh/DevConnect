import React from 'react';

export default function ChatMessage({ message }: { message: any }) {
  const author = message.authorUsername || message.author?.username || 'unknown';
  return (
    <div style={{ padding: 6 }}>
      <div style={{ fontSize: 12, color: '#555' }}>{author}</div>
      <div>{message.text}</div>
    </div>
  );
}
