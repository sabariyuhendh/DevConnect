import React from 'react';

export default function FeedItem({ post }: { post: any }) {
  // post.authorUsername may come from backend or frontend augmentation
  const author = post.authorUsername || post.author?.username || post.author?.email?.split('@')[0];
  return (
    <div style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
      <div style={{ fontWeight: 'bold' }}>{author}</div>
      <div>{post.content}</div>
    </div>
  );
}
