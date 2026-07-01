import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "claude-code",
  title:
    "I Built a Toy Payment Processor With Claude Code — Here's What That Workflow Actually Looked Like",
  excerpt:
    "I built a toy payment processor with Claude Code to explore what AI-assisted engineering actually looks like when the design decisions stay yours. Here's how three real payment-system tradeoffs — charge outcomes, refund modeling, and idempotency — got made, and what the back-and-forth with Claude Code actually looked like in practice.",
  content: `

I've been experimenting with Claude Code for a while now. Not just using it to ship faster, but trying to understand how it actually fits into a real engineering workflow. There's a difference between using AI as a shortcut and using it as a thinking partner, and I wanted to see what the second thing actually looks like in practice.

So I built a toy payment processor. Node.js, TypeScript, Express, no database. Just enough to force three real decisions that come up constantly in actual payment systems: charges, refunds, and idempotent retries. I've spent years working around money-movement systems (payment flows at Amex, reconciliation engines at Faroe) so the domain felt right. I went in with one rule for myself: the design decisions stay mine. If I'm not making the actual calls, I'm not learning anything.

Here's what that looked like.

## The Scope, On Purpose

Before writing a single line of code I wrote a design doc and constrained it hard: in-memory storage only, no auth, no multi-currency, no webhooks. Just three operations. Money in integer cents, not floats, to kill an entire category of rounding bugs before they could start.

This mattered because the point wasn't to build something production-ready. It was to force real engineering decisions in a domain I know without a full system's complexity getting in the way. The tighter the scope, the more honest the decisions had to be.

## The Design Decisions — And What Claude Code Actually Did

For each decision I didn't just ask Claude Code to build something. I asked it to lay out the options with real tradeoffs and let me choose. Here's how each one went.

### Decision 1 — Charge Outcome

**What I was trying to solve:**
A processor that always succeeds is useless for testing failure paths — and the whole point of idempotent retries is that failures happen and the system needs to handle them. I needed a way to simulate failure without modeling every real-world cause from scratch.

**What Claude Code gave me:**
Three options. A: always succeed — simple, but you can't test retry logic at all. B: configurable random failure rate — exercises failure and retry paths, non-deterministic unless you pin the rate. C: let the caller force the outcome via the request body — fully deterministic but leaks test scaffolding into the public API.

**What I chose and why:**
B. A real payment system doesn't fail randomly — failures have specific causes, but for a toy, a configurable rate is a reasonable stand-in for "failures happen and the system needs to deal with it." A was a non-starter; you can't learn idempotency from a processor that never fails. C felt wrong immediately; the API is supposed to simulate a real system, not expose a test control knob.

Worth being upfront about what this skips: a real system would have a failure-guard layer with structured error handling around specific failure causes. The random rate simulates that failures happen, not the actual detection and recovery architecture. That's a deliberate scope cut, not an oversight.

**What it built:**
A \`simulateFailureRate\` config on the payment store, defaulting to 0.2. Set to 0 for guaranteed success, 1 for guaranteed failure.

![Charge success response showing a 201 status with "succeeded"](/blog/claude-code/charge-success.png)

![Charge failure response showing a 201 status with "failed"](/blog/claude-code/charge-failure.png)

*Worth noting: even a failed charge creates a payment record with a failed status rather than just dropping it. Intentional.*

### Decision 2 — Refund Model

**What I was trying to solve:**
How do you track refunds in a way that gives you a clear audit trail, supports per-refund idempotency, and doesn't turn the payment object into a mess of accumulated state?

**What Claude Code gave me:**
Three options. A: track refunds as fields on the Payment — minimal, but no refund history and harder to make idempotent per refund. B: separate first-class Refund entity with its own ID, synced back to the Payment — audit trail, clean per-refund idempotency. C: event-source refunds as a RefundEvent log — single source of truth, but a lot more architecture.

**What I chose and why:**
B. A separate Refund entity means each refund has its own ID tied to a specific payment — so the system always knows exactly who needs to be refunded for which transaction. A had no refund history which makes individual attempt tracking hard and, by extension, makes per-refund idempotency harder. C is the right pattern at scale but this project hadn't earned that complexity yet. B also maps to how Stripe does it: refunds as their own first-class objects, not just mutations of the original charge.

**What it built:**
Separate \`refundStore\` using a Map with \`ref_<uuid>\` IDs. Each refund syncs back to the payment updating \`refundedAmount\` and status while keeping its own independent record.

![Refund normal case response: 201, a ref_ id linked to the payment ID, amount 500](/blog/claude-code/refund-normal.png)

![Over-refund rejection response: 422, "Refund amount (1000) exceeds remaining refundable balance (599)."](/blog/claude-code/refund-over-limit.png)

### Decision 3 — Idempotency Boundary

**What I was trying to solve:**
Idempotency means the same operation produces the same result no matter how many times you send it. In payments this is critical. If a network issue causes a client to retry a charge, the system needs to recognize it's already processed that request and return the same result instead of double-charging. The question was where that logic lives in the codebase.

**What Claude Code gave me:**
Three options. A: Express middleware — handles it once for all routes, keeps handlers clean, but requires monkey-patching \`res.json()\` to capture responses for caching. B: inline check inside each handler — explicit, no patching, but repetitive and easy to miss on new routes. C: higher-order \`withIdempotency()\` wrapper — clean abstraction, testable without HTTP, but adds indirection.

**What I chose and why:**
A. Middleware means idempotency gets handled in one place and the route handlers never have to think about it. B doesn't scale. The burden grows with every new endpoint and one forgotten check breaks the whole guarantee. C made sense on paper but felt like overkill for three routes.

The tradeoff I accepted: monkey-patching \`res.json()\` to capture what each handler sends back so I can cache and replay it. Slightly awkward but it's what keeps the handlers themselves completely unaware of idempotency — which was the whole point.

**What it built:**
\`idempotencyMiddleware\` on both POST routes. Optional \`Idempotency-Key\` header. SHA-256 fingerprint of method + path + body. Same key + same fingerprint → replay cached response. Same key + different fingerprint → 422.

![Idempotency replay: same key and body sent twice, returning an identical id and createdAt both times](/blog/claude-code/idempotency-replay.png)

![Idempotency mismatch: same key with a different amount, returning a 422 "Idempotency key reused for a different request body or path."](/blog/claude-code/idempotency-mismatch.png)

## What the Back-and-Forth Actually Looked Like

Honest answer: most of the Claude Code interaction wasn't me correcting mistakes. It was me being handed real options (A, B, or C) and making the engineering call.

That's different from what most people picture with AI-assisted coding. It wasn't "Claude writes it, I fix what's broken." It was more like: Claude handled the option-generation and scaffolding, I handled the judgment. Which tradeoff fits this system? Which pattern has earned its complexity here? Which one am I going to have to live with?

The design doc did most of the heavy lifting. Once the decisions were made, the implementation was fast. Not because Claude did it all, but because good decisions upstream make the build downstream feel almost straightforward. That's not a disappointment. That's the point.

One thing I'd do differently: log the workflow as it happens. A simple notes file: what I prompted, what came back, what I changed. That would've made this writeup much richer. The design decisions were captured. The actual back-and-forth wasn't. That gap matters when you're trying to write about it honestly.

## What I'd Do Differently

**Log the workflow in real time.**
A quick \`workflow-notes.md\` alongside the code, one line per significant prompt, what came back, what I changed. By the time I was done the decisions were documented but the process wasn't. Future builds: log as you go.

**Add tests before calling it done.**
The system works; the screenshots prove it. But there are no automated tests yet. For a project specifically about idempotency and edge cases, tests aren't optional. That's the next thing this needs.

**Make out-of-scope decisions explicit from day one.**
I knew auth, persistence, and multi-currency were out. I just didn't write that down until midway through the design doc. "What we're not building and why" should be first in the doc, not added later.

## Takeaway

The thing I keep coming back to: having a solid design doc made the Claude Code workflow more useful, not less. Because I knew what I was trying to decide, and why, I could actually evaluate the options instead of just picking whatever came first. The judgment stayed mine. The scaffolding work didn't have to.

At this scale that's what using the tool well looks like. The decisions that actually matter (which tradeoff to accept, which pattern fits, which complexity hasn't been earned) are still engineering calls. Claude Code just meant I wasn't doing the surrounding work alone.
    `,
  date: "2026-07-01",
  readTime: "7 min read",
  tags: ["Claude Code", "AI-Assisted Engineering", "TypeScript", "Software Design"],
};

export default post;
