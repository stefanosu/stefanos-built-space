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

export default {
	async fetch(request: Request, env: WorkerEnv): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Only POST allowed', { status: 405 });
		}

		let data: unknown;
		try {
			data = await request.json();
		} catch {
			return new Response('Invalid JSON', { status: 400 });
		}

		if (!isContactRequest(data)) {
			return new Response('Missing fields', { status: 400 });
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
			return new Response(JSON.stringify({ error: 'Captcha failed' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
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
			return new Response(JSON.stringify({ error: err }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
