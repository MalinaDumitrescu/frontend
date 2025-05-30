// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../components/ChatContext';

const ChatWindow = ({ selectedFriend }) => {
    const { messages, sendMessage } = useChat();
    const [input, setInput] = useState('');
    const messageEndRef = useRef(null);

    if (!selectedFriend) {
        return <div className="chat-window">Selectează un prieten pentru a începe conversația.</div>;
    }

    const chatHistory = messages[selectedFriend.id] || [];

    const handleSend = () => {
        const trimmed = input.trim();
        if (trimmed) {
            sendMessage(selectedFriend.id, trimmed);
            setInput('');
        }
    };

    // Scroll automat la ultimul mesaj
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);

    return (
        <div className="chat-window">
            <h4>💬 Chat cu {selectedFriend.username}</h4>
            <div className="chat-messages">
                {chatHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`msg ${msg.fromUserId === selectedFriend.id ? 'from' : 'to'}`}
                    >
                        {msg.message}
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrie un mesaj..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend}>Trimite</button>
            </div>
        </div>
    );
};

export default ChatWindow;
