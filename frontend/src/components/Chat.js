import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    if (user.role === 'admin') {
      fetchUsers();
    }
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/chat/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      const otherUsers = response.data.filter(u => u._id !== user._id);
      setUsers(otherUsers);
      if (otherUsers.length > 0) {
        setSelectedUser(otherUsers[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        message: newMessage.trim()
      };

      // If admin is sending message, include the selected user's ID
      if (user.role === 'admin' && selectedUser) {
        messageData.recipientId = selectedUser;
      }

      await axios.post('/api/chat/send', messageData);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      {user.role === 'admin' && (
        <div className="user-selector">
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="user-select"
          >
            <option value="">Select a user to chat with</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="messages">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
          >
            <div className="message-header">
              <span className="sender">{message.sender.name}</span>
            </div>
            <div className="message-content">{message.message}</div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 