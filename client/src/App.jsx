import React, { useState, useEffect } from 'react';

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
    try {
      const resp = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });
      const data = await resp.json();
      setCouncilResult(data);
      setStep('council');
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
            <button
              onClick={startCouncil}
              disabled={loading || !idea.trim()}
              style={{ padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
            >
              {loading ? 'STARTING...' : '[ ⚡ START COUNCIL ]'}
            </button>
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
            <div style={{ width: '80px', height: '80px', background: '#4CAF50', borderRadius: '50%', marginBottom: '0.5rem' }}>��</div>
            <div>Believer</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#f44336', borderRadius: '50%', marginBottom: '0.5rem' }}>��</div>
            <div>Skeptic</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#2196F3', borderRadius: '50%', marginBottom: '0.5rem' }}>��</div>
            <div>Investor</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#FF9800', borderRadius: '50%', marginBottom: '0.5rem' }}>⚖️</div>
            <div>Judge</div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3>IDEA</h3>
          <p style={{ fontStyle: 'italic' }}>{idea}</p>
        </div>
      </div>
      
      {/* Right: Timeline and results */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>COUNCIL PROGRESS</h2>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <div>✓ IDEA SUBMITTED</div>
          <div>✓ BELIEVER ANALYZED</div>
          <div>✓ SKEPTIC ANALYZED</div>
          <div>✓ INVESTOR ANALYZED</div>
          <div>● DEBATE — ROUND 1</div>
          <div>○ DEBATE — ROUND 2</div>
          <div>○ JUDGE DELIBERATION</div>
          <div>○ FINAL VERDICT</div>
        </div>
        
        {councilResult && (
          <div>
            <h2>COUNCIL RESULT</h2>
            <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>{JSON.stringify(councilResult, null, 2)}</pre>
            <button onClick={goBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Back to Connection</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;