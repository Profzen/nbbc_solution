// components/Layout.jsx
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"


export default function Layout({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = (url) => {
      if (url !== router.asPath && url.includes("/history")) {
        setLoading(true)
      }
    }
    const handleComplete = () => setLoading(false)

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleComplete)
    router.events.on("routeChangeError", handleComplete)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleComplete)
      router.events.off("routeChangeError", handleComplete)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Nexchang
          </Link>
          {/*<Link href="/" className="flex items-center">
              <Image
                src="/logo.png"        // Remplace par le chemin vers ton logo
                alt="Logo Nexchang"
                width={40}             // largeur du logo (à ajuster)
                height={40}            // hauteur du logo
                priority               // optimisation de chargement
              />
            </Link>
          */}
          {/*<Link href="/" className="flex items-center">
              <Image
                src="/logo.png"        // Remplace par le chemin vers ton logo
                alt="Logo Nexchang"
                width={40}             // largeur du logo (à ajuster)
                height={40}            // hauteur du logo
                priority               // optimisation de chargement
              />
            </Link>
          */}
          <ul className="flex space-x-6">
            <li>
              <Link href="/À propos" className="hover:text-accent">
                a propos
              </Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-accent">
                Historique
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Loader personnalisé */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            Chargement de l’historique, veuillez patienter...
          </p>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-grow pt-20">{children}</main>

      {/* Footer */}
      <footer id="contact" className="bg-white text-center py-8">
        <p className="mb-2">
          Contactez-nous : newbossbusinesscenter@gmail.com <br />
          Appel : +228 98901032 / +228 93793232
        </p>
        <p className="text-sm text-gray-500">© 2025 CryptoFiat</p>
      </footer>
    </div>
  )
}
