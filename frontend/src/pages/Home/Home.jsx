import React from 'react'
import Hero from '../../components/UI/Hero'
import Introducing from '../../components/Sections/Introducing'
import Features from '../../components/Sections/Features'
import Footer from '../../components/layout/Footer'

const Home = () => {
  return (
    <>
      <Hero />
      <Introducing />
      <Features />
      <Footer />
    </>
  )
}

export default Home
