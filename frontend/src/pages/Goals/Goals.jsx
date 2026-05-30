import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiFetch, authHeaders } from '../../utils/api'
import styles from './Goals.module.css'

export default function Goals() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [cadence, setCadence] = useState('weekly')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch('/api/goals', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const create = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/goals', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title, cadence }),
      })
      const data = await res.json()
      setItems((prev) => [data, ...prev])
      setTitle('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Social Goal Tracker"
          subtitle="Set small, achievable social goals and track your progress."
          stats={<span className={headerStyles.statChip}><strong>{items.length}</strong> goals</span>}
        />

        <section className={`ui-card ${styles.formCard}`}>
          <div className={styles.formRow}>
            <div className={`form-field ${styles.titleField}`}>
              <label htmlFor="goal-title" className="form-label">Goal</label>
              <input
                id="goal-title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Start one conversation this week"
              />
            </div>
            <div className={`form-field ${styles.cadenceField}`}>
              <label htmlFor="goal-cadence" className="form-label">Cadence</label>
              <select
                id="goal-cadence"
                className="form-select"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              type="button"
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={create}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Adding…' : 'Add goal'}
            </button>
          </div>
        </section>

        <section className={styles.goalsSection}>
          {loading ? (
            <p className="loading-state">Loading…</p>
          ) : items.length === 0 ? (
            <p className="empty-state">No goals yet. Add your first one above.</p>
          ) : (
            <ul className={styles.list}>
              {items.map((it) => (
                <li key={it._id || it.id} className={`ui-card ${styles.goalItem}`}>
                  <div className={styles.goalHeader}>
                    <h3 className={styles.goalTitle}>{it.title}</h3>
                    <span className={styles.badge}>{it.cadence}</span>
                  </div>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${it.progress || 0}%` }} />
                    </div>
                    <span className={styles.progressLabel}>{it.progress || 0}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
