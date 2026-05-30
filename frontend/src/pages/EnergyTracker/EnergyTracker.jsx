import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiFetch, authHeaders } from '../../utils/api'
import styles from './EnergyTracker.module.css'

export default function EnergyTracker() {
  const [logs, setLogs] = useState([])
  const [level, setLevel] = useState(50)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch('/api/energy', { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/energy', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ level, note }),
      })
      const data = await res.json()
      setLogs((prev) => [data, ...prev])
      setNote('')
    } finally {
      setSaving(false)
    }
  }

  const levelLabel = (v) => {
    if (v >= 75) return 'High'
    if (v >= 40) return 'Moderate'
    return 'Low'
  }

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Social Energy Tracker"
          subtitle="Log how much social energy you have right now."
          stats={<span className={headerStyles.statChip}><strong>{logs.length}</strong> logs</span>}
        />

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
              <label htmlFor="energy-note" className="form-label">Note (optional)</label>
              <input
                id="energy-note"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What affected your energy today?"
              />
            </div>

            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Log energy'}
            </button>
          </section>

          <section className={`ui-card ${styles.historyCard}`}>
            <h2 className={styles.historyTitle}>Recent logs</h2>
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
