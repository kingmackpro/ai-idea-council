import React, { useState, useEffect } from 'react';

function App() {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [manualModel, setManualModel] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('idle'); // for fetch models button
  const [testStatus, setTestStatus] = useState('idle'); // for test connection

  // Load saved config from backend on startup
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const resp = await fetch('/api/config');
        const data = await resp.json();
        if (data.baseUrl) setBaseUrl(data.baseUrl);
        // Note: we don't get the actual API key back for security
        if data.model setModel(data.model);
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
      setStatus('success');
    } catch (err) {
      setStatus('error');
      console.error('Failed to save config:', err);
    }
  };

  const fetchModels = async () => {
    setFetchStatus('loading');
    try {
      const resp = await fetch('/api/models');
      const data = await resp.json();
      if (data.data) {
        setModels(data.data);
        setFetchStatus('success');
      } else {
        setModels(data || []);
        setFetchStatus('success');
      }
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
      } else {
        const errorData = await resp.json();
        setTestStatus('error');
        console.error('Connection test failed:', errorData);
      }
    } catch (err) {
      setTestStatus('error');
      console.error('Connection test error:', err);
    }
  };

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
        {status === 'success' && (
          <span style={{ color: 'green' }}>Saved!</span>
        )}
        {status === 'error' && (
          <span style={{ color: 'red' }}>Save failed</span>
        )}
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
      
      {(models.length > 0 || manualModel) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            MODEL:{' '}
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setManualModel(false);
              }}
              style={{ width: '100%', padding: '0.5rem' }}
            >
              <option value="">Select a model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
              {!manualModel && models.length > 0 && (
                <option value="__manual__">Enter manually...</option>
              )}
            </select>
          </label>
          {model === '__manual__' && (
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setManualModel(true);
                }}
                placeholder="Enter model name..."
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          )}
        </div>
      )}
      
      {model && !model.startsWith('__') && (
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
      
      {model && !model.startsWith('__') && testStatus === 'success' && (
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => {
              // In a real app, we'd navigate to council room
              alert('Ready to enter council room! (Not implemented yet)');
            }}
            style={{ padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Enter Council Room
          </button>
        </div>
      )}
    </div>
  );
}

export default App;