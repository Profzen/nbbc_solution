// pages/index.js
import Head from "next/head"
import Layout from "../components/Layout"
import Hero from "../components/Hero"
import TradeForm from "../components/TradeForm"

export default function Home() {
  return (
    <Layout>
      <Head><title>CryptoFiat – Accueil</title></Head>
      <Hero />
      <TradeForm />
    </Layout>
  )
}
