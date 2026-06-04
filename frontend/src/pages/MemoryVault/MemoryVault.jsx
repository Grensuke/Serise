import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, MagnifyingGlass, ChatCircle, ClipboardText } from '@phosphor-icons/react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import headerStyles from '../../components/layout/PageHeader.module.css'
import styles from './MemoryVault.module.css'
import { apiJson, authHeaders } from '../../utils/api'
import { conversationTitle } from '../../utils/display'

function QuickAddModal({ open, onClose, onAdd, saving, error }) {
  const [summary, setSummary] = useState('')
  const [participants, setParticipants] = useState('')
  const [mood, setMood] = useState('calm')

  if (!open) return null

  const submit = (e) => {
    e?.preventDefault()
    if (!summary.trim()) return
    onAdd({ participants: participants.trim(), summary: summary.trim(), mood })
  }

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h3>Quick add conversation</h3>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close"><X size={20} weight="bold" /></button>
        </header>
        <form onSubmit={submit}>
          <div className={styles.modalBody}>
            {error && <p className={styles.formError} role="alert">{error}</p>}
            <div className="form-field">
              <label htmlFor="mv-participants" className="form-label">Who was it with?</label>
              <input
                id="mv-participants"
                className="form-input"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="e.g. Rahul, teacher, friend group"
              />
            </div>
            <div className="form-field">
              <label htmlFor="mv-summary" className="form-label">One-line summary *</label>
              <input
                id="mv-summary"
                className="form-input"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What happened?"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="mv-mood" className="form-label">How did it feel?</label>
              <select id="mv-mood" className="form-select" value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="calm">Calm</option>
                <option value="nervous">Nervous</option>
                <option value="anxious">Anxious</option>
                <option value="confident">Confident</option>
              </select>
            </div>
          </div>
          <footer className={styles.modalFooter}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !summary.trim()}>
              {saving ? 'Adding…' : 'Add to vault'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default function MemoryVault() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ participants: '', summary: '', mood: 'calm' })
  const [aiInsights, setAiInsights] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [quickOpen, setQuickOpen] = useState(false)
  const [showDetailMobile, setShowDetailMobile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const listRef = useRef(null)
  const location = useLocation()

  const loadItems = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/conversations', { headers: authHeaders() })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setLoadError(err.message || 'Failed to load conversations')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    const selectId = location.state?.selectedId
    if (!selectId || items.length === 0) return
    const match = items.find((it) => (it._id || it.id) === selectId)
    if (match) {
      setSelected(match)
      setShowDetailMobile(true)
    }
  }, [items, location.state?.selectedId])

  const loadAnalysis = useCallback(async (item) => {
    const id = item?._id || item?.id
    if (!id) {
      setAiInsights(null)
      return
    }

    if (item.analysis?.tone) {
      setAiInsights(item.analysis)
      return
    }

    setAiLoading(true)
    setAiError('')
    try {
      const data = await apiJson(`/api/conversations/${id}/analyze`, { headers: authHeaders() })
      setAiInsights(data)
      setItems((prev) => prev.map((it) => ((it._id || it.id) === id ? { ...it, analysis: data } : it)))
      setSelected((prev) => (prev && (prev._id || prev.id) === id ? { ...prev, analysis: data } : prev))
    } catch (err) {
      setAiInsights(null)
      setAiError(err.message || 'Analysis failed')
    } finally {
      setAiLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selected) {
      setAiInsights(null)
      setAiError('')
      setEditing(false)
      return
    }
    setEditForm({
      participants: selected.participants || '',
      summary: selected.summary || '',
      mood: selected.mood || 'calm',
    })
    loadAnalysis(selected)
  }, [selected, loadAnalysis])

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      if (e.key.toLowerCase() === 'n') setQuickOpen(true)
      if (e.key.toLowerCase() === 's') {
        document.querySelector('#mv-search')?.focus()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleAdd(payload) {
    setSaving(true)
    setAddError('')
    try {
      const data = await apiJson('/api/conversations', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      })
      setItems((prev) => [data, ...prev])
      setSelected(data)
      setShowDetailMobile(true)
      setQuickOpen(false)
    } catch (err) {
      setAddError(err.message || 'Failed to save conversation')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    const id = selected?._id || selected?.id
    if (!id) return

    setSaving(true)
    setActionError('')
    setActionSuccess('')
    try {
      const updated = await apiJson(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editForm),
      })
      setItems((prev) => prev.map((it) => ((it._id || it.id) === id ? updated : it)))
      setSelected(updated)
      setEditing(false)
      setActionSuccess('Conversation updated.')
      setTimeout(() => setActionSuccess(''), 2500)
    } catch (err) {
      setActionError(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const id = selected?._id || selected?.id
    if (!id) return
    if (!confirm('Delete this conversation permanently?')) return

    setSaving(true)
    setActionError('')
    try {
      await apiJson(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== id))
      setSelected(null)
      setShowDetailMobile(false)
      setActionSuccess('Conversation deleted.')
      setTimeout(() => setActionSuccess(''), 2500)
    } catch (err) {
      setActionError(err.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  async function handleReanalyze() {
    if (!selected) return
    const id = selected._id || selected.id
    setItems((prev) => prev.map((it) => ((it._id || it.id) === id ? { ...it, analysis: null } : it)))
    setSelected((prev) => (prev ? { ...prev, analysis: null } : prev))
    await loadAnalysis({ ...selected, analysis: null })
  }

  const filtered = items
    .filter((it) => {
      if (!query) return true
      const q = query.toLowerCase()
      return (
        (it.summary || '').toLowerCase().includes(q) ||
        (it.participants || '').toLowerCase().includes(q) ||
        (it.title || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'mood') return (a.mood || '').localeCompare(b.mood || '')
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  const selectItem = (it) => {
    setSelected(it)
    setShowDetailMobile(true)
    setActionError('')
    setActionSuccess('')
  }

  const stats = (
    <>
      <span className={headerStyles.statChip}><strong>{items.length}</strong> logs</span>
      <span className={headerStyles.statChip}><strong>{filtered.length}</strong> shown</span>
    </>
  )

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <PageHeader
          title="Memory Vault"
          subtitle="Save, search, and reflect on your conversations."
          stats={stats}
          actions={
            <button type="button" className="btn btn-primary" onClick={() => { setAddError(''); setQuickOpen(true) }}>
              + Quick add
            </button>
          }
        />

        {loadError && <p className={styles.bannerError} role="alert">{loadError}</p>}
        {actionSuccess && <p className={styles.bannerSuccess} role="status">{actionSuccess}</p>}

        <div className={styles.toolbarBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden><MagnifyingGlass size={18} weight="bold" /></span>
            <input
              id="mv-search"
              className={styles.searchInput}
              placeholder="Search by person, summary, or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.toolbarControls}>
            <label className={styles.sortLabel}>
              Sort
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Newest first</option>
                <option value="mood">By mood</option>
              </select>
            </label>
          </div>
        </div>

        <main className={styles.main}>
          <aside className={styles.listCol} aria-label="Conversation list">
            {loading ? (
              <p className="loading-state">Loading conversations…</p>
            ) : items.length === 0 ? (
              <div className={`ui-card ${styles.emptyList}`}>
                <span className={styles.emptyIcon} aria-hidden><ChatCircle weight="duotone" size={48} color="var(--accent-light)" /></span>
                <h2>No conversations yet</h2>
                <p>Log a chat to build your memory vault and get AI insights over time.</p>
                <button type="button" className="btn btn-primary" onClick={() => setQuickOpen(true)}>
                  Add your first conversation
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className={`ui-card ${styles.emptyList}`}>
                <h2>No matches</h2>
                <p>Try a different search term.</p>
                <button type="button" className="btn" onClick={() => setQuery('')}>Clear search</button>
              </div>
            ) : (
              <ul className={styles.list} ref={listRef}>
                {filtered.map((it) => {
                  const id = it._id || it.id
                  const isActive = selected && (selected._id || selected.id) === id
                  return (
                    <li
                      key={id}
                      tabIndex={0}
                      className={[styles.listItem, isActive ? styles.listItemActive : ''].filter(Boolean).join(' ')}
                      onClick={() => selectItem(it)}
                      onKeyDown={(e) => e.key === 'Enter' && selectItem(it)}
                    >
                      <div className={styles.itemHead}>
                        <p className={styles.itemTitle}>{conversationTitle(it)}</p>
                        <time className={styles.itemDate}>
                          {it.createdAt ? new Date(it.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                        </time>
                      </div>
                      <p className={styles.itemExcerpt}>{(it.summary || 'No summary').slice(0, 90)}</p>
                      <span className={`${styles.moodBadge} ${styles[it.mood || 'calm']}`}>{it.mood || 'calm'}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>

          <section className={`${styles.detailCol} ${showDetailMobile ? styles.openMobile : ''}`} aria-live="polite">
            {selected ? (
              <div className={`ui-card ${styles.detailInner}`}>
                <div className={styles.detailTop}>
                  <button type="button" className={styles.mobileBack} onClick={() => setShowDetailMobile(false)}>
                    ← Back to list
                  </button>
                  <div className={styles.detailHeader}>
                    <div>
                      <h2>{conversationTitle(selected)}</h2>
                      <p className={styles.metaSmall}>
                        {[selected.participants, selected.createdAt ? new Date(selected.createdAt).toLocaleString() : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className={styles.detailActions}>
                      {!editing && (
                        <button type="button" className="btn" onClick={() => setEditing(true)} disabled={saving}>
                          Edit
                        </button>
                      )}
                      <Link to="/simulate" className="btn">Practice</Link>
                      <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {actionError && <p className={styles.formError} role="alert">{actionError}</p>}

                <div className={styles.detailBody}>
                  <div className={styles.summaryArea}>
                    {editing ? (
                      <form onSubmit={handleSaveEdit} className={styles.editForm}>
                        <div className="form-field">
                          <label className="form-label" htmlFor="edit-participants">With</label>
                          <input
                            id="edit-participants"
                            className="form-input"
                            value={editForm.participants}
                            onChange={(e) => setEditForm((f) => ({ ...f, participants: e.target.value }))}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="edit-summary">Summary *</label>
                          <textarea
                            id="edit-summary"
                            className="form-textarea"
                            value={editForm.summary}
                            onChange={(e) => setEditForm((f) => ({ ...f, summary: e.target.value }))}
                            rows={4}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="edit-mood">Mood</label>
                          <select
                            id="edit-mood"
                            className="form-select"
                            value={editForm.mood}
                            onChange={(e) => setEditForm((f) => ({ ...f, mood: e.target.value }))}
                          >
                            <option value="calm">Calm</option>
                            <option value="nervous">Nervous</option>
                            <option value="anxious">Anxious</option>
                            <option value="confident">Confident</option>
                          </select>
                        </div>
                        <div className={styles.editActions}>
                          <button type="button" className="btn" onClick={() => setEditing(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary" disabled={saving || !editForm.summary.trim()}>
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3>Summary</h3>
                        <p>{selected.summary || 'No summary yet.'}</p>
                        {selected.participants && (
                          <>
                            <h4>With</h4>
                            <p>{selected.participants}</p>
                          </>
                        )}
                        {selected.transcript && (
                          <>
                            <h4>Transcript</h4>
                            <pre className={styles.transcript}>{selected.transcript}</pre>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <aside className={styles.aiPanel}>
                    <div className={styles.aiPanelHead}>
                      <h3 className={styles.aiTitle}>AI insights</h3>
                      <button type="button" className="btn" onClick={handleReanalyze} disabled={aiLoading}>
                        {aiLoading ? 'Analyzing…' : 'Refresh'}
                      </button>
                    </div>
                    {aiLoading ? (
                      <p className={styles.muted}>Analyzing conversation…</p>
                    ) : aiError ? (
                      <p className={styles.formError}>{aiError}</p>
                    ) : aiInsights ? (
                      <>
                        <div className={styles.insight}><strong>Tone</strong> {aiInsights.tone || 'Neutral'}</div>
                        <div className={styles.insight}><strong>Confidence</strong> {aiInsights.confidence || 0}/100</div>
                        {(aiInsights.keyPoints || []).length > 0 && (
                          <div className={styles.insight}>
                            <strong>Key points</strong>
                            <ul>{aiInsights.keyPoints.slice(0, 5).map((k, i) => <li key={i}>{k}</li>)}</ul>
                          </div>
                        )}
                        {(aiInsights.suggestedReplies || []).length > 0 && (
                          <div className={styles.suggestedReplies}>
                            <strong>Suggested replies</strong>
                            {aiInsights.suggestedReplies.slice(0, 3).map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                className="btn"
                                onClick={() => navigator.clipboard?.writeText(s)}
                              >
                                {s.length > 36 ? `${s.slice(0, 36)}…` : s}
                              </button>
                            ))}
                          </div>
                        )}
                        {aiInsights.reassurance && (
                          <div className={styles.reassurance}>{aiInsights.reassurance}</div>
                        )}
                      </>
                    ) : (
                      <p className={styles.muted}>Analysis will appear here.</p>
                    )}
                  </aside>
                </div>
              </div>
            ) : (
              <div className={`ui-card ${styles.emptyDetail}`}>
                <span className={styles.emptyIcon} aria-hidden><ClipboardText weight="duotone" size={56} color="var(--accent-light)" /></span>
                <h2>Select a conversation</h2>
                <p>Choose an entry from the list to view details and AI insights.</p>
                {items.length === 0 && (
                  <button type="button" className="btn btn-primary" onClick={() => setQuickOpen(true)}>
                    Add your first
                  </button>
                )}
              </div>
            )}
          </section>
        </main>

        <QuickAddModal
          key={quickOpen ? 'open' : 'closed'}
          open={quickOpen}
          onClose={() => { setQuickOpen(false); setAddError('') }}
          onAdd={handleAdd}
          saving={saving}
          error={addError}
        />
      </div>
    </AppLayout>
  )
}
