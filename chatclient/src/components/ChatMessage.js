import React from 'react';

function ChatMessage({ message }) {
  return (
    <div className={`message ${message.isBot ? 'bot' : 'user'}`}>
      <p>{message.text}</p>
    </div>
  );
}

export default ChatMessage;