import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaComment } from 'react-icons/fa';
import axios from 'axios';
import { UserData } from '../context/UserContext';
import { server } from '../config';
import './ChatBox.css';

const ChatBox = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageSenders, setMessageSenders] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = UserData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${server}/api/chat/messages`, {
          headers: {
            token: token
          }
        });
        setMessages(data);

        // Extract unique message senders who have sent messages to admin
        if (isAdmin) {
          const senders = data
            .filter(msg => 
              msg.sender._id !== user._id && // Message is not from admin
              (!msg.recipient || msg.recipient._id === user._id) // Message is to admin
            )
            .reduce((acc, msg) => {
              if (!acc.find(s => s._id === msg.sender._id)) {
                acc.push(msg.sender);
              }
              return acc;
            }, []);
          setMessageSenders(senders);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAdmin, user._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        const token = localStorage.getItem('token');
        const messageData = {
          message: newMessage,
          recipientId: isAdmin ? selectedUser : null
        };

        const { data } = await axios.post(`${server}/api/chat/send`, 
          messageData,
          {
            headers: {
              token: token
            }
          }
        );

        setMessages([...messages, data]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const filteredMessages = selectedUser
    ? messages.filter(msg => 
        // Messages from the selected user to admin
        (msg.sender._id === selectedUser && (!msg.recipient || msg.recipient._id === user._id)) ||
        // Messages from admin to the selected user
        (msg.sender._id === user._id && msg.recipient && msg.recipient._id === selectedUser) ||
        // Admin's own messages in the conversation
        (msg.sender._id === user._id && !msg.recipient && msg.isAdmin)
      )
    : messages;

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setShowMessages(true);
  };

  const handleBackToUsers = () => {
    setShowMessages(false);
    setSelectedUser(null);
  };

  const handleClearMessages = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${server}/api/chat/clear/${selectedUser}`, {
        headers: { token }
      });
      
      if (response.data.message === 'Messages cleared successfully') {
        // Update messages state by removing messages for the selected user
        setMessages(messages.filter(msg => 
          // Keep messages that are not part of this conversation
          !(
            // Messages from user to admin
            (msg.sender._id === selectedUser && (!msg.recipient || msg.recipient._id === user._id)) ||
            // Messages from admin to user
            (msg.sender._id === user._id && msg.recipient && msg.recipient._id === selectedUser) ||
            // Admin's own messages in the conversation
            (msg.sender._id === user._id && !msg.recipient && msg.isAdmin)
          )
        ));
        
        // Show success message
        alert('Messages cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert(error.response?.data?.message || 'Failed to clear messages');
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          className="chat-icon-button"
          onClick={() => setIsOpen(true)}
        >
          <FaComment size={24} />
        </button>
      )}
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>{isAdmin ? 'Admin Chat' : 'Chat with Admin'}</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          {isAdmin && !showMessages && messageSenders.length > 0 && (
            <div className="senders-list">
              <h4>Users who sent messages</h4>
              <div className="senders-container">
                {messageSenders.map((sender) => (
                  <button
                    key={sender._id}
                    className="sender-button"
                    onClick={() => handleUserSelect(sender._id)}
                  >
                    <div className="sender-info">
                      <span className="sender-name">{sender.name}</span>
                      <span className="sender-email">{sender.email}</span>
                    </div>
                    <span className="unread-count">
                      {messages.filter(msg => 
                        msg.sender._id === sender._id && 
                        !msg.read && 
                        (!msg.recipient || msg.recipient._id === user._id)
                      ).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && showMessages && (
            <div className="messages-view">
              <div className="messages-header">
                <button className="back-button" onClick={handleBackToUsers}>
                  ← Back to Users
                </button>
                <button className="clear-button" onClick={handleClearMessages}>
                  Clear Messages
                </button>
              </div>
              <div className="messages-container">
                {filteredMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.message}</p>
                      <div className="message-info">
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="message-sender">
                          - {message.sender.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          )}
          
          {!isAdmin && (
            <>
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.message}</p>
                      <div className="message-info">
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">
                  <FaPaperPlane />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox; 