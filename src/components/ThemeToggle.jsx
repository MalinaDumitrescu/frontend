import React from 'react'

const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Dark/Light Theme">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
    )
}

export default ThemeToggle
