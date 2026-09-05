import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [step, setStep] = useState('connection'); // connection or council
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState([]);
  const [fetchStatus, setFetchStatus] = useState('idle');
  const [testStatus, setTestStatus] = useState('idle');
  const [idea, setIdea] = useState('');
  const [councilResult, setCouncilResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [agentStates, setAgentStates] = useState({
    believer: 'idle',
    skeptic: 'idle',
    investor: 'idle',
    judge: 'idle'
  });
  const [verdict, setVerdict] = useState(null);
  const [score, setScore] = useState(null);
  const [eventSource, setEventSource] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Load saved config from backend on startup
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const resp = await fetch('/api/config');
        const data = await resp.json();
        if (data.baseUrl) setBaseUrl(data.baseUrl);
        if (data.model) setModel(data.model);
      } catch (e) {
        console.warn('Could not load config:', e);
      }
    };
    loadConfig();
  }, []);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('councilSessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse sessions from localStorage', e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('councilSessions', JSON.stringify(sessions));
  }, [sessions]);

  const saveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey, model })
      });
      alert('Connection saved!');
    } catch (err) {
      console.error('Failed to save config:', err);
      alert('Save failed');
    }
  };

  const fetchModels = async () => {
    setFetchStatus('loading');
    try {
      const resp = await fetch('/api/models');
      const data = await resp.json();
      setModels(data.data || data);
      setFetchStatus('success');
    } catch (err) {
      setFetchStatus('error');
      console.error('Failed to fetch models:', err);
    }
  };

  const testConnection = async () => {
    setTestStatus('loading');
    try {
      const resp = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });
      if (resp.ok) {
        setTestStatus('success');
        alert('Connection successful!');
      } else {
        const errorData = await resp.json();
        setTestStatus('error');
        alert('Connection failed: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      setTestStatus('error');
      console.error('Connection test error:', err);
      alert('Connection test error');
    }
  };

  const startCouncil = async () => {
    setLoading(true);
    setStep('council');
    setEvents([]);
    setAgentStates({
      believer: 'idle',
      skeptic: 'idle',
      investor: 'idle',
      judge: 'idle'
    });
    setVerdict(null);
    setScore(null);
    // Close any existing event source
    if (eventSource) {
      eventSource.close();
    }
    const es = new EventSource('/api/events');
    setEventSource(es);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
      // Update agent states
      if (data.type === 'agent_state') {
        setAgentStates(prev => ({
          ...prev,
          [data.agent]: data.state
        }));
      }
      // Update verdict and score
      if (data.type === 'verdict') {
        setVerdict(data.verdict);
        setScore(data.score);
      }
    };
    es.onerror = (err) => {
      console.error('SSE error', err);
      es.close();
    };
    try {
      const resp = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });
      const data = await resp.json();
      setCouncilResult(data);
    } catch (err) {
      console.error('Orchestration failed:', err);
      alert('Failed to start council');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('connection');
    setCouncilResult(null);
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  const rerun = () => {
    // Restart with same idea
    startCouncil();
  };

  const saveSession = () => {
    // Find latest session from backend? We'll just add current to local sessions
    const newSession = {
      id: Date.now(),
      idea,
      timestamp: new Date().toISOString(),
      events,
      verdict,
      score
    };
    setSessions(prev => {
      const updated = [newSession, ...prev];
      return updated.slice(0, 10); // keep last 10
    });
    alert('Session saved!');
  };

  if (step === 'connection') {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>CONNECT YOUR AI</h1>
        <p>Use any OpenAI-compatible endpoint. An API key is optional.</p>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Base URL:{' '}
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>
            API Key (optional):{' '}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave blank if not required"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={saveConfig}
            style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
          >
            Save Connection
          </button>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={fetchModels}
            disabled={fetchStatus === 'loading'}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            {fetchStatus === 'loading' ? 'FETCHING...' : '↓ FETCH MODELS'}
          </button>
          {fetchStatus === 'success' && (
            <p style={{ color: 'green', marginLeft: '1rem' }}>{models.length} MODELS FOUND</p>
          )}
          {fetchStatus === 'error' && (
            <p style={{ color: 'red', marginLeft: '1rem' }}>⚠ FETCH FAILED</p>
          )}
        </div>
        
        {(models.length > 0) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              MODEL:{' '}
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">Select a model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {model && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={testConnection}
              disabled={testStatus === 'loading'}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              {testStatus === 'loading' ? 'TESTING...' : '[ TEST CONNECTION ]'}
            </button>
            {testStatus === 'success' && (
              <span style={{ color: 'green', marginLeft: '1rem' }}>✓ Connection successful</span>
            )}
            {testStatus === 'error' && (
              <span style={{ color: 'red', marginLeft: '1rem' }}>✗ Connection failed</span>
            )}
          </div>
        )}
        
        {model && testStatus === 'success' && (
          <div style={{ marginTop: '2rem' }}>
            <label>
              WHAT'S YOUR IDEA?{' '}
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your crazy project..."
                style={{ width: '100%', height: '100px', padding: '0.5rem' }}
              />
            </label>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={startCouncil}
                disabled={loading || !idea.trim()}
                style={{ flex: 1, padding: '0.75rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {loading ? 'STARTING...' : '[ ⚡ START COUNCIL ]'}
              </button>
              <button
                onClick={() => localStorage.removeItem('councilSessions')}
                style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                title="Clear saved sessions"
              >
                Clear Sessions
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Council room view
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', display: 'flex', gap: '2rem' }}>
      {/* Left: Visual room */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>AI COUNCIL ROOM</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: agentStates.believer === 'analyzing' ? '#4CAF50' : 
                         agentStates.believer === 'speaking' ? '#8BC34A' : '#c8e6c9', 
              borderRadius: '50%', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>��</div>
            <div>Believer</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: agentStates.skeptic === 'analyzing' ? '#f44336' : 
                         agentStates.skeptic === 'speaking' ? '#e57373' : '#ffcdd2', 
              borderRadius: '50%', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>��</div>
            <div>Skeptic</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: agentStates.investor === 'analyzing' ? '#2196F3' : 
                         agentStates.investor === 'speaking' ? '#64b5f6' : '#bbdefb', 
              borderRadius: '50%', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>��</div>
            <div>Investor</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: agentStates.judge === 'deliberating' ? '#FF9800' : 
                         agentStates.judge === 'speaking' ? '#ffb74d' : '#ffe0b2', 
              borderRadius: '50%', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>⚖️</div>
            <div>Judge</div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3>IDEA</h3>
          <p style={{ fontStyle: 'italic' }}>{idea}</p>
        </div>
        {verdict && score !== null && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e8f5e9', borderRadius: '4px', textAlign: 'center' }}>
            <h3>VERDICT</h3>
            <div style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{verdict}</div>
            <div>Score: {score}/100</div>
          </div>
        )}
      </div>
      
      {/* Right: Timeline and results */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>COUNCIL PROGRESS</h2>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <div>✓ IDEA SUBMITTED</div>
          <div>{agentStates.believer !== 'idle' ? '✓' : '○'} BELIEVER ANALYZED</div>
          <div>{agentStates.skeptic !== 'idle' ? '✓' : '○'} SKEPTIC ANALYZED</div>
          <div>{agentStates.investor !== 'idle' ? '✓' : '○'} INVESTOR ANALYZED</div>
          <div>{agentStates.believer === 'speaking' || agentStates.skeptic === 'speaking' || agentStates.investor === 'speaking' ? '●' : '○'} DEBATE — ROUND 1</div>
          <div>○ DEBATE — ROUND 2</div>
          <div>{agentStates.judge === 'deliberating' ? '●' : '○'} JUDGE DELIBERATION</div>
          <div>{verdict ? '●' : '○'} FINAL VERDICT</div>
        </div>
        
        {events.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3>LIVE EVENTS</h3>
            <div style={{ background: '#fafafa', padding: '0.5rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {events.map((ev, idx) => (
                <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  <strong>{ev.type}:</strong> {JSON.stringify(ev)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {councilResult && (
          <div>
            <h2>COUNCIL RESULT (raw)</h2>
            <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>{JSON.stringify(councilResult, null, 2)}</pre>
          </div>
        )}
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={goBack}
            style={{ flex: 1, padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Connection
          </button>
          <button
            onClick={rerun}
            disabled={loading || !idea.trim()}
            style={{ flex: 1, padding: '0.5rem 1rem', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Rerun Council
          </button>
          <button
            onClick={saveSession}
            style={{ flex: 1, padding: '0.5rem 1rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Session
          </button>
        </div>
        
        {sessions.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>SAVED SESSIONS</h3>
            <ul style={{ maxHeight: '150px', overflowY: 'auto', listStyle: 'none', padding: 0 }}>
              {sessions.map((sess, idx) => (
                <li key={idx} style={{ padding: '0.5rem', marginBottom: '0.3rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <strong>{sess.idea}</strong> ({sess.verdict} - {sess.score}/100) 
                  <br/>
                  <small>{new Date(sess.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;