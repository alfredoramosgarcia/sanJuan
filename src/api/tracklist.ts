import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== process.env.API_KEY) {
		return res.status(403).json({ error: 'Acceso denegado. API key inválida.' });
	}

	const filePath = path.join(process.cwd(), 'data', 'tracklist.json');
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) return res.status(500).json({ error: 'Error al leer tracklist' });
		res.status(200).json(JSON.parse(data));
	});
}
