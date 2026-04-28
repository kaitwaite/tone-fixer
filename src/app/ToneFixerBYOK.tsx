"use client"

import { useState, useRef, useCallback } from "react"
import { Mode, MODES, buildSystemPrompt, DEFAULT_PROFILE } from "@/app/voice"

type FeedbackValue = "yes" | "no" | null

interface Result {
  raw: string
  polished: string
  mode: Mode
  feedback: FeedbackValue
}

interface Props {
  apiKey: string
  onChangeKey: () => void
}

export default function ToneFixerBYOK({ apiKey, onChangeKey }: Props) {
  const [raw, setRaw] = useState("")
  const [mode, setMode] = useState<Mode>("email")
  const [isRewriting, setIsRewriting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [streamedText, setStreamedText] = useState("")
  const [copied, setCopied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        // Whisper requires an OpenAI key — prompt user if missing
        const openaiKey = prompt("Enter your OpenAI API key for mic transcription (optional):")
        if (!openaiKey) return

        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const fd = new FormData()
        fd.append("file", new File([blob], "recording.webm", { type: "audio/webm" }))
        fd.append("model", "whisper-1")
        fd.append("language", "en")

        try {
          const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${openaiKey}` },
            body: fd,
          })
          const data = await res.json()
          if (data.text) setRaw((prev) => (prev ? prev + " " + data.text : data.text))
        } catch {
          console.error("Transcription failed")
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsListening(true)
    } catch {
      alert("Microphone access denied. Type your raw reaction instead.")
    }
  }, [])

  const stopMic = useCallback(() => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setIsListening(false)
  }, [])

  const rewrite = useCallback(async () => {
    if (!raw.trim() || isRewriting) return

    setIsRewriting(true)
    setResult(null)
    setStreamedText("")

    const systemPrompt = buildSystemPrompt(DEFAULT_PROFILE, mode)

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: raw }],
        }),
      })

      if (res.status === 401) {
        setStreamedText("Invalid API key. Click \u2018Change key\u2019 to update it.")
        setIsRewriting(false)
        return
      }

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") continue
          try {
            const parsed = JSON.parse(data)
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta"
            ) {
              full += parsed.delta.text
              setStreamedText(full)
            }
          } catch {}
        }
      }

      setResult({ raw, polished: full, mode, feedback: null })
    } catch (err) {
      console.error(err)
      setStreamedText("Something went wrong. Check your API key and try again.")
    } finally {
      setIsRewriting(false)
    }
  }, [raw, mode, isRewriting, apiKey])

  const setFeedback = (value: FeedbackValue) => {
    setResult((prev) => (prev ? { ...prev, feedback: value } : null))
  }

  const copy = async () => {
    const text = result?.polished || streamedText
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const clear = () => {
    setRaw("")
    setResult(null)
    setStreamedText("")
  }

  const isStreaming = isRewriting && streamedText.length > 0
  const showResult = streamedText.length > 0

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="voice-badge">
          <span className="voice-dot" />
          Kate &mdash; warm, direct, professional
          <div className="spacer" style={{ flex: 1 }} />
          <button
            onClick={onChangeKey}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "2px 8px",
              border: "1px solid var(--canvas)",
              borderRadius: "var(--radius)",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            Change key
          </button>
        </div>

        <div className="mode-row">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              className={`mode-btn${mode === m ? " active" : ""}`}
              onClick={() => setMode(m)}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="dictate-area">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") rewrite()
            }}
            placeholder={
              isListening
                ? "Listening\u2026 speak your raw reaction"
                : "Dictate or type your raw reaction\u2026\ne.g. \u201cThis is the third time they\u2019ve moved the deadline and I\u2019m genuinely annoyed\u201d"
            }
            rows={5}
          />
          <button
            className={`mic-btn${isListening ? " listening" : ""}`}
            onClick={() => (isListening ? stopMic() : startMic())}
            title={isListening ? "Stop recording" : "Start dictating"}
          >
            {isListening ? "\u23F9" : "\uD83C\uDF99"}
          </button>
        </div>
      </div>

      <div className="action-row">
        <button
          className="btn-primary"
          onClick={rewrite}
          disabled={!raw.trim() || isRewriting}
        >
          {isRewriting && !showResult
            ? "Rewriting\u2026"
            : "Rewrite in my voice \u2192"}
        </button>
        <button className="btn-clear" onClick={clear}>\u2715</button>
      </div>

      {showResult && (
        <div className="results-grid" style={{ marginTop: 12 }}>
          <div className="result-card">
            <div className="result-label">Raw</div>
            <div className="result-text">{result?.raw || raw}</div>
          </div>

          <div className="result-card polished">
            <div className="result-label polished-label">
              Polished &mdash; {MODES[mode].label}
            </div>
            <div className="result-text">
              {streamedText}
              {isStreaming && <span className="cursor" />}
            </div>

            {!isStreaming && result && (
              <div className="card-footer">
                <button
                  className={`btn-small${copied ? " success" : ""}`}
                  onClick={copy}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <button className="btn-small" onClick={rewrite}>Retry</button>
                <div className="spacer" />
                <span className="feedback-label">Sounds like me?</span>
                <button
                  className={`feedback-btn${result.feedback === "yes" ? " yes" : ""}`}
                  onClick={() => setFeedback("yes")}
                >\uD83D\uDC4D</button>
                <button
                  className={`feedback-btn${result.feedback === "no" ? " no" : ""}`}
                  onClick={() => setFeedback("no")}
                >\uD83D\uDC4E</button>
              </div>
            )}
          </div>
        </div>
      )}

      {!showResult && (
        <div className="empty-state">Your side-by-side will appear here</div>
      )}
    </div>
  )
}
