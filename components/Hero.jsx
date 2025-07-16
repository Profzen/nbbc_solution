// components/Hero.jsx
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-primary mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Échangez vos crypto et fiat en toute simplicité
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Plateforme intuitive, rapide et sécurisée. Convertissez, payez, gérez vos actifs en quelques clics.
        </motion.p>
        <motion.a
          href="#trade"
          className="bg-accent hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Commencer ci-dessous <br/>
        </motion.a>
      </div>
      {/* Décor animé (ex : cercle flottant) */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-primary opacity-20 rounded-full"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
    </section>
)
}
