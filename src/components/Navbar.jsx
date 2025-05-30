import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'
import ThemeToggle from './ThemeToggle.jsx'

const Navbar = ({ theme, toggleTheme }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <h2 className="navbar-logo">Daily Boost</h2>
            <div className="navbar-links">
                {!token ? (
                    <>
                        <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
                        <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                        <Link to="/leaderboard" className={location.pathname === '/leaderboard' ? 'active' : ''}>Leaderboard</Link>
                        <Link to="/progress" className={location.pathname === '/progress' ? 'active' : ''}>Progres</Link>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                )}
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </nav>
    )
}

export default Navbar
