"use client"

import { useState, useRef, useEffect } from "react"

interface GateScreenProps {
  onEnter: (apiKey: string) => void
}

export default function GateScreen({ onEnter }: GateScreenProps) {
  const [key, setKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleContinue = async () => {
    const trimmed = key.trim()
    if (!trimmed) return

    if (!trimmed.startsWith("sk-ant-")) {
      setError("Key must start with sk-ant-")
      return
    }

    setError("")
    setLoading(true)

    // 400ms artificial delay per playbook — for feel, not a real API call
    await new Promise((resolve) => setTimeout(resolve, 400))

    setLoading(false)
    onEnter(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleContinue()
  }

  return (
    <div className="gate-screen">
      <div className="gate-glow-top" />
      <div className="gate-glow-bottom" />

      <div className="gate-inner">
        <div className="gate-eyebrow">
          <div className="gate-eyebrow-rule" />
          <span className="gate-eyebrow-text">A Kate Haan tool</span>
        </div>

        <h1 className="gate-headline">
          Speak raw.<br />
          <em>Send polished.</em>
        </h1>

        <p className="gate-subtitle">
          Dictate your unfiltered reaction. Get back a version that sounds like
          your actual professional voice &mdash; not corporate-speak.
          <br /><br />
          Bring your own Anthropic API key. It&rsquo;s sent directly to the API and
          never stored.
        </p>

        <div className="gate-field">
          <label className="gate-label" htmlFor="gate-key">
            Anthropic API Key
          </label>
          <div className="gate-input-row">
            <input
              ref={inputRef}
              id="gate-key"
              className="gate-input"
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => {
                setKey(e.target.value)
                if (error) setError("")
              }}
              onKeyDown={handleKeyDown}
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
            />
            <button
              className="gate-show-btn"
              onClick={() => setShowKey((v) => !v)}
              type="button"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div className="gate-error">{error}</div>}
        </div>

        <button
          className="gate-continue-btn"
          onClick={handleContinue}
          disabled={!key.trim() || loading}
        >
          {loading ? "One moment\u2026" : "Continue \u2192"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(250,248,245,0.35)",
              textDecoration: "none",
            }}
          >
            Get a key at console.anthropic.com
          </a>
        </div>
      </div>

      <div className="gate-footer">
        <span className="gate-footer-left">A Kate Haan tool</span>
        <span className="gate-footer-right">Built with Claude &middot; GitHub</span>
      </div>
    </div>
  )
}
