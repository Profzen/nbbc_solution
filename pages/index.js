// pages/index.js
import Head from "next/head"
import Layout from "../components/Layout"
import Hero from "../components/Hero"
import TradeForm from "../components/TradeForm"
import styles from "../styles/home.module.css"

export default function Home() {
  return (
    <Layout>
      <Head><title>CryptoFiat – Accueil</title></Head>

      <div className={styles.background}>
        <Hero />
        <TradeForm />
      </div>
    </Layout>
  )
}
