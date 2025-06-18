import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
