import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!image) return alert('Selecciona una imagen');

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    const res = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setText(data.text);
    setLoading(false);
  };

  return (
    <div>
      <h1>OCR Facturas</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*,application/pdf" onChange={e => setImage(e.target.files[0])} />
        <button type="submit" disabled={loading}>Procesar</button>
      </form>
      {loading && <p>Procesando...</p>}
      <pre>{text}</pre>
    </div>
  );
}

export default App;
