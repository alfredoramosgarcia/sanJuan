import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// 1. /api/check-password — comprueba la contraseña
app.post('/api/check-password', (req, res) => {
	const { password } = req.body;
	if (password === process.env.PASSWORD) {
		res.status(200).json({ success: true });
	} else {
		res.status(401).json({ success: false });
	}
});

// 2. /api/get-target-date — devuelve la fecha objetivo
app.get('/api/get-target-date', (req, res) => {
	const date = process.env.TARGET_DATE;
	if (date) {
		res.status(200).json({ date });
	} else {
		res.status(500).json({ error: 'TARGET_DATE no definida' });
	}
});

// 3. /api/tracklist — devuelve la lista de canciones
app.get('/api/tracklist', (req, res) => {
	const filePath = path.join(__dirname, '../data/tracklist.json');
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error leyendo tracklist:', err);
			return res.status(500).json({ error: 'No se pudo leer el tracklist' });
		}
		res.status(200).json(JSON.parse(data));
	});
});

// Inyectar API_KEY en index.html
app.get('/', (req, res) => {
	const htmlPath = path.join(__dirname, '../public/index.html');
	fs.readFile(htmlPath, 'utf8', (err, html) => {
		if (err) return res.status(500).send('Error cargando index.html');
		const htmlWithKey = html.replace(
			'</head>',
			`<script>window.API_KEY="${process.env.API_KEY}"</script></head>`
		);
		res.send(htmlWithKey);
	});
});

app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
