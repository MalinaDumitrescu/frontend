// src/context/ChatContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null); // ✅ ADĂUGAT pentru Leaderboard
    const [userId, setUserId] = useState(null); // user ID extras din JWT

    const stompClient = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return;

        const connect = async () => {
            const sock = new SockJS('http://localhost:8081/ws');
            stompClient.current = over(sock);

            stompClient.current.connect({}, () => {
                // ✅ Extrage ID-ul din JWT
                const payload = JSON.parse(atob(token.split('.')[1]));
                const myUserId = payload.sub;
                setUserId(myUserId);

                // ✅ Abonare la canalul userului
                stompClient.current.subscribe(`/topic/chat/${myUserId}`, (msg) => {
                    const chatMsg = JSON.parse(msg.body);
                    setMessages(prev => ({
                        ...prev,
                        [chatMsg.fromUserId]: [...(prev[chatMsg.fromUserId] || []), chatMsg]
                    }));
                });
            }, (error) => {
                console.error('WebSocket error:', error);
            });
        };

        connect();
    }, [token]);

    const sendMessage = (toUserId, message) => {
        if (stompClient.current && stompClient.current.connected && userId) {
            const chatMessage = {
                fromUserId: userId,
                toUserId,
                message
            };
            stompClient.current.send("/app/send", {}, JSON.stringify(chatMessage));
            setMessages(prev => ({
                ...prev,
                [toUserId]: [...(prev[toUserId] || []), chatMessage]
            }));
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            sendMessage,
            selectedUserId,
            setSelectedUserId // ✅ EXPUNE în context pentru Leaderboard
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
