import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import axios from 'axios'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts'
import '../styles/ProgressPage.css'

function generateMonthOptions() {
    const now = new Date()
    const months = []
    for (let i = 0; i < 24; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = date.toLocaleString('default', { month: 'long', year: 'numeric' })
        const value = date.toISOString().slice(0, 7)
        months.push({ label, value })
    }
    return months
}

function ProgressPage() {
    const [habits, setHabits] = useState([])
    const [journal, setJournal] = useState([])
    const [summary, setSummary] = useState([])
    const [selectedMonth, setSelectedMonth] = useState('')
    const token = localStorage.getItem('token')

    const monthOptions = generateMonthOptions()

    useEffect(() => {
        fetchHabits()
        fetchJournal()
    }, [selectedMonth])

    const fetchHabits = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/habits', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHabits(res.data)

            const all = res.data.flatMap(h =>
                h.completedDates.map(date => ({
                    date,
                    frequency: h.frequency
                }))
            )

            const counts = {}
            all.forEach(({ date }) => {
                if (selectedMonth && !date.startsWith(selectedMonth)) return
                counts[date] = (counts[date] || 0) + 1
            })

            const summaryData = Object.entries(counts)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date))

            setSummary(summaryData)
        } catch (err) {
            console.error('Eroare la încărcarea obiceiurilor', err)
        }
    }

    const fetchJournal = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/journal', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setJournal(res.data)
        } catch (err) {
            console.error('Eroare la încărcarea jurnalului', err)
        }
    }

    const getMoodColor = (mood) => {
        switch (mood) {
            case 'happy': return 'mood-happy'
            case 'ok': return 'mood-ok'
            case 'stressed': return 'mood-stressed'
            case 'sad': return 'mood-sad'
            default: return ''
        }
    }

    return (
        <div className="progress-container">
            <h2>📅 Calendar completări & stări</h2>

            <select
                className="month-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
            >
                <option value="">Toate lunile</option>
                {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <div className="calendar-wrapper">
                <Calendar
                    tileClassName={({ date }) => {
                        const formatted = date.toLocaleDateString('sv-SE')
                        const journalEntry = journal.find(j => j.entryDate && j.entryDate.startsWith(formatted))
                        if (journalEntry && journalEntry.mood) {
                            return getMoodColor(journalEntry.mood)
                        }
                        return ''
                    }}
                />
            </div>

            <div className="legend">
                <strong>Legendă:</strong>
                <span className="legend-item happy">😊 Fericit</span> |
                <span className="legend-item ok">😐 OK</span> |
                <span className="legend-item stressed">😰 Stresat</span> |
                <span className="legend-item sad">😢 Trist</span>
            </div>

            <hr className="chart-divider" />

            <h2>📊 Progres obiceiuri</h2>
            {summary.length === 0 ? (
                <p>Nu ai încă date înregistrate.</p>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3f51b5" />
                        </BarChart>
                    </ResponsiveContainer>

                    <hr className="chart-divider" />

                    <h2>📈 Trend general</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#e91e63" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    )
}

export default ProgressPage
