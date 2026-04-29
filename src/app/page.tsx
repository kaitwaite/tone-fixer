import ToneFixer from "./ToneFixer"

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>Tone Fixer</h1>
        <p>Speak raw. Send polished.</p>
      </header>

      <ToneFixer />

      <footer className="footer">
        <span className="footer-left">A Kate Haan tool</span>
        <a
          className="footer-right"
          href="https://github.com/kaitwaite/tone-fixer"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built with Claude &middot; GitHub
        </a>
      </footer>
    </main>
  )
}
