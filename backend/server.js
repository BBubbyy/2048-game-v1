import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const NILLION_API_TOKEN = process.env.NILLION_API_TOKEN;
const API_ENDPOINT = "https://nildb-demo.nillion.network/api/v1/data/create";

// API endpoint for saving scores
app.post('/api/scores', async (req, res) => {
    try {
        const { playerName, score } = req.body;

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${NILLION_API_TOKEN}`
            },
            body: JSON.stringify({
                schema: "57cb1...", // Replace with your schema ID
                data: [{
                    playerName,
                    highscore: score,
                    timestamp: new Date().toISOString()
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 