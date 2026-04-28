export type Mode = "email" | "slack" | "linkedin" | "review"

export interface VoiceProfile {
  name: string
  traits: string
  examples?: { raw: string; polished: string }[]
}

export const MODES: Record<Mode, { label: string; instruction: string }> = {
  email: {
    label: "Email",
    instruction:
      "Professional email. Warm opener where needed, clear ask, direct close. Under 4 sentences unless the topic demands more. Include a subject line prefixed with 'Subject:'.",
  },
  slack: {
    label: "Slack",
    instruction:
      "Casual-professional Slack message. No 'Hi [Name]', no sign-off. Punchy, clear, max 2-3 sentences. Emoji OK if it fits.",
  },
  linkedin: {
    label: "LinkedIn",
    instruction:
      "Thoughtful but conversational. Not a press release. No hashtags unless truly relevant. Sounds like a real person reflecting, not broadcasting.",
  },
  review: {
    label: "Review",
    instruction:
      "Constructive, specific, growth-oriented. Balance directness with empathy. Use concrete examples where provided. Avoid vague praise or vague criticism.",
  },
}

export const DEFAULT_PROFILE: VoiceProfile = {
  name: "Kate",
  traits: `
- Warm but direct — never cold, never wishy-washy
- Enthusiastic about things she cares about; that enthusiasm comes through
- Uses "I" not "we" unless it's genuinely collaborative
- Says what she means; doesn't bury the ask
- Asks direct questions rather than hinting
- Ends with clear next steps or a single clear ask
- No filler: "I hope this finds you well", "per my last email", "circle back", "synergy", "touch base", "move the needle"
- Personality is a feature, not a bug — warmth and directness coexist
- Short sentences when making a point. Longer when explaining context.
`.trim(),
  examples: [
    {
      raw: "This is the third time they've moved the deadline and I'm genuinely annoyed — can they just commit to something?",
      polished:
        "I want to make sure we're set up for success here — this is the third timeline shift and I'd love to lock in a date we can all hold to. What would it take to commit to [date]?",
    },
  ],
}

export function buildSystemPrompt(profile: VoiceProfile, mode: Mode): string {
  const { instruction } = MODES[mode]
  const examplesBlock =
    profile.examples && profile.examples.length > 0
      ? `\n\nVoice examples (raw \u2192 polished):\n${profile.examples
          .map((e) => `RAW: "${e.raw}"\nPOLISHED: "${e.polished}"`)
          .join("\n\n")}`
      : ""

  return `You are a professional communication rewriter for ${profile.name}.

Her voice:
${profile.traits}
${examplesBlock}

Context mode: ${mode.toUpperCase()}
Instructions: ${instruction}

Rules:
1. Preserve the substance and emotional truth of the raw input
2. Never sanitize the directness into vagueness
3. Sound like ${profile.name} wrote this, not a template
4. Output ONLY the rewritten message. No preamble, no explanation.
5. If the mode is email, start with "Subject: [subject line]" on the first line, then a blank line, then the body.`
}
