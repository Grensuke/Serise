import React, { useEffect, useState } from 'react'
import NavBar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

const StatCard = ({children, className}) => (
  <div className={[styles.card, className].filter(Boolean).join(' ')}>{children}</div>
)

export default function Dashboard(){
  const [conversations, setConversations] = useState([])
  const [_energy, setEnergy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('serise_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE || ''}/api/conversations`, { headers }).then(r=>r.json()).catch(()=>[]),
      fetch(`${import.meta.env.VITE_API_BASE || ''}/api/energy`, { method: 'POST', headers: {...headers, 'Content-Type':'application/json'}, body: JSON.stringify({ level: 50 }) }).then(r=>r.json()).catch(()=>[])
    ]).then(([convs, e])=>{
      setConversations(convs || [])
      // energy endpoint created just as example; if it returns an object wrap in array
      setEnergy(Array.isArray(e) ? e : (e ? [e] : []))
      setLoading(false)
    })
  }, [])
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>How was your <span className={styles.accent}>day</span>?</h1>
        </header>

        <section className={styles.grid} aria-label="dashboard grid">
          <div className={styles.leftBig}>
            <StatCard className={styles.moodCard}>
              <div className={styles.moodInner}>
                <div className={styles.moodIcons}>
                  <button className={styles.moodBtn}>☼<span>Happy</span></button>
                  <button className={styles.moodBtn}>☁<span>Moderate</span></button>
                  <button className={styles.moodBtn}>☾<span>sad</span></button>
                </div>
                <div className={styles.sliderRow}>
                  <input className={styles.slider} type="range" min="0" max="100" />
                </div>
                <label className={styles.saveRow}><input type="checkbox"/> save</label>
              </div>
            </StatCard>
          </div>

          <div className={styles.rightGrid}>
            {/* Primary tiles (2 columns x 4 rows) */}
            {[
              {label: 'Memory Vault', to: '/vault', icon: '💾'},
              {label: 'Energy Tracker', to: '/energy', icon: '⚡'},
              {label: 'Anti‑Overthinking', to: '/overthinking', icon: '🧠'},
              {label: 'Simulator', to: '/simulate', icon: '🎭'},
              {label: 'Scripts', to: '/scripts', icon: '✍️'},
              {label: 'Goals', to: '/goals', icon: '★'},
              {label: 'Profile', to: '/profile', icon: '👤'},
            ].map(t => (
              <Link key={t.to} to={t.to} className={styles.tileLink}>
                <StatCard>
                  <div className={styles.iconBox} aria-hidden>{t.icon}</div>
                  <div className={styles.cardLabel}>{t.label}</div>
                </StatCard>
              </Link>
            ))}

            {/* Conversations card becomes the 8th tile to create a perfect 4x2 grid */}
            <div className={styles.tileLink}>
              <StatCard className={styles.noteCard}>
                {loading ? <div>Loading…</div> : (
                  <div>
                    <div className={styles.cardLabel}>Conversations</div>
                    <ul>
                      {conversations.length === 0 && <li>No conversations yet</li>}
                      {conversations.slice(0,3).map(c => (
                        <li key={c._id || c.id}>{c.summary || c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </StatCard>
            </div>

            {/* removed empty placeholder to keep exactly 8 tiles (2 cols x 4 rows) */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
