import React from 'react'
import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import styles from './Hero.module.css'

const Hero = () => {
	return (
		<section className={styles.hero} aria-labelledby="hero-heading">
			<div className={styles.container}>
				<h1 id="hero-heading" className={styles.title}>
					<span className={styles.line}>Small steps.</span>
					<span className={styles.linePrimary}>Stronger</span>
					<span className={styles.line}>Conversations.</span>
				</h1>

				<Link className={styles.chevron} to="/auth/login" aria-label="Go to login page">
					<CaretRight size={28} weight="bold" />
				</Link>
			</div>
		</section>
	)
}

export default Hero
