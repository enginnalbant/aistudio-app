import express from 'express';
const app = express();
const PORT = 3000;
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('*', (req, res) => res.send('<h1>Server is running</h1>'));
app.listen(PORT, '0.0.0.0', () => console.log(`Test server running on port ${PORT}`));
