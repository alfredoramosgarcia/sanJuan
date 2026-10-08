import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

app.use(express.json());
app.use(express.static(path.join(rootDir, 'public')));

app.post('/api/check-password', (req, res) => {
	const { password } = req.body ?? {};
	if (password === process.env.PASSWORD) {
		res.status(200).json({ success: true });
		return;
	}
	res.status(401).json({ success: false });
});

app.get('/api/get-target-date', (_req, res) => {
	const date = process.env.TARGET_DATE;
	if (date) {
		res.status(200).json({ date });
		return;
	}
	res.status(500).json({ error: 'TARGET_DATE no definida' });
});

app.get('/api/tracklist', (_req, res) => {
	const filePath = path.join(rootDir, 'data', 'tracklist.json');
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo tracklist:', err);
			res.status(500).json({ error: 'No se pudo leer el tracklist' });
			return;
		}

		try {
			res.status(200).json(JSON.parse(data));
		} catch (parseError) {
			console.error('Tracklist inválido:', parseError);
			res.status(500).json({ error: 'El tracklist no contiene JSON válido' });
		}
	});
});


app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
