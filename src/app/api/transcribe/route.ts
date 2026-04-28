import { NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get("audio") as File | null

  if (!audio) {
    return Response.json({ error: "No audio file provided" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 })
  }

  const fd = new FormData()
  fd.append("file", new File([audio], "recording.webm", { type: audio.type }))
  fd.append("model", "whisper-1")
  fd.append("language", "en")

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  })

  if (!response.ok) {
    return Response.json({ error: "Transcription failed" }, { status: response.status })
  }

  const data = await response.json()
  return Response.json({ text: data.text })
}
