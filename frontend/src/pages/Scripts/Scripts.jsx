import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiFetch, authHeaders } from '../../utils/api'
import styles from './Scripts.module.css'

export default function Scripts() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch('/api/scripts', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const create = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/scripts', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      setItems((prev) => [data, ...prev])
      setTitle('')
      setContent('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Script Builder"
          subtitle="Prepare what you want to say before a conversation."
          stats={<span className={headerStyles.statChip}><strong>{items.length}</strong> scripts</span>}
        />

        <div className={styles.layout}>
          <section className={`ui-card ${styles.formCard}`}>
            <h2 className={styles.cardTitle}>New script</h2>
            <div className="form-field">
              <label htmlFor="script-title" className="form-label">Title</label>
              <input
                id="script-title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Asking a teacher for help"
              />
            </div>
            <div className="form-field">
              <label htmlFor="script-content" className="form-label">Script</label>
              <textarea
                id="script-content"
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your talking points here…"
                rows={6}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={create}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? 'Creating…' : 'Create script'}
            </button>
          </section>

          <section className={`ui-card ${styles.listCard}`}>
            <h2 className={styles.cardTitle}>Your scripts</h2>
            {loading ? (
              <p className="loading-state">Loading…</p>
            ) : items.length === 0 ? (
              <p className="empty-state">No scripts yet.</p>
            ) : (
              <ul className={styles.list}>
                {items.map((it) => (
                  <li key={it._id || it.id} className={styles.item}>
                    <h3 className={styles.itemTitle}>{it.title}</h3>
                    <p className={styles.itemContent}>{it.content}</p>
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
