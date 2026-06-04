import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiJson, authHeaders } from '../../utils/api'
import styles from './Scripts.module.css'

export default function Scripts() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    apiJson('/api/scripts', { headers: authHeaders() })
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch((err) => { setError(err.message || 'Failed to load scripts'); setLoading(false) })
  }, [])

  const create = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError('')
    try {
      const data = await apiJson('/api/scripts', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title, content }),
      })
      setItems((prev) => [data, ...prev])
      setTitle('')
      setContent('')
    } catch (err) {
      setError(err.message || 'Failed to create script')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (it) => {
    setEditingId(it._id || it.id)
    setEditForm({ title: it.title || '', content: it.content || '' })
    setActionError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ title: '', content: '' })
  }

  const saveEdit = async (id) => {
    if (!editForm.title.trim() || !editForm.content.trim()) return
    setEditSaving(true)
    setActionError('')
    try {
      const updated = await apiJson(`/api/scripts/${id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editForm),
      })
      setItems((prev) => prev.map((it) => ((it._id || it.id) === id ? updated : it)))
      setEditingId(null)
    } catch (err) {
      setActionError(err.message || 'Failed to update script')
    } finally {
      setEditSaving(false)
    }
  }

  const deleteScript = async (id) => {
    if (!confirm('Delete this script permanently?')) return
    setActionError('')
    try {
      await apiJson(`/api/scripts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== id))
    } catch (err) {
      setActionError(err.message || 'Failed to delete script')
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

        {error && <p className={styles.bannerError} role="alert">{error}</p>}
        {actionError && <p className={styles.bannerError} role="alert">{actionError}</p>}

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
                {items.map((it) => {
                  const id = it._id || it.id
                  const isEditing = editingId === id
                  return (
                    <li key={id} className={styles.item}>
                      {isEditing ? (
                        <div className={styles.editForm}>
                          <div className="form-field">
                            <label className="form-label">Title</label>
                            <input
                              className="form-input"
                              value={editForm.title}
                              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Script</label>
                            <textarea
                              className="form-textarea"
                              value={editForm.content}
                              onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          <div className={styles.editActions}>
                            <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => saveEdit(id)}
                              disabled={editSaving || !editForm.title.trim() || !editForm.content.trim()}
                            >
                              {editSaving ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.itemHead}>
                            <h3 className={styles.itemTitle}>{it.title}</h3>
                            <div className={styles.itemActions}>
                              <button type="button" className="btn" onClick={() => startEdit(it)}>Edit</button>
                              <button type="button" className="btn btn-danger" onClick={() => deleteScript(id)}>Delete</button>
                            </div>
                          </div>
                          <p className={styles.itemContent}>{it.content}</p>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
