// Importar librerías necesarias
const vision = require('@google-cloud/vision');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

// Crear cliente Google Vision con credenciales JSON
const client = new vision.ImageAnnotatorClient({
  keyFilename: './credentials.json', // Ruta al archivo JSON con credenciales
});

// Configurar conexión a MongoDB Atlas (reemplaza con tu URI)
const uri = 'mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/test?retryWrites=true&w=majority';
const clientDB = new MongoClient(uri);

async function connectDB() {
  try {
    await clientDB.connect();
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err);
  }
}
connectDB();

// Inicializar servidor Express
const app = express();
app.use(cors());

// Configurar multer para subir imágenes a carpeta 'uploads/'
const upload = multer({ dest: 'uploads/' });

// Función para parsear texto extraído por OCR y obtener datos
function parseText(text) {
  const lines = text.split('\n');
  const data = [];

  lines.forEach(line => {
    // Ejemplo básico: extraer nombre y cantidad/pan de líneas simples
    // Ajustar según el formato esperado de tus imágenes
    const match = line.match(/(\D+)\s+(\d+)\s*pan/i);
    if (match) {
      data.push({ nombre: match[1].trim(), cantidad: parseInt(match[2], 10), producto: 'pan' });
    }
  });

  return data;
}

// Función para guardar datos parseados en MongoDB
async function saveParsedData(data) {
  try {
    const db = clientDB.db('facturaOCR'); // Nombre DB
    const collection = db.collection('ventas'); // Nombre colección
    await collection.insertOne({ fecha: new Date(), data });
    console.log('Datos guardados en la base');
  } catch (err) {
    console.error('Error guardando en la base:', err);
  }
}

// Ruta POST para subir imagen y procesar OCR
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    // Usar Google Vision para extraer texto
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';

    // Parsear texto para obtener datos estructurados
    const data = parseText(text);

    // Guardar datos en MongoDB
    await saveParsedData(data);

    // Responder con texto y datos
    res.json({ text, data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Puerto donde corre el servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
