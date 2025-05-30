import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/Dashboard.css'
import ProgressBar from '../components/ProgressBar'
import MoodSelector from '../components/MoodSelector'

// ✅ Definim `today` sus ca să poată fi folosit în `useState`
const today = new Date().toLocaleDateString('sv-SE')  // format YYYY-MM-DD

function Dashboard() {
    const [habits, setHabits] = useState([])
    const [journal, setJournal] = useState([])
    const [newHabit, setNewHabit] = useState('')
    const [frequency, setFrequency] = useState('daily')
    const [selectedDate, setSelectedDate] = useState(today)
    const [editingHabitId, setEditingHabitId] = useState(null)
    const [editedHabitName, setEditedHabitName] = useState('')
    const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '' })
    const [imageFile, setImageFile] = useState(null)
    const [editingJournalId, setEditingJournalId] = useState(null)
    const [editedEntry, setEditedEntry] = useState({ title: '', content: '', mood: '' })

    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchHabits()
        fetchJournal()
    }, [])

    const fetchHabits = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/habits', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHabits(res.data)
        } catch (err) {
            console.error('Eroare la obținerea obiceiurilor', err)
        }
    }

    const fetchJournal = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/journal', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setJournal(res.data)
        } catch (err) {
            console.error('Eroare la obținerea jurnalului', err)
        }
    }

    const handleAddHabit = async () => {
        if (!newHabit.trim()) return
        try {
            await axios.post('http://localhost:8081/api/habits', {
                name: newHabit,
                frequency,
                completedDates: [],
                date: frequency === 'onetime' ? selectedDate : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNewHabit('')
            setFrequency('daily')
            fetchHabits()
        } catch (err) {
            console.error('Eroare la adăugarea obiceiului', err)
        }
    }

    const handleMarkAsDone = async (habit) => {
        if (habit.completedDates.includes(today)) return

        const updatedHabit = {
            ...habit,
            completedDates: [...habit.completedDates, today]
        }

        try {
            if (habit.frequency === 'onetime') {
                await axios.delete(`http://localhost:8081/api/habits/${habit.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                await axios.put('http://localhost:8081/api/habits', updatedHabit, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            fetchHabits()
        } catch (err) {
            console.error('Eroare la actualizarea obiceiului', err)
        }
    }

    const handleDeleteHabit = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/habits/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchHabits()
        } catch (err) {
            console.error('Eroare la ștergerea obiceiului', err)
        }
    }

    const handleEditHabit = (habit) => {
        setEditingHabitId(habit.id)
        setEditedHabitName(habit.name)
    }

    const handleUpdateHabit = async () => {
        try {
            const habitToUpdate = habits.find(h => h.id === editingHabitId)
            await axios.put('http://localhost:8081/api/habits', {
                ...habitToUpdate,
                name: editedHabitName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setEditingHabitId(null)
            setEditedHabitName('')
            fetchHabits()
        } catch (err) {
            console.error('Eroare la editarea obiceiului', err)
        }
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    const handleAddJournal = async () => {
        if (!newEntry.title || !newEntry.content) return
        try {
            let base64Image = ''
            if (imageFile) {
                base64Image = await convertToBase64(imageFile)
            }

            await axios.post('http://localhost:8081/api/journal', {
                ...newEntry,
                entryDate: today,
                imageUrl: base64Image
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setNewEntry({ title: '', content: '', mood: '' })
            setImageFile(null)
            fetchJournal()
        } catch (err) {
            console.error('Eroare la adăugarea jurnalului', err)
        }
    }


    const handleDeleteJournal = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/journal/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchJournal()
        } catch (err) {
            console.error('Eroare la ștergerea jurnalului', err)
        }
    }

    const handleSaveEditedJournal = async () => {
        try {
            await axios.put(`http://localhost:8081/api/journal/${editingJournalId}`, editedEntry, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setEditingJournalId(null)
            setEditedEntry({ title: '', content: '', mood: '' })
            fetchJournal()
        } catch (err) {
            console.error('Eroare la actualizarea jurnalului', err)
        }
    }

    const visibleHabits = habits.filter(h => {
        if (h.frequency === 'onetime') {
            const habitDate = new Date(h.date).toLocaleDateString('sv-SE')
            return habitDate >= today && !h.completedDates.includes(today)
        }
        return true
    })

    const completedToday = visibleHabits.filter(h => h.completedDates.includes(today)).length
    const totalHabits = visibleHabits.length

    return (
        <div className="dashboard-container">
            <section className="dashboard-section" data-aos="fade-up">
                <h2>📅 Habit Tracker</h2>

                <ProgressBar completed={completedToday} total={totalHabits} />

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Nume obicei"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                    />
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                        <option value="daily">Zilnic</option>
                        <option value="onetime">Pentru o zi</option>
                    </select>
                    {frequency === 'onetime' && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    )}
                    <button onClick={handleAddHabit}>Adaugă</button>
                </div>

                <ul>
                    {visibleHabits.map(h => (
                        <li key={h.id} className="dashboard-card" data-aos="fade-up">
                            {editingHabitId === h.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedHabitName}
                                        onChange={(e) => setEditedHabitName(e.target.value)}
                                    />
                                    <div className="habit-actions">
                                        <button onClick={handleUpdateHabit}>Salvează</button>
                                        <button onClick={() => setEditingHabitId(null)}>Anulează</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="habit-header">
                                        <span className="habit-title">{h.name}</span>
                                        {h.frequency === 'onetime' ? (
                                            <span className="habit-one-time">[Pentru {h.date}]</span>
                                        ) : (
                                            <span className="habit-daily">[Zilnic]</span>
                                        )}
                                    </div>
                                    <div className="mark-done-container">
                                        <input
                                            type="checkbox"
                                            id={`done-${h.id}`}
                                            checked={h.completedDates.includes(today)}
                                            onChange={() => handleMarkAsDone(h)}
                                        />
                                        <label htmlFor={`done-${h.id}`}>Marchează ca făcut azi</label>
                                    </div>
                                    <div className="habit-actions">
                                        <button onClick={() => handleEditHabit(h)}>✏️ Edit</button>
                                        <button onClick={() => handleDeleteHabit(h.id)}>🗑️ Șterge</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <hr style={{ margin: '2rem 0' }} />

            <section className="dashboard-section" data-aos="fade-left">
                <h2>📓 Jurnal Motivațional</h2>
                <input
                    type="text"
                    placeholder="Titlu"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                />
                <textarea
                    placeholder="Ce ai în minte azi?"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    style={{ height: '80px' }}
                />
                <MoodSelector
                    selectedMood={newEntry.mood}
                    setSelectedMood={(mood) => setNewEntry({ ...newEntry, mood })}
                    moods={['happy', 'ok', 'stressed', 'sad']}
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                />

                <div className="mood-actions">
                    <button onClick={handleAddJournal}>Adaugă</button>
                </div>

                <ul>
                    {journal.map(j => (
                        <li key={j.id} className="dashboard-card" data-aos="zoom-in">
                            {editingJournalId === j.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedEntry.title}
                                        onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                                    />
                                    <textarea
                                        value={editedEntry.content}
                                        onChange={(e) => setEditedEntry({ ...editedEntry, content: e.target.value })}
                                        style={{ height: '80px' }}
                                    />
                                    <MoodSelector
                                        selectedMood={newEntry.mood}
                                        setSelectedMood={(mood) => setNewEntry({ ...newEntry, mood })}
                                        moods={['happy', 'ok', 'stressed', 'sad']}
                                    />

                                    <div className="habit-actions">
                                        <button onClick={handleSaveEditedJournal}>💾 Salvează</button>
                                        <button onClick={() => setEditingJournalId(null)}>❌ Anulează</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="journal-entry-title">{j.title}</h3>
                                    <small>{new Date(j.createdAt).toLocaleString()}</small><br />
                                    {j.imageUrl && (
                                        <img
                                            src={j.imageUrl}
                                            alt="entry"
                                            style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '1rem' }}
                                        />
                                    )}

                                    {j.mood && (
                                        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                            Stare: {{
                                            happy: '😊',
                                            ok: '😐',
                                            stressed: '😰',
                                            sad: '😢',
                                            angry: '😠',
                                            excited: '🤩'
                                        }[j.mood]}
                                        </div>
                                    )}
                                    {j.content}
                                    <div className="habit-actions">
                                        <button onClick={() => {
                                            setEditingJournalId(j.id)
                                            setEditedEntry({ title: j.title, content: j.content, mood: j.mood })
                                        }}>✏️ Edit</button>
                                        <button onClick={() => handleDeleteJournal(j.id)}>🗑️ Șterge</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}

export default Dashboard
