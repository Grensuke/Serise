import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiJson, authHeaders } from '../../utils/api'
import styles from './EnergyTracker.module.css'

export default function EnergyTracker() {
  const [logs, setLogs] = useState([])
  const [level, setLevel] = useState(50)
  const [note, setNote] = useState('')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')

  const ACTIVITY_OPTIONS = [
    'Meeting', 'Party', 'Deep Work', 'Reading',
    'Socializing', 'Family Time', 'Running Errands', 'Relaxing'
  ]

  const toggleActivity = (act) => {
    setActivities(prev => prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act])
  }

  useEffect(() => {
    apiJson('/api/energy', { headers: authHeaders() })
      .then((data) => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch((err) => { setError(err.message || 'Failed to load energy logs'); setLoading(false) })
  }, [])

  const save = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const data = await apiJson('/api/energy', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ level, note, activities }),
      })
      setLogs((prev) => [data, ...prev])
      setNote('')
      setActivities([])
    } catch (err) {
      setSaveError(err.message || 'Failed to save energy log')
    } finally {
      setSaving(false)
    }
  }

  const levelLabel = (v) => {
    if (v >= 75) return 'High'
    if (v >= 40) return 'Moderate'
    return 'Low'
  }

  const handleAnalyze = async () => {
    setAiLoading(true)
    try {
      const data = await apiJson('/api/energy/analyze', { headers: authHeaders() })
      setAiAnalysis(data.analysis || 'Analysis failed.')
    } catch (err) {
      console.error(err)
      setAiAnalysis('Could not analyze logs at this time.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Social Energy Tracker"
          subtitle="Log how much social energy you have right now."
          stats={<span className={headerStyles.statChip}><strong>{logs.length}</strong> logs</span>}
        />

        {error && <p className={styles.bannerError} role="alert">{error}</p>}

        <div className={styles.layout}>
          <section className={`ui-card ${styles.inputCard}`}>
            <div className={styles.meterWrap}>
              <div className={styles.meterTrack}>
                <div className={styles.meterFill} style={{ width: `${level}%` }} />
              </div>
              <div className={styles.meterLabels}>
                <span>Drained</span>
                <span className={styles.meterValue}>{level}% — {levelLabel(level)}</span>
                <span>Full</span>
              </div>
            </div>

            <input
              className={styles.range}
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              aria-label="Energy level"
            />

            <div className="form-field">
              <label className="form-label">Activities (optional)</label>
              <div className={styles.activityWrap}>
                {ACTIVITY_OPTIONS.map(act => (
                  <button
                    key={act}
                    type="button"
                    className={`${styles.activityChip} ${activities.includes(act) ? styles.activityChipActive : ''}`}
                    onClick={() => toggleActivity(act)}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="energy-note" className="form-label">Note (optional)</label>
              <input
                id="energy-note"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What affected your energy today?"
              />
            </div>

            {saveError && <p className={styles.bannerError} role="alert">{saveError}</p>}

            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Log energy'}
            </button>
          </section>

          <section className={`ui-card ${styles.historyCard}`}>
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>Recent logs</h2>
              <button className="btn" onClick={handleAnalyze} disabled={aiLoading || logs.length < 3}>
                {aiLoading ? 'Analyzing...' : 'Analyze Trends'}
              </button>
            </div>

            {aiAnalysis && (
              <div className={styles.aiInsightsPanel}>
                <h3>✨ AI Insights</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{aiAnalysis}</p>
              </div>
            )}
            {loading ? (
              <p className="loading-state">Loading…</p>
            ) : logs.length === 0 ? (
              <p className="empty-state">No logs yet. Save your first check-in above.</p>
            ) : (
              <ul className={styles.list}>
                {logs.map((l) => (
                  <li key={l._id || l.id} className={styles.logItem}>
                    <div className={styles.logBar} style={{ width: `${l.level}%` }} />
                    <div className={styles.logInfo}>
                      <span className={styles.logLevel}>{l.level}%</span>
                      <time className={styles.logDate}>
                        {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}
                      </time>
                      {(l.activities && l.activities.length > 0) && (
                        <div className={styles.logActivities}>
                          {l.activities.join(', ')}
                        </div>
                      )}
                      {l.note && <p className={styles.logNote}>{l.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
