const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/generate', async (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(400).send('Please provide a valid link!');
    }

    try {
        // Generate QR code in SVG format
        const svg = await QRCode.toString(link, { type: 'svg' });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        res.status(500).send('Error generating QR code.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
