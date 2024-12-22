const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Define the serverless function to handle requests
module.exports = async (req, res) => {
  // Get the Origin of the request
  const origin = req.headers.origin;

  // Allow only requests from www.pilotfront.com
  const allowedOrigin = 'https://www.pilotfront.com';

  // Prepare the log data
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    origin: origin,
    url: req.url,
  };

  // Log each incoming request (for debugging)
  logRequest(logData);

  if (origin === allowedOrigin) {
    // Enable CORS (Cross-Origin Resource Sharing) only for the allowed origin
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    // If the origin is not allowed, reject the request with a 403 status
    logData.status = 403;
    logData.message = 'Forbidden: Invalid Origin';
    logRequest(logData);
    return res.status(403).json({ error: 'Forbidden: Invalid Origin' });
  }

  // Enable allowed methods and headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    logData.status = 200;
    logData.message = 'CORS preflight request handled';
    logRequest(logData);
    return res.status(200).end();
  }

  // Get the `link` query parameter from the request
  const { link } = req.query;

  if (!link) {
    logData.status = 400;
    logData.message = 'Missing "link" parameter';
    logRequest(logData);
    return res.status(400).json({ error: 'Missing "link" parameter' });
  }

  try {
    // Generate the QR code in SVG format
    const qrCodeSvg = await QRCode.toString(link, { type: 'svg' });

    // Set response headers to return SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(qrCodeSvg);

    // Log successful request
    logData.status = 200;
    logData.message = 'QR code generated successfully';
    logRequest(logData);
  } catch (error) {
    console.error('Error generating QR code:', error);

    logData.status = 500;
    logData.message = 'Failed to generate QR code';
    logRequest(logData);

    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Function to log data into log.json file
function logRequest(logData) {
  const logFilePath = path.join(__dirname, 'log.json');
  
  // Read existing logs, append new log, and save back to the file
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    let logs = [];
    if (!err && data) {
      logs = JSON.parse(data);  // Parse existing log data if file exists
    }
    
    // Append new log entry
    logs.push(logData);
    
    // Write logs back to the file
    fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        console.error('Error writing log to file', err);
      }
    });
  });
}
