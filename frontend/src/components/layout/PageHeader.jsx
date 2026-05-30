import React from 'react'
import { Link } from 'react-router-dom'
import styles from './PageHeader.module.css'

export default function PageHeader({
  title,
  subtitle,
  backTo = '/dashboard',
  backLabel = 'Dashboard',
  actions,
  stats,
}) {
  return (
    <header className={styles.header}>
      <Link to={backTo} className={styles.back}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to {backLabel}
      </Link>

      <div className={styles.row}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {stats && <div className={styles.stats}>{stats}</div>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  )
}
