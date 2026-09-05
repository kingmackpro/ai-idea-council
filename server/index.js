const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory config (could be persisted to file)
let config = {
  baseUrl: process.env.BASE_URL || '',
  apiKey: process.env.API_KEY || '',
  model: process.env.MODEL || ''
};

app.use(cors());
app.use(express.json());

// Get current config (without exposing full API key)
app.get('/api/config', (req, res) => {
  res.json({
    baseUrl: config.baseUrl,
    hasApiKey: !!config.apiKey,
    model: config.model
  });
});

// Update config
app.post('/api/config', (req, res) => {
  const { baseUrl, apiKey, model } = req.body;
  if (baseUrl !== undefined) config.baseUrl = baseUrl;
  if (apiKey !== undefined) config.apiKey = apiKey;
  if (model !== undefined) config.model = model;
  res.json({ success: true, config: {
    baseUrl: config.baseUrl,
    hasApiKey: !!config.apiKey,
    model: config.model
  }});
});

// Proxy for model listing
app.get('/api/models', async (req, res) => {
  if (!config.baseUrl) {
    return res.status(400).json({ error: 'Base URL not configured' });
  }
  try {
    const configAxios = {
      headers: {}
    };
    if (config.apiKey) {
      configAxios.headers.Authorization = `Bearer ${config.apiKey}`;
    }
    const response = await axios.get(`${config.baseUrl}/models`, configAxios);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ error: 'Failed to fetch models', details: error.message });
  }
});

// Proxy for chat completions
app.post('/api/chat/completions', async (req, res) => {
  if (!config.baseUrl) {
    return res.status(400).json({ error: 'Base URL not configured' });
  }
  if (!config.model) {
    return res.status(400).json({ error: 'Model not configured' });
  }
  try {
    const configAxios = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (config.apiKey) {
      configAxios.headers.Authorization = `Bearer ${config.apiKey}`;
    }
    // Forward the request body, but override model if needed
    const forwardData = { ...req.body, model: config.model };
    const response = await axios.post(`${config.baseUrl}/chat/completions`, forwardData, configAxios);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling chat completions:', error.message);
    res.status(500).json({ error: 'Failed to call chat completions', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Idea Council API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});