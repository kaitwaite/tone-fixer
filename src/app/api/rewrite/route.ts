import { NextRequest } from "next/server"
import { buildSystemPrompt, DEFAULT_PROFILE, Mode } from "@/app/voice"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  const { raw, mode } = (await req.json()) as { raw: string; mode: Mode }

  if (!raw?.trim()) {
    return new Response("Missing raw input", { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured", { status: 500 })
  }

  const systemPrompt = buildSystemPrompt(DEFAULT_PROFILE, mode ?? "email")

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: raw }],
    }),
  })

  if (!response.ok) {
    return new Response("Anthropic API error", { status: response.status })
  }

  // Pass the SSE stream straight through to the client
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
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
              controller.enqueue(encoder.encode(parsed.delta.text))
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
