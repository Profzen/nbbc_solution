// components/Layout.jsx
import { motion } from "framer-motion"
import Link from "next/link"

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            CryptoFiat
          </Link>
          <ul className="flex space-x-6">
            {/* 
            <li>
              <Link href="/" className="hover:text-accent">
                Accueil
              </Link>
            </li>
             */}
            
            <li>
              <Link href="/apropos" className="hover:text-accent">
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

      {/* Contenu principal */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-white text-center py-8">
        <p className="mb-2">Contactez-nous : newbossbusinesscenter@gmail.com <br/>
        Appel : +228 98901032 / +228 93793232
        </p>
        <p className="text-sm text-gray-500">© 2025 CryptoFiat</p>
      </footer>
    </div>
  )
}
