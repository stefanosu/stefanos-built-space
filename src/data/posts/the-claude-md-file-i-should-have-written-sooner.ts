import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "the-claude-md-file-i-should-have-written-sooner",
  title: "The CLAUDE.md File I Should Have Written Sooner",
  excerpt:
    "I didn't have a CLAUDE.md for the payment processor project until today. It's maybe 15 minutes to write, and it's worth it — here's why, and here's exactly what mine looks like.",
  content: `
I actually didn't have a CLAUDE.md for the payment processor project that I was building until today. I just made mine this afternoon, and I should've done it much sooner because the CLAUDE.md file is the source of truth needed to make things more efficient as you build out a project — I usually have one in my other projects. I forgot it I think in part because of how simple this project is, but even in this case it's needed.

Anthropic's own docs describe it as a plain markdown file that you drop in your project root that Claude Code reads automatically at the start of every session — no pasting it in, no reminding it's there. It becomes part of the context the model already has before you type a single thing: your build/test commands, coding conventions, architecture calls you've already made, stuff to avoid. Basically the onboarding doc you can always refer to, which saves you time and cost because you're not re-explaining the same context in every conversation — that repeated back-and-forth adds up to more tokens over time than one persistent file would.

Without using it, every session starts from zero. I was re-explaining the same conventions, and watching the decisions I'd already made get quietly reopened, not because the model reasons badly, it just has no memory of last time unless you give it one.

## What mine looks like

Here's the CLAUDE.md I wrote for the toy payment processor:

\`\`\`markdown
# CLAUDE.md — Toy Payment Processor

## What this is
A minimal Express/TypeScript payment processor: charge, refund, and idempotent
retry handling. In-memory storage only. No DB, no auth, no multi-currency.
Built to explore fintech-style edge cases in a small, readable codebase.

## Stack & conventions
- Express 5, TypeScript strict mode, CommonJS
- ts-node-dev for local dev
- Amounts are always integer cents (1099 = $10.99) — never floats. This is
  non-negotiable even in a toy; it's the #1 source of real fintech bugs.
- IDs are prefixed by type: pay_<uuid>, ref_<uuid>.

## File layout
src/
  index.ts                  Express app setup, route mounting, config
  routes/payments.ts         POST /payments, POST /payments/:id/refund
  handlers/charge.ts         charge business logic
  handlers/refund.ts         refund business logic
  store/paymentStore.ts      Map<string, Payment> + failure-rate config
  store/refundStore.ts       Map<string, Refund>
  store/idempotencyStore.ts  Map<string, IdempotencyRecord>
  models/                    Payment, Refund, IdempotencyRecord types
  middleware/idempotency.ts  key check → short-circuit or next()
  errors/AppError.ts         class AppError extends Error { status }

## Confirmed design decisions (don't re-litigate these)
| Area | Decision | Why |
|---|---|---|
| Charge | Configurable random failure rate (simulateFailureRate) | Lets tests exercise failure paths, not just the happy path |
| Refund | First-class Refund entity, separate store | Audit trail; matches how real processors (Stripe) model it |
| Idempotency | Express middleware, monkey-patches res.json() | Keeps route handlers free of infra concerns |

## Edge cases this codebase must always handle correctly
- Refunding a payment that failed, doesn't exist, or is already fully refunded → 422/404, never silently succeed
- Partial refund exceeding remaining balance → reject, never clamp
- Idempotency key reused with a different request body → 422, don't replay
- amount <= 0 or non-integer → reject at the boundary, on both charge and refund

## When adding a new endpoint or handler
1. Write the edge cases down before writing the handler.
2. Validate at the boundary (route/middleware), keep handlers focused on the happy-path business logic.
3. Any new stateful entity gets its own store file under store/, mirroring the existing pattern — don't bolt extra fields onto Payment.
4. Throw AppError(status, message); don't handle HTTP status codes inline in handlers.

## Explicitly out of scope
No auth, no real currency handling, no persistence layer, no webhooks. If a
request seems to need one of these, flag it — don't quietly add scope.
\`\`\`

## What's actually in there

A few things worth calling out:

* **Amounts are cents, integers, never floats** — learned this the hard way once, not doing it again. It's in the file so every session starts knowing this.
* **The file layout** — so new code has an obvious home instead of getting bolted onto whatever's open.
* **A table of decisions already made** — refunds are their own entity, not a field tacked onto Payment — so that doesn't get re-litigated every session.
* **The specific edge cases that always have to hold** — can't refund something that already failed, can't reuse an idempotency key with a different body.
* **What's explicitly not in scope** — so it doesn't creep in on its own.

None of this makes the model smarter. It just means I stop paying the same tax every session, and the calls I already made stay made.

If you're deep into a Claude Code project without one of these, it's maybe 15 minutes to write. It's worth it as you build out your project.
  `,
  date: "2026-07-15",
  readTime: "4 min read",
  tags: ["Claude Code", "AI-Assisted Engineering", "Workflow"],
};

export default post;
