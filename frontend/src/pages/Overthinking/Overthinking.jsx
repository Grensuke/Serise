import React, { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiFetch, authHeaders } from '../../utils/api'
import styles from './Overthinking.module.css'

export default function Overthinking() {
  const [thought, setThought] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/overthinking', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setEntries(Array.isArray(d) ? d : []); setInitialLoading(false) })
      .catch(() => setInitialLoading(false))
  }, [])

  const submit = async () => {
    if (!thought.trim()) return
    setLoading(true)
    try {
      const res = await apiFetch('/api/overthinking', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ thought }),
      })
      const data = await res.json()
      setEntries((prev) => [data, ...prev])
      setThought('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Anti-Overthinking"
          subtitle="Write down an anxious thought and get a calmer perspective."
          stats={<span className={headerStyles.statChip}><strong>{entries.length}</strong> reflections</span>}
        />

        <section className={`ui-card ${styles.inputCard}`}>
          <div className="form-field">
            <label htmlFor="thought" className="form-label">What's on your mind?</label>
            <textarea
              id="thought"
              className="form-textarea"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="e.g. They probably think I'm awkward for saying that…"
              rows={4}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={loading || !thought.trim()}
          >
            {loading ? 'Analyzing…' : 'Analyze thought'}
          </button>
        </section>

        <section className={styles.entriesSection}>
          <h2 className={styles.entriesTitle}>Past reflections</h2>
          {initialLoading ? (
            <p className="loading-state">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="empty-state">No entries yet. Share your first thought above.</p>
          ) : (
            <div className={styles.entries}>
              {entries.map((e) => (
                <article key={e._id || e.id} className={`ui-card ${styles.entry}`}>
                  <blockquote className={styles.thought}>"{e.thought}"</blockquote>
                  <div className={styles.response}>
                    <span className={styles.responseLabel}>Perspective</span>
                    <p className={styles.ai}>{e.aiResponse}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
