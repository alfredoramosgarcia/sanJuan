import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
	const date = process.env.TARGET_DATE;
	if (date) {
		res.status(200).json({ date });
	} else {
		res.status(500).json({ error: 'TARGET_DATE no definida' });
	}
}
