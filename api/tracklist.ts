import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
	const filePath = path.join(process.cwd(), 'data', 'tracklist.json');
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) return res.status(500).json({ error: 'No se pudo leer el tracklist' });
		res.status(200).json(JSON.parse(data));
	});
}
