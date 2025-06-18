import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
	const { password } = req.body;

	console.log(process.env.PASSWORD);

	if (password === process.env.PASSWORD) {
		res.status(200).json({ success: true });
	} else {
		res.status(401).json({ success: false });
	}
}
