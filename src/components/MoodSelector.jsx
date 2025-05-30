import React from 'react'
import '../styles/MoodSelector.css'

const moods = [
    { value: 'happy', label: '😊 Fericit' },
    { value: 'ok', label: '😐 OK' },
    { value: 'stressed', label: '😰 Stresat' },
    { value: 'sad', label: '😢 Trist' },
]

function MoodSelector({ selectedMood, setSelectedMood }) {
    return (
        <div className="mood-selector">
            <label className="mood-label">Starea ta de azi:</label>
            <div className="mood-options">
                {moods.map((m) => (
                    <button
                        key={m.value}
                        className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`}
                        onClick={() => setSelectedMood(m.value)}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default MoodSelector
