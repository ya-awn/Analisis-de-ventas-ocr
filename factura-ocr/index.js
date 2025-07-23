const vision = require('@google-cloud/vision');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

// URI de conexión a MongoDB Atlas con usuario y contraseña (reemplaza TU_CONTRASEÑA)
const uri = 'mongodb+srv://mezakenyi:Cjjd9Jdu8KahWQoV@cluster0.co16hji.mongodb.net/facturaOCR?retryWrites=true&w=majority&appName=Cluster0';

// Crear cliente MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Conectar a MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error);
  }
}
connectDB();

// Crear cliente Google Vision con credenciales JSON
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: './credentials.json',
});

const app = express();
app.use(cors());

// Configuración de multer para subir imágenes a carpeta uploads
const upload = multer({ dest: 'uploads/' });

// Ruta POST para subir la imagen y extraer texto con Google Vision
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    // Llamar a Google Vision para detectar texto en la imagen
    const [result] = await visionClient.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';

    // Guardar texto extraído en MongoDB
    const collection = client.db('facturaOCR').collection('facturas');
    await collection.insertOne({ textoExtraido: text, fecha: new Date() });

    // Devolver texto extraído en respuesta JSON
    res.json({ text });
  } catch (error) {
    console.error('Error en OCR o MongoDB:', error);
    res.status(500).send(error.message);
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
