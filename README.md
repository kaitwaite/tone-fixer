# Tone Fixer

> Dictate your unfiltered reaction. Get back a version that sounds like your actual professional voice — not HR-sanitized corporate-speak.

A lightweight AI-powered tool that rewrites raw, dictated reactions into polished, sendable messages — without stripping out your personality or directness.

**[Try the live demo →](https://tone-fixer-public.vercel.app)**

---

## Two versions

| Branch | For | API key |
|--------|-----|---------|
| `main` | Fork to deploy your own | Set in Vercel env vars |
| `byok` | Live demo | Users paste their own key |

---

## Deploy in 5 minutes

### 1. Fork this repo

Click **Fork** in the top right on GitHub.

### 2. Get an Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import your forked repo
2. Add environment variable: `ANTHROPIC_API_KEY` = your key
3. Click Deploy

You'll get a URL like `your-app.vercel.app` in about 2 minutes.

---

## How it works

Hit the mic button and speak your raw reaction, or just type it. Pick a context mode — email, Slack, LinkedIn, or performance review. The tool rewrites it in your voice and shows you a side-by-side: raw on the left, polished on the right. Copy and send.

The rewrite preserves the substance and emotional truth of what you said. It cleans up the delivery without sanitizing the directness into vagueness.

---

## Example output

**Raw:** This is the third time they've moved the deadline and I'm genuinely annoyed — can they just commit to something?

**Polished (email):**

> **Subject:** Locking in a timeline
>
> I want to make sure we're set up for success here — this is the third timeline shift and I'd love to lock in a date we can all hold to. What would it take to commit to [date]?

Same directness. Same personality. Sendable.

---

## Customising the voice

The voice baseline lives in one place: `src/app/voice.ts`.

### Change whose voice it uses

Find `DEFAULT_PROFILE` and replace it with your own:

```ts
export const DEFAULT_PROFILE: VoiceProfile = {
  name: "Your Name",
  traits: `
- [describe your communication style]
- [what phrases you never use]
- [what makes your voice distinctive]
  `.trim(),
  examples: [
    {
      raw: "paste something you'd actually say",
      polished: "paste how you'd want it to land",
    },
  ],
}
```

The more specific your `traits` and `examples`, the better the output. One or two concrete examples makes a significant difference.

### Add or change context modes

The four default modes are defined in the `MODES` object in `voice.ts`. Add a key, a label, and an instruction:

```ts
export const MODES: Record<Mode, { label: string; instruction: string }> = {
  email: {
    label: "Email",
    instruction: "Professional email. Warm opener where needed, clear ask, direct close.",
  },
  // Add your own here
}
```

---

## Running locally

```
git clone https://github.com/kaitwaite/Tone_Fixer
cd Tone_Fixer
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000.

---

## Stack

- **Next.js 15** (App Router)
- **Anthropic API** (`claude-sonnet-4`, streaming via fetch)
- **OpenAI Whisper** (mic transcription, optional)
- No database, no auth, no external dependencies beyond the APIs

---

## Background

Professional communication requires constant self-censorship — not because your raw reaction is wrong, but because the way it comes out of your mouth isn't how you want it landing in someone's inbox. Most people either over-edit (stripping all personality) or under-edit (sending something they regret).

This tool sits in the middle. It knows your voice, preserves the substance, and cleans up the delivery.

Done feels like: you never spend 20 minutes wordsmithing a frustrated email again. You just talk, review, send.

---

## License

MIT — fork it, adapt it, make it yours.
