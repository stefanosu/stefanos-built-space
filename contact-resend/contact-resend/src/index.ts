// --- CORS helpers ------------------------------------------------------------
const ALLOWED_ORIGINS = [
	"https://stefanosugbit.com",
	"https://www.stefanosugbit.com",
	"http://localhost:5173", // dev, remove later
];

const corsHeaders = (origin: string | null) => {
	const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
	return {
		"Access-Control-Allow-Origin": allow,
		Vary: "Origin",
		"Access-Control-Allow-Methods": "POST,OPTIONS",
		"Access-Control-Allow-Headers": "content-type",
		"Access-Control-Max-Age": "86400",
	};
};
// -----------------------------------------------------------------------------
type ContactRequest = {
	name: string;
	email: string;
	message: string;
	turnstileToken: string;
};

const isContactRequest = (value: unknown): value is ContactRequest => {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const record = value as Record<string, unknown>;

	return (
		typeof record.name === 'string' &&
		typeof record.email === 'string' &&
		typeof record.message === 'string' &&
		typeof record.turnstileToken === 'string'
	);
};

type WorkerEnv = {
	TURNSTILE_SECRET_KEY: string;
	RESEND_API_KEY: string;
};

type TurnstileVerification = {
	success: boolean;
	'error-codes'?: string[];
};

const isTurnstileVerification = (value: unknown): value is TurnstileVerification => {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const record = value as Record<string, unknown>;
	return typeof record.success === 'boolean';
};

const withCors = (origin: string | null, response: ResponseInit & { body?: BodyInit | null } | Response) => {
	if (response instanceof Response) {
		const headers = new Headers(response.headers);
		Object.entries(corsHeaders(origin)).forEach(([key, value]) => headers.set(key, value));
		return new Response(response.body, { ...response, headers });
	}

	return {
		...response,
		headers: {
			...(response.headers ?? {}),
			...corsHeaders(origin),
		},
	};
};

export default {
	async fetch(request: Request, env: WorkerEnv): Promise<Response> {
		const origin = request.headers.get('Origin');

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders(origin) });
		}

		if (request.method !== 'POST') {
			return new Response('Only POST allowed', withCors(origin, { status: 405 }));
		}

		let data: unknown;
		try {
			data = await request.json();
		} catch {
			return new Response('Invalid JSON', withCors(origin, { status: 400 }));
		}

		if (!isContactRequest(data)) {
			return new Response('Missing fields', withCors(origin, { status: 400 }));
		}

		const { name, email, message, turnstileToken } = data;

		// ✅ Verify Turnstile CAPTCHA
		const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: new URLSearchParams({
				secret: env.TURNSTILE_SECRET_KEY,
				response: turnstileToken,
			}),
		});

		const verificationData = await verifyResponse.json();
		if (!isTurnstileVerification(verificationData) || !verificationData.success) {
			return new Response(
				JSON.stringify({ error: 'Captcha failed' }),
				withCors(origin, {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}),
			);
		}

		// ✅ Send Email With Resend
		const emailRes = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: 'Stefanos Portfolio <hello@stefanosugbit.com>',
				to: 'stefanos.ugbit@gmail.com',
				reply_to: email,
				subject: `Message from ${name}`,
				html: `
			<p><strong>Name:</strong> ${name}</p>
			<p><strong>Email:</strong> ${email}</p>
			<p><strong>Message:</strong></p>
			<p>${message.replace(/\n/g, '<br/>')}</p>
		  `,
			}),
		});

		if (!emailRes.ok) {
			const err = await emailRes.text();
			return new Response(
				JSON.stringify({ error: err }),
				withCors(origin, {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}),
			);
		}

		return new Response(
			JSON.stringify({ success: true }),
			withCors(origin, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
	},
};
