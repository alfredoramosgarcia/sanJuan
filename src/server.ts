import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware para validar API key en rutas privadas del backend
function validateApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
	const apiKey = req.headers['x-api-key'];
	if (apiKey === process.env.API_KEY) {
		next();
	} else {
		res.status(403).json({ error: 'Acceso denegado. API key inválida.' });
	}
}

// Rutas protegidas
app.post('/check-password', (req, res) => {
	const { password } = req.body;
	if (password === process.env.PASSWORD) {
		res.status(200).json({ success: true });
	} else {
		res.status(401).json({ success: false });
	}
});

app.get('/get-target-date', (req, res) => {
	const date = process.env.TARGET_DATE;
	if (date) {
		res.json({ date });
	} else {
		res.status(500).json({ error: 'TARGET_DATE no definida en .env' });
	}
});

app.get('/tracklist', (req, res) => {
	const filePath = path.join(__dirname, '../data/tracklist.json');
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) return res.status(500).json({ error: 'No se pudo leer el tracklist' });
		res.json(JSON.parse(data));
	});
});

// Servir el HTML (sin inyectar variables en el frontend)
app.get('/', (req, res) => {
	const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
	fs.readFile(htmlPath, 'utf8', (err, html) => {
		if (err) return res.status(500).send('Error cargando HTML');
		res.send(html);
	});
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Arrancar servidor
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
