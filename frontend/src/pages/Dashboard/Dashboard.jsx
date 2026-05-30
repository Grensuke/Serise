import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { apiJson, authHeaders } from '../../utils/api'
import { conversationTitle, energyLevelLabel } from '../../utils/display'
import styles from './Dashboard.module.css'

const MOODS = [
  { id: 'happy', icon: '☀️', label: 'Happy', level: 80 },
  { id: 'moderate', icon: '⛅', label: 'Moderate', level: 55 },
  { id: 'sad', icon: '🌙', label: 'Low', level: 30 },
]

const TILES = [
  { label: 'Memory Vault', to: '/vault', icon: '💾', desc: 'Review past conversations' },
  { label: 'Energy Tracker', to: '/energy', icon: '⚡', desc: 'Log social battery' },
  { label: 'Anti-Overthinking', to: '/overthinking', icon: '🧠', desc: 'Reframe anxious thoughts' },
  { label: 'Simulator', to: '/simulate', icon: '🎭', desc: 'Practice scenarios safely' },
  { label: 'Scripts', to: '/scripts', icon: '✍️', desc: 'Build conversation scripts' },
  { label: 'Goals', to: '/goals', icon: '★', desc: 'Track social milestones' },
  { label: 'Profile', to: '/profile', icon: '👤', desc: 'Your account & stats' },
]

function parseMoodFromNote(note) {
  const match = note?.match(/Mood:\s*(\w+)/i)
  return match ? match[1].toLowerCase() : null
}

export default function Dashboard() {
  const [conversations, setConversations] = useState([])
  const [energyLevel, setEnergyLevel] = useState(null)
  const [lastCheckIn, setLastCheckIn] = useState(null)
  const [conversationCount, setConversationCount] = useState(0)
  const [goalCount, setGoalCount] = useState(0)
  const [profileName, setProfileName] = useState('')
  const [mood, setMood] = useState('moderate')
  const [moodLevel, setMoodLevel] = useState(55)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [convs, energy, profile] = await Promise.all([
        apiJson('/api/conversations', { headers: authHeaders() }),
        apiJson('/api/energy', { headers: authHeaders() }),
        apiJson('/api/profile', { headers: authHeaders() }),
      ])

      const convList = Array.isArray(convs) ? convs : []
      const logs = Array.isArray(energy) ? energy : []

      setConversations(convList)
      setConversationCount(profile?.conversationCount ?? convList.length)
      setGoalCount(profile?.goalCount ?? 0)
      setProfileName(profile?.name || '')

      if (logs.length > 0) {
        const latest = logs[0]
        setEnergyLevel(latest.level)
        setLastCheckIn(latest.createdAt)
        setMoodLevel(latest.level)
        const parsed = parseMoodFromNote(latest.note)
        if (parsed && MOODS.some((m) => m.id === parsed)) setMood(parsed)
      }
    } catch (err) {
      setLoadError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const selectMood = (m) => {
    setMood(m.id)
    setMoodLevel(m.level)
    setSaved(false)
    setSaveError('')
  }

  const saveMood = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const entry = await apiJson('/api/energy', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ level: moodLevel, note: `Mood: ${mood}` }),
      })
      setEnergyLevel(entry.level)
      setLastCheckIn(entry.createdAt || new Date().toISOString())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message || 'Failed to save check-in')
    } finally {
      setSaving(false)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formatLastCheckIn = () => {
    if (!lastCheckIn) return 'No check-in yet today'
    return `Last saved ${new Date(lastCheckIn).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })}`
  }

  return (
    <AppLayout footer>
      <div className={`page-shell ${styles.dashboard}`}>
        {loadError && (
          <div className={styles.bannerError} role="alert">
            {loadError}
            <button type="button" className="btn" onClick={loadDashboard}>Retry</button>
          </div>
        )}

        <header className={styles.hero}>
          <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <p className={styles.greeting}>
                {greeting()}{profileName ? `, ${profileName}` : ''}
              </p>
              <h1 className={styles.title}>
                How was your <span className={styles.accent}>day</span>?
              </h1>
              <p className={styles.subtitle}>Check in, then jump into any tool below.</p>
            </div>
            <div className={styles.statsRow}>
              <Link to="/vault" className={styles.stat}>
                <span className={styles.statValue}>{loading ? '—' : conversationCount}</span>
                <span className={styles.statLabel}>Conversations</span>
              </Link>
              <Link to="/energy" className={styles.stat}>
                <span className={styles.statValue}>
                  {loading ? '—' : energyLevel ?? '—'}{energyLevel != null ? '%' : ''}
                </span>
                <span className={styles.statLabel}>Energy</span>
              </Link>
              <Link to="/goals" className={styles.stat}>
                <span className={styles.statValue}>{loading ? '—' : goalCount}</span>
                <span className={styles.statLabel}>Goals</span>
              </Link>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={`ui-card ${styles.moodCard}`} aria-label="Daily check-in">
            <h2 className={styles.sectionTitle}>Daily check-in</h2>
            <p className={styles.sectionDesc}>How are you feeling right now?</p>

            <div className={styles.energyPreview}>
              <div className={styles.energyTrack}>
                <div className={styles.energyFill} style={{ width: `${moodLevel}%` }} />
              </div>
              <span className={styles.energyLabel}>
                {moodLevel}% — {energyLevelLabel(moodLevel)}
              </span>
            </div>

            <div className={styles.moodPicker}>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={[styles.moodBtn, mood === m.id ? styles.moodActive : ''].filter(Boolean).join(' ')}
                  onClick={() => selectMood(m)}
                >
                  <span className={styles.moodIcon}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.sliderWrap}>
              <label htmlFor="mood-level" className={styles.sliderLabel}>
                Fine-tune energy: <strong>{moodLevel}%</strong>
              </label>
              <input
                id="mood-level"
                className={styles.slider}
                type="range"
                min="0"
                max="100"
                value={moodLevel}
                onChange={(e) => {
                  setMoodLevel(Number(e.target.value))
                  setSaved(false)
                  setSaveError('')
                }}
              />
            </div>

            <p className={styles.lastCheckIn}>{formatLastCheckIn()}</p>
            {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}

            <button
              type="button"
              className={`btn btn-primary ${styles.saveBtn}`}
              onClick={saveMood}
              disabled={saving}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save check-in'}
            </button>
          </section>

          <section className={styles.tilesSection} aria-label="Quick access">
            <h2 className={styles.sectionTitle}>Your tools</h2>
            <div className={styles.tilesGrid}>
              {TILES.map((t) => (
                <Link key={t.to} to={t.to} className={styles.tile}>
                  <span className={styles.tileIcon} aria-hidden>{t.icon}</span>
                  <span className={styles.tileLabel}>{t.label}</span>
                  <span className={styles.tileDesc}>{t.desc}</span>
                </Link>
              ))}
            </div>
          </section>

          <aside className={`ui-card ${styles.recentCard}`} aria-label="Recent conversations">
            <div className={styles.recentHeader}>
              <h2 className={styles.sectionTitle}>Recent conversations</h2>
              <Link to="/vault" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? (
              <p className="loading-state">Loading…</p>
            ) : conversations.length === 0 ? (
              <div className={styles.emptyRecent}>
                <p>No conversations yet.</p>
                <Link to="/vault" className="btn btn-primary">Add your first</Link>
              </div>
            ) : (
              <ul className={styles.recentList}>
                {conversations.slice(0, 5).map((c) => {
                  const id = c._id || c.id
                  return (
                    <li key={id}>
                      <Link
                        to="/vault"
                        state={{ selectedId: id }}
                        className={styles.recentLink}
                      >
                        <span className={styles.recentDot} />
                        <div>
                          <p className={styles.recentTitle}>{conversationTitle(c)}</p>
                          <div className={styles.recentMeta}>
                            {c.mood && (
                              <span className={`${styles.moodChip} ${styles[c.mood] || ''}`}>{c.mood}</span>
                            )}
                            {c.createdAt && (
                              <time className={styles.recentDate}>
                                {new Date(c.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </time>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>
        </div>

        <section className={`ui-card ${styles.tipsCard}`} aria-label="Quick tips">
          <h2 className={styles.sectionTitle}>Quick tips</h2>
          <ul className={styles.tipsList}>
            <li><strong>Start small</strong> — Log one conversation in Memory Vault after any social interaction.</li>
            <li><strong>Practice first</strong> — Use the Simulator before a real conversation you&apos;re nervous about.</li>
            <li><strong>Check energy</strong> — Track your social battery so you know when to recharge.</li>
          </ul>
        </section>
      </div>
    </AppLayout>
  )
}
