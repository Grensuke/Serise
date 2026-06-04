import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiJson, authHeaders } from '../../utils/api'
import styles from './Goals.module.css'

export default function Goals() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [cadence, setCadence] = useState('weekly')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    apiJson('/api/goals', { headers: authHeaders() })
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch((err) => { setError(err.message || 'Failed to load goals'); setLoading(false) })
  }, [])

  const create = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const data = await apiJson('/api/goals', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title, cadence }),
      })
      setItems((prev) => [data, ...prev])
      setTitle('')
    } catch (err) {
      setError(err.message || 'Failed to create goal')
    } finally {
      setSaving(false)
    }
  }

  const updateProgress = async (id, progress) => {
    setActionError('')
    try {
      const updated = await apiJson(`/api/goals/${id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ progress }),
      })
      setItems((prev) => prev.map((it) => ((it._id || it.id) === id ? updated : it)))
    } catch (err) {
      setActionError(err.message || 'Failed to update progress')
    }
  }

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal permanently?')) return
    setActionError('')
    try {
      await apiJson(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== id))
    } catch (err) {
      setActionError(err.message || 'Failed to delete goal')
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

        {error && <p className={styles.bannerError} role="alert">{error}</p>}
        {actionError && <p className={styles.bannerError} role="alert">{actionError}</p>}

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
                onKeyDown={(e) => e.key === 'Enter' && create()}
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
              {items.map((it) => {
                const id = it._id || it.id
                const progress = it.progress ?? 0
                return (
                  <li key={id} className={`ui-card ${styles.goalItem}`}>
                    <div className={styles.goalHeader}>
                      <div className={styles.goalMeta}>
                        <h3 className={styles.goalTitle}>{it.title}</h3>
                        <span className={styles.badge}>{it.cadence}</span>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-danger ${styles.deleteBtn}`}
                        onClick={() => deleteGoal(id)}
                        aria-label="Delete goal"
                        title="Delete goal"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressTopRow}>
                        <span className={styles.progressLabel}>Progress</span>
                        <span className={styles.progressValue}>{progress}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className={styles.progressControls}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={progress}
                          onChange={(e) => updateProgress(id, Number(e.target.value))}
                          className={styles.progressSlider}
                          aria-label="Update progress"
                        />
                        <div className={styles.progressBtns}>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => updateProgress(id, Math.max(0, progress - 10))}
                            disabled={progress === 0}
                          >−10%</button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => updateProgress(id, Math.min(100, progress + 10))}
                            disabled={progress === 100}
                          >+10%</button>
                          {progress < 100 && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => updateProgress(id, 100)}
                            >
                              ✓ Done
                            </button>
                          )}
                          {progress === 100 && (
                            <span className={styles.completedBadge}>🎉 Complete!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
