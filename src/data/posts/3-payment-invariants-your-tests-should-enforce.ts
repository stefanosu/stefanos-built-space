import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "3-payment-invariants-your-tests-should-enforce",
  title: "3 Payment Invariants Your Tests Should Enforce",
  excerpt:
    "I'm still working through how to use Claude Code on real builds without outsourcing the thinking. This week that meant writing tests for the toy payment processor — and figuring out how to make domain knowledge stick between prompts.",
  content: `

I'm still working through how to use Claude Code on real builds without outsourcing the thinking. This week that meant writing tests for the toy payment processor.

Some background: I worked on payment flows at Amex and built reconciliation systems at Faroe. So I already had a list in my head of where payment code actually breaks. Retries that double-charge. Floating point losing cents. Refunds that don't add up. The question was how to get Claude Code to write tests with that same list in mind.

What worked was putting the rules in CLAUDE.md instead of repeating them in prompts.

## The CLAUDE.md setup

At first I kept typing the same context over and over. "Amounts are integer cents." "Same idempotency key has to return the same response." If I forgot to mention one, the tests came back looking fine but missing the point.

So the rules went into the project's CLAUDE.md:

\`\`\`markdown
## Domain Rules
- All money amounts are integer cents. No floats. Decimal input = 422.
- Idempotency: same key + same body returns the identical stored
  response. Same key + different body = 422.
- Refunds: partial refunds can never sum past the original amount.
  Reject with the exact remaining balance in the error.

## Test Conventions
- supertest against the app, no mocking the HTTP layer
- every invariant gets tested in both directions: the case that
  passes and the case that rejects
\`\`\`

After that my prompts got short. "Write the idempotency tests for POST /payments" was enough.

## 1. Idempotency

Payment APIs get retried. Timeouts, client crashes, load balancers. If the same charge request runs twice you need the same response back, not a second charge.

\`\`\`typescript
it('same key + same body returns identical response', async () => {
  const idempotencyKey = 'test-key-1';
  const body = { amount: 1000 };

  const res1 = await request(app)
    .post('/payments')
    .set('Idempotency-Key', idempotencyKey)
    .send(body);

  const res2 = await request(app)
    .post('/payments')
    .set('Idempotency-Key', idempotencyKey)
    .send(body);

  expect(res2.body.id).toBe(res1.body.id);
  expect(res2.body.createdAt).toBe(res1.body.createdAt);
});
\`\`\`

Because of the "both directions" convention I also got the rejection case without asking for it:

\`\`\`typescript
it('same key + different amount returns 422', async () => {
  await request(app)
    .post('/payments')
    .set('Idempotency-Key', 'key-1')
    .send({ amount: 1000 });

  const res = await request(app)
    .post('/payments')
    .set('Idempotency-Key', 'key-1')
    .send({ amount: 2000 }); // different!

  expect(res.status).toBe(422);
});
\`\`\`

Claude did ask me a real question here: should a mismatched key return the original response, or reject? I went with reject. Same key with a different body means the client has a bug, and accepting it quietly would hide that. That decision is in CLAUDE.md now so it doesn't come up again.

## 2. Integer cents

\`0.1 + 0.2 !== 0.3\` in JavaScript. Everyone knows this and the bugs still ship. Amounts in this system are integer cents, anything else fails validation.

\`\`\`typescript
it('rejects decimal amounts', async () => {
  const res = await request(app)
    .post('/payments')
    .send({ amount: 10.99 }); // dollars, not cents

  expect(res.status).toBe(422);
  expect(res.body.error).toContain('integer');
});

it('accepts integer cents', async () => {
  const res = await request(app)
    .post('/payments')
    .send({ amount: 1099 }); // $10.99 as cents

  expect(res.status).toBe(201);
});
\`\`\`

One gap I caught: Claude covered decimals and negatives but not zero or \`MAX_SAFE_INTEGER + 1\`. I prompted for those, then added "always test numeric boundaries" to the conventions. That's been the pattern with this whole setup. When I catch a gap, it becomes a rule in the file, and I don't catch it twice.

## 3. Refund arithmetic

Partial refunds are where money goes missing. 333 + 333 + 334 has to equal 1000, not 999. And after refunding 600 of a 1000 payment, a 500 refund has to bounce because only 400 is left.

At Faroe I built systems that caught these mismatches after the fact, during reconciliation. Way cheaper to make them impossible up front.

\`\`\`typescript
it('multiple partial refunds sum correctly', async () => {
  const payment = createPayment(1000, 'succeeded');

  await request(app).post(\`/payments/\${payment.id}/refund\`).send({ amount: 333 });
  await request(app).post(\`/payments/\${payment.id}/refund\`).send({ amount: 333 });
  await request(app).post(\`/payments/\${payment.id}/refund\`).send({ amount: 334 });

  const check = await request(app).get(\`/payments/\${payment.id}\`);
  expect(check.body.refundedAmount).toBe(1000);
  expect(check.body.status).toBe('refunded');
});

it('rejects refund exceeding remaining balance', async () => {
  const payment = createPayment(1000, 'succeeded');
  await request(app).post(\`/payments/\${payment.id}/refund\`).send({ amount: 600 });

  const res = await request(app)
    .post(\`/payments/\${payment.id}/refund\`)
    .send({ amount: 500 }); // only 400 remaining

  expect(res.status).toBe(422);
  expect(res.body.error).toContain('400'); // exact remaining balance
});
\`\`\`

Claude's first version of that error just said "refund exceeds balance." I had it include the exact remaining amount instead. I've spent enough time debugging payment issues to know an error message without a number in it just means another round trip to the logs.

## Takeaways

The tests are useful but the workflow is what I actually learned this week. Domain knowledge belongs in CLAUDE.md, not in prompts I have to remember to repeat. Conventions like "test both directions" quietly fix a whole category of lazy test suites. And the judgment calls, like reject vs. return on a key mismatch, were still mine to make. Claude Code didn't know that a mismatched idempotency key means a client-side bug. I knew that from doing this work for years. The tool just made it fast to turn that into tests.

`,
  date: "2026-07-08",
  readTime: "5 min read",
  tags: ["Claude Code", "Testing", "Payments", "TypeScript"],
};

export default post;
