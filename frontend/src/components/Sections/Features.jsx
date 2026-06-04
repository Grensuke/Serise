import React from 'react'
import { CheckSquare } from '@phosphor-icons/react'
import styles from './Features.module.css'

const FEATURES = [
  'Conversation Logs',
  'AI Chat Practice',
  'Personal Insights',
  'Social Energy Tracking',
  'Script Templates',
  'Connection Reminders',
  'Overthinking Support',
  'Goal Tracking',
  'Calm Tools',
]

const CheckIcon = () => (
  <CheckSquare weight="fill" className={styles.check} size={16} />
)

const Features = () => {
  return (
    <section className={styles.features} aria-labelledby="features-heading">
      <div className={styles.container}>
        <h3 id="features-heading" className={styles.heading}>
          <span className={styles.headingPrimary}>More connection.</span>
          <span className={styles.headingSecondary}>less anxiety.</span>
        </h3>

        <p className={styles.sub}>All your tools to improvise and socialize.</p>

        <div className={styles.featureCard} data-glow>
          <ul className={styles.list}>
            {FEATURES.map((f) => (
              <li key={f} className={styles.item}>
                <span className={styles.iconWrap} aria-hidden>
                  <CheckIcon />
                </span>
                <span className={styles.label}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.callout}>
          <div className={styles.calloutInner}><strong>&ldquo;All this at '0' cost.&rdquo;</strong></div>
        </div>
      </div>
    </section>
  )
}

export default Features
