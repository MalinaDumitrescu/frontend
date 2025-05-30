import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './styles/global.css'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Navbar from './components/Navbar.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

    useEffect(() => {
        AOS.init({ duration: 800 })
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        document.body.setAttribute('data-theme', theme) // 🔧 Fix pentru calendar!
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/leaderboard" element={
                    <PrivateRoute>
                        <Leaderboard />
                    </PrivateRoute>
                } />
                <Route path="/progress" element={
                    <PrivateRoute>
                        <ProgressPage />
                    </PrivateRoute>
                } />
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </>
    )
}

export default App
