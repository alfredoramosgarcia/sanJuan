import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Verificación de contraseña sin tipos explícitos
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
