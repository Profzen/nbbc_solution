// frontend/pages/_app.js
import '../styles/globals.css'  // ← import de ton CSS global ici

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
