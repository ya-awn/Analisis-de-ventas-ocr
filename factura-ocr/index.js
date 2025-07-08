const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  Tesseract.recognize(
    path.resolve(req.file.path),
    'spa',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    res.json({ text });
  }).catch(err => {
    res.status(500).send(err.message);
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

