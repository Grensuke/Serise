import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChatCircle, Target, CaretLeft } from '@phosphor-icons/react'
import AppLayout from '../../components/layout/AppLayout'
import headerStyles from '../../components/layout/PageHeader.module.css'
import { apiJson, authHeaders } from '../../utils/api'
import { logout } from '../../utils/auth'
import styles from './Profile.module.css'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    apiJson('/api/profile', { headers: authHeaders() })
      .then((d) => {
        setProfile(d)
        setName(d.name || '')
        setBio(d.bio || '')
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load profile')
        setLoading(false)
      })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updated = await apiJson('/api/profile', {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      })
      setProfile(updated)
      setName(updated.name || '')
      setBio(updated.bio || '')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="page-shell"><p className="loading-state">Loading profile…</p></div>
      </AppLayout>
    )
  }

  if (error && !profile) {
    return (
      <AppLayout>
        <div className="page-shell">
          <p className={styles.error} role="alert">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </AppLayout>
    )
  }

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'

  return (
    <AppLayout>
      <div className={`page-shell ${styles.page}`}>
        <Link to="/dashboard" className={styles.backLink}>
          <CaretLeft size={18} weight="bold" />
          Back to Dashboard
        </Link>
        <div className={styles.heroSection}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarGlow} aria-hidden />
            <div className={styles.avatar}>{initial}</div>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{profile?.name || 'Your Profile'}</h1>
            <p className={styles.heroSubtitle}>Manage your account and view your activity.</p>
          </div>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {saved && <p className={styles.success} role="status">Profile saved successfully.</p>}

        <div className={styles.grid}>
          <section className={`ui-card ${styles.card} ${styles.activityCard}`}>
            <h2 className={styles.cardTitle}>Your Activity</h2>
            <div className={styles.stats}>
              <Link to="/vault" className={styles.statBox}>
                <div className={styles.statIconWrap}><ChatCircle weight="duotone" size={28} /></div>
                <div className={styles.statContent}>
                  <span className={styles.statNum}>{profile?.conversationCount ?? 0}</span>
                  <span className={styles.statLabel}>Conversations</span>
                </div>
              </Link>
              <Link to="/goals" className={styles.statBox}>
                <div className={styles.statIconWrap}><Target weight="duotone" size={28} /></div>
                <div className={styles.statContent}>
                  <span className={styles.statNum}>{profile?.goalCount ?? 0}</span>
                  <span className={styles.statLabel}>Goals</span>
                </div>
              </Link>
            </div>
          </section>

          <section className={`ui-card ${styles.card} ${styles.accountCard}`}>
            <h2 className={styles.cardTitle}>Account Details</h2>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label htmlFor="profile-name" className="form-label">Name</label>
                <input
                  id="profile-name"
                  className={`form-input ${styles.softInput}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                />
              </div>
              <div className={styles.readOnlyField}>
                <span className={styles.fieldLabel}>Email</span>
                <span className={styles.fieldValue}>{profile?.email || '—'}</span>
              </div>
              <div className="form-field">
                <label htmlFor="profile-bio" className="form-label">Bio</label>
                <textarea
                  id="profile-bio"
                  className={`form-textarea ${styles.softInput}`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short note about yourself…"
                  rows={4}
                  maxLength={500}
                />
                <span className={styles.charCount}>{bio.length}/500</span>
              </div>
              <button type="submit" className={`btn ${styles.gradientBtn}`} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </section>

          <section className={`ui-card ${styles.card} ${styles.dangerZone}`}>
            <h2 className={styles.cardTitle}>Session</h2>
            <p className={styles.dangerDesc}>Sign out of your account on this device.</p>
            <button type="button" className={`btn ${styles.dangerBtn}`} onClick={handleLogout}>
              Log out
            </button>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
