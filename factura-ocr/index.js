const vision = require('@google-cloud/vision');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Crear cliente Google Vision con credenciales JSON
const client = new vision.ImageAnnotatorClient({
  keyFilename: './credentials.json',
});

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Ruta para subir imagen y obtener texto con Google Vision
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';
    res.json({ text });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
