import React from 'react'
import { PenNib, Lightbulb } from '@phosphor-icons/react'
import styles from './Introducing.module.css'
import sketch from '../../assets/sketch.png'

const Introducing = () => {
  return (
    <section className={styles.intro} aria-labelledby="introducing-heading">
      <div className={styles.container}>
        <h2 id="introducing-heading" className={styles.heading}>
          Introducing <span className={styles.logoSmall}>Serise</span>
        </h2>

        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <article className={styles.cardLarge} data-glow>
              <p className={styles.lead}>
                Your quiet <strong className={styles.accent}>companion</strong> for navigating the noise of social life.
              </p>
            </article>

            <div className={styles.tiles}>
              <article className={styles.tile} data-glow>
                <div className={styles.tileIcon}><PenNib weight="duotone" size={24} color="var(--accent)" /></div>
                <h3 className={styles.tileTitle}>Reflect Clearly</h3>
                <p className={styles.tileSubtitle}>Conversation logs with AI insights</p>
              </article>

              <article className={styles.tile} data-glow>
                <div className={styles.tileIcon}><Lightbulb weight="duotone" size={24} color="var(--accent)" /></div>
                <h3 className={styles.tileTitle}>Understand</h3>
                <p className={styles.tileSubtitle}>Insights from your interactions</p>
              </article>
            </div>
          </div>

          <div className={styles.middleColumn}>
            <article className={styles.cardTall} data-glow>
              <div className={styles.cardText}>
                <p>
                  With gentle guidance, practical tools, and <strong className={styles.accent}>AI-powered support</strong>,
                  Serise makes every interaction feel easier, <strong className={styles.accent}>calmer</strong>, and more in your control.
                </p>
              </div>

              <div className={styles.cardImage} role="img" aria-label="Illustration">
                <img src={sketch} alt="Serene sketch" />
              </div>
            </article>
          </div>
        </div>

        <p className={styles.quote}>&ldquo;Rise with <span className={styles.quoteAccent}>Serene</span> Confidence.&rdquo;</p>
      </div>
    </section>
  )
}

export default Introducing
