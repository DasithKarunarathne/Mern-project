import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/chat',
});

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages', { cache: 'no-store' });
      console.log('FETCH - Messages from backend:', response.data);
      setMessages(response.data);
      // Scroll to bottom after state update
      scrollToBottom();
    } catch (error) {
      console.error('FETCH - Error fetching messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      console.log('SEND - Sending message:', input);
      await api.post('/message', { text: input });
      setInput('');
      await fetchMessages(); // Fetch updates messages and triggers scroll
    } catch (error) {
      console.error('SEND - Error sending message:', error);
    }
  };

  const clearMessages = async () => {
    try {
      console.log('CLEAR - Attempting to clear messages...');
      const response = await api.delete('/messages');
      console.log('CLEAR - Response:', response.data);
      setMessages([]);
      await fetchMessages(); // Sync with backend
    } catch (error) {
      console.error('CLEAR - Error clearing messages:', error);
      setMessages([]);
    }
  };

  // Ensure scroll happens after messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Runs whenever messages state changes

  return (
    <div className='fullchatbot'>
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input className='placholderStyle'
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our handicrafts..."
        />
        <button type="submit">Send</button>
      </form>
      <button onClick={clearMessages} className="clear-button">
        Clear Chat
      </button>
    </div>
    </div>
  );
}

export default Chatbot;