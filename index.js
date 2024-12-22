const QRCode = require('qrcode');

// Define the serverless function to handle requests
module.exports = async (req, res) => {
  // Get the Origin of the request
  const origin = req.headers.origin;

  // Allow only requests from www.pilotfront.com
  const allowedOrigin = 'https://www.pilotfront.com';

  if (origin === allowedOrigin) {
    // Enable CORS (Cross-Origin Resource Sharing) only for the allowed origin
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    // If the origin is not allowed, reject the request with a 403 status
    return res.status(403).json({ error: 'Forbidden: Invalid Origin' });
  }

  // Enable allowed methods and headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the `link` query parameter from the request
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: 'Missing "link" parameter' });
  }

  try {
    // Generate the QR code in SVG format
    const qrCodeSvg = await QRCode.toString(link, { type: 'svg' });

    // Set response headers to return SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(qrCodeSvg);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};
