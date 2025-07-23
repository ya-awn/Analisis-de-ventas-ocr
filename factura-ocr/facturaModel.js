const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
  texto: String,
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Factura', facturaSchema);
