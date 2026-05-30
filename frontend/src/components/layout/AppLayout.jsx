import React from 'react'
import Footer from './Footer'
import styles from './AppLayout.module.css'

export default function AppLayout({ children, footer = false, className = '' }) {
  return (
    <div className={[styles.layout, className].filter(Boolean).join(' ')}>
      <main className={styles.main}>{children}</main>
      {footer && <Footer />}
    </div>
  )
}
