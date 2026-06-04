import React from 'react'
import { Link } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
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
        <CaretLeft size={18} weight="bold" />
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
