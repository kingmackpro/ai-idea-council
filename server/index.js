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

// SSE listeners
const sseListeners = new Set();

// In-memory session storage
const sessions = [];

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

// Test endpoint to verify backend is reachable
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working', timestamp: new Date().toISOString() });
});

// SSE endpoint for events
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send a comment to keep connection alive
  const sendHeartbeat = () => {
    res.write(':heartbeat\\n\\n');
  };
  const interval = setInterval(sendHeartbeat, 15000);

  // Store response object to send events later
  sseListeners.add(res);

  req.on('close', () => {
    clearInterval(interval);
    sseListeners.delete(res);
    res.end();
  });
});

// Helper to broadcast event to all SSE clients
function broadcastEvent(event) {
  const data = `data: ${JSON.stringify(event)}\\n\\n`;
  sseListeners.forEach(res => {
    if (!res.finished) {
      res.write(data);
    }
  });
}

// Mock orchestration endpoint (for council room)
app.post('/api/orchestrate', async (req, res) => {
  const { idea } = req.body;
  // Simulate agent responses with timed events
  const events = [];
  const agentStates = [
    { agent: 'believer', state: 'analyzing' },
    { agent: 'skeptic', state: 'analyzing' },
    { agent: 'investor', state: 'analyzing' },
    { agent: 'judge', state: 'deliberating' }
  ];
  agentStates.forEach((s, i) => {
    events.push({
      type: 'agent_state',
      agent: s.agent,
      state: s.state,
      timestamp: Date.now() + i * 500
    });
  });
  // Messages
  events.push(
    { type: 'agent_message', agent: 'believer', summary: `The idea "${idea}" has strong potential due to ...`, timestamp: Date.now() + 500 },
    { type: 'agent_message', agent: 'skeptic', summary: `However, there are risks such as ...`, timestamp: Date.now() + 1000 },
    { type: 'agent_message', agent: 'investor', summary: `From a market perspective, ...`, timestamp: Date.now() + 1500 },
    { type: 'agent_message', agent: 'judge', summary: `Overall, the idea is promising but needs work.`, timestamp: Date.now() + 2000 }
  );
  // Verdict
  events.push({
    type: 'verdict',
    verdict: 'BUILD_WITH_CHANGES',
    score: 78,
    summary: `Overall, the idea is promising but needs work.`,
    timestamp: Date.now() + 2500
  });

  // Send events with slight delay to simulate streaming
  events.forEach((ev, idx) => {
    setTimeout(() => {
      broadcastEvent(ev);
    }, ev.timestamp);
  });

  // Also return immediately for polling fallback
  res.json({ events });

  // Save session after a delay
  setTimeout(() => {
    const session = {
      id: Date.now(),
      idea,
      timestamp: new Date().toISOString(),
      events,
      verdict: 'BUILD_WITH_CHANGES',
      score: 78
    };
    sessions.push(session);
    // Keep only last 10 sessions
    if (sessions.length > 10) sessions.shift();
  }, 3000);
});

// Get sessions
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Idea Council API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});