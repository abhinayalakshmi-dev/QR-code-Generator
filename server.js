import express from 'express';
import qr from 'qr-image';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to generate QR codes
app.post('/api/generate', (req, res) => {
  const { url, size = 10, margin = 2, ecLevel = 'M', format = 'png' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const parsedSize = parseInt(size) || 10;
  const parsedMargin = parseInt(margin) !== undefined ? parseInt(margin) : 2;

  try {
    if (format === 'svg') {
      // Generate SVG buffer with parsed integer margin
      const qrSvg = qr.imageSync(url, { type: 'svg', margin: parsedMargin, ec_level: ecLevel });
      
      return res.json({
        format: 'svg',
        data: qrSvg.toString('utf-8')
      });
    } else {
      // Generate PNG buffer with parsed integer size and margin
      const qrPng = qr.imageSync(url, { type: 'png', size: parsedSize, margin: parsedMargin, ec_level: ecLevel });
      const base64 = qrPng.toString('base64');
      
      return res.json({
        format: 'png',
        data: `data:image/png;base64,${base64}`
      });
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Start the server
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🚀 Server running at ${url}`);
  
  // Automatically open the browser
  const startCommand = process.platform === 'win32' ? `start ${url}` : 
                       process.platform === 'darwin' ? `open ${url}` : 
                       `xdg-open ${url}`;
  
  exec(startCommand, (err) => {
    if (err) {
      console.log('Note: Could not open browser automatically. Please open http://localhost:3000 manually.');
    }
  });
});
