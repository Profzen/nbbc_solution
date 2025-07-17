// pages/apropos.js
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaTelegramPlane, FaLinkedinIn, FaTiktok, FaWhatsapp } from "react-icons/fa";
import styles from "../styles/home.module.css";


export default function APropos() {
  return (
    <div className={`${styles.background} min-h-screen text-gray-800 px-4 sm:px-6 md:px-12 py-12`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          À propos de <span className="text-accent">CryptoFiat</span>
        </h1>

        {/* Intro Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-primary">Notre mission</h3>
            <p>
              Offrir une solution simple et rapide pour échanger vos crypto-monnaies et devises fiat à tout moment.
            </p>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-primary">Notre vision</h3>
            <p>
              Devenir la plateforme de référence pour des échanges financiers fluides, accessibles à tous, en toute sécurité.
            </p>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-primary">Ce qui nous distingue</h3>
            <p>
              Une interface claire, des délais ultra-rapides, des taux justes, et un support client humain et réactif.
            </p>
          </div>
        </div>

        {/* Timeline / Historique */}
        <h2 className="text-2xl font-bold mb-6 text-center">Notre Histoire</h2>
        <div className="border-l-2 border-accent pl-6 space-y-8 mb-12">
          <div>
            <p className="text-sm text-accent font-semibold">2022</p>
            <h4 className="text-lg font-bold mb-1">Lancement de CryptoFiat</h4>
            <p>Nous avons commencé avec une idée simple : rendre l’échange crypto plus accessible et rapide pour tous.</p>
          </div>
          <div>
            <p className="text-sm text-accent font-semibold">2023</p>
            <h4 className="text-lg font-bold mb-1">Croissance & Sécurisation</h4>
            <p>Ajout de nouvelles devises, amélioration de la sécurité, et intégration de moyens de paiement variés.</p>
          </div>
          <div>
            <p className="text-sm text-accent font-semibold">2024</p>
            <h4 className="text-lg font-bold mb-1">Perspectives</h4>
            <p>Lancement d’une version Mobile performante, et optimisation avec un design moderne.</p>
          </div>
        </div>

        {/* Valeurs */}
        <h2 className="text-2xl font-bold mb-4 text-center">Nos valeurs</h2>
        <ul className="grid sm:grid-cols-2 gap-4 mb-12 text-lg">
          <li className="bg-blue-100 p-4 rounded-lg">🔐 Sécurité renforcée</li>
          <li className="bg-blue-100 p-4 rounded-lg">🤝 Confiance & transparence</li>
          <li className="bg-blue-100 p-4 rounded-lg">🌍 Accessibilité mondiale</li>
          <li className="bg-blue-100 p-4 rounded-lg">📞 Support client réactif</li>
        </ul>

        {/* Réseaux sociaux */}
        <h2 className="text-2xl font-bold mb-4 text-center">Suivez-nous</h2>
        <div className="flex justify-center space-x-6 text-2xl text-accent mb-8">
          <a href="https://facebook.com/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaTwitter />
          </a>
          <a href="https://instagram.com/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaInstagram />
          </a>
          <a href="https://instagram.com/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaTiktok />
          </a>
          <a href="https://t.me/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaTelegramPlane />
          </a>
          <a href="https://linkedin.com/company/cryptofiat" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaLinkedinIn />
          </a>
          <a href="https://wa.me/22898901032" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaWhatsapp />
          </a>
        </div>

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
