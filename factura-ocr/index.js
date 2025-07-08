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

// Función para preprocesar imagen (grayscale + normalize)
async function preprocessImage(inputPath, outputPath) {
  await sharp(inputPath)
    .grayscale()
    .normalize()
    .toFile(outputPath);
}

// Función para parsear texto OCR y extraer datos simples (ejemplo)
function parseText(text) {
  const lines = text.split('\n');
  const data = [];

  lines.forEach(line => {
    const match = line.match(/(\d+)\s+(\w+)\s+(\d+(\.\d+)?)/);
    if (match) {
      data.push({
        cantidad: parseInt(match[1]),
        producto: match[2],
        precio: parseFloat(match[3])
      });
    }
  });

  return data;
}

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
