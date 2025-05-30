import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/Leaderboard.css'
import ChatWindow from '../components/ChatWindow'
import { useChat } from '../components/ChatContext'
import KudosButton from '../components/KudosButton'

function Leaderboard() {
    const [users, setUsers] = useState([])
    const [usernameToAdd, setUsernameToAdd] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [notifications, setNotifications] = useState([])

    const { selectedUserId, setSelectedUserId } = useChat()
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchLeaderboard()
        fetchNotifications()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/leaderboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUsers(res.data)
        } catch (err) {
            console.error('Eroare la obținerea leaderboard-ului', err)
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/leaderboard/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(res.data)

            // Șterge notificările după 4 secunde
            setTimeout(() => {
                axios.post(
                    'http://localhost:8081/api/leaderboard/notifications/clear',

                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                setNotifications([])
            }, 4000)
        } catch (err) {
            console.error('Eroare la notificări', err)
        }
    }

    const handleSearchUser = async (query) => {
        setUsernameToAdd(query)

        if (!query.trim()) {
            setSuggestions([])
            return
        }

        try {
            const res = await axios.get(`http://localhost:8081/api/auth/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSuggestions(res.data)
        } catch (err) {
            console.error('Eroare la căutarea utilizatorilor', err)
        }
    }

    const handleSelectSuggestion = (username) => {
        setUsernameToAdd(username)
        setSuggestions([])
    }

    const handleAddFriend = async () => {
        try {
            await axios.post(
                'http://localhost:8081/api/leaderboard/add-friend',
                { username: usernameToAdd },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setUsernameToAdd('')
            setSuggestions([])
            fetchLeaderboard()
        } catch (err) {
            alert(err.response?.data || 'Eroare la adăugare prieten')
        }
    }

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm('Ești sigur că vrei să ștergi acest prieten?')) return

        try {
            await axios.delete(`http://localhost:8081/api/leaderboard/remove-friend/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchLeaderboard()
        } catch (err) {
            alert(err.response?.data || 'Eroare la ștergerea prietenului')
        }
    }

    return (
        <div className="leaderboard-container">
            <h2>🏆 Leaderboard – Zile consecutive complete</h2>

            {/* 🔔 Notificări */}
            {notifications.length > 0 && (
                <div className="notification-popup">
                    {notifications.map((msg, index) => (
                        <div key={index} className="notification">
                            {msg}
                        </div>
                    ))}
                </div>
            )}

            <ul className="leaderboard-list">
                {users.map((user) => (
                    <li key={user.id} className="leaderboard-card">
                        <strong>{user.username}</strong> – {user.streak} zile
                        <br />
                        {user.kudosMessages && user.kudosMessages.length > 0 && (
                            <ul style={{ marginTop: '0.5rem' }}>
                                {user.kudosMessages.map((msg, i) => (
                                    <li key={i}>💌 {msg}</li>
                                ))}
                            </ul>
                        )}

                        <KudosButton friendId={user.id} />

                        <button onClick={() => setSelectedUserId(user.id)} className="small-btn">
                            Deschide Chat
                        </button>

                        <button
                            onClick={() => handleRemoveFriend(user.id)}
                            className="small-btn danger"
                        >
                            Șterge Prieten
                        </button>
                    </li>
                ))}
            </ul>

            <hr />

            <div>
                <h3>➕ Adaugă prieten</h3>
                <input
                    type="text"
                    placeholder="Nume prieten"
                    value={usernameToAdd}
                    onChange={(e) => handleSearchUser(e.target.value)}
                    className="leaderboard-input"
                />
                <button onClick={handleAddFriend} className="leaderboard-button">
                    Adaugă
                </button>

                {suggestions.length > 0 && (
                    <ul className="suggestion-list">
                        {suggestions.map((user) => (
                            <li key={user.id} onClick={() => handleSelectSuggestion(user.username)}>
                                {user.username}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedUserId && (
                <ChatWindow selectedFriend={users.find((u) => u.id === selectedUserId)} />
            )}
        </div>
    )
}

export default Leaderboard
