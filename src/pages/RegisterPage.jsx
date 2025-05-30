import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',   // folosește 'password'
        avatarUrl: ''
    })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')

        try {
            // Trimite câmpul 'password' (parola clară)
            const registerRes = await axios.post('http://localhost:8081/api/auth/register', {
                username: form.username,
                email: form.email,
                password: form.password,  // corect
                avatarUrl: form.avatarUrl
            })

            // Login automat după înregistrare
            const loginRes = await axios.post('http://localhost:8081/api/auth/login', {
                email: form.email,
                password: form.password
            })

            localStorage.setItem('token', loginRes.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data || 'Eroare la înregistrare')
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Înregistrare</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                /><br /><br />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                /><br /><br />
                <input
                    type="password"
                    name="password"
                    placeholder="Parolă"
                    value={form.password}
                    onChange={handleChange}
                    required
                /><br /><br />
                <input
                    type="text"
                    name="avatarUrl"
                    placeholder="Avatar URL (opțional)"
                    value={form.avatarUrl}
                    onChange={handleChange}
                /><br /><br />
                <button type="submit">Înregistrează-te</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}

export default RegisterPage
