import React, { useState } from 'react';

function App() {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  const fetchModels = async () => {
    setStatus('loading');
    try {
      const resp = await fetch(`${baseUrl}/models`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      const data = await resp.json();
      setModels(data.data || []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CONNECT YOUR AI</h1>
      <p>Use any OpenAI-compatible endpoint. An API key is optional.</p>
      <div>
        <label>
          Base URL:{' '}
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label>
          API Key (optional):{' '}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Leave blank if not required"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={fetchModels}
          disabled={status === 'loading'}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          {status === 'loading' ? 'FETCHING...' : '↓ FETCH MODELS'}
        </button>
        {status === 'success' && (
          <p style={{ color: 'green' }}>{models.length} MODELS FOUND</p>
        )}
        {status === 'error' && (
          <p style={{ color: 'red' }}>⚠ FETCH FAILED</p>
        )}
      </div>
      {models.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <label>
            MODEL:{' '}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
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
      {selectedModel && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              // Test connection logic could go here
              alert(`Testing connection to ${baseUrl} with model ${selectedModel}`);
            }}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            [ TEST CONNECTION ]
          </button>
        </div>
      )}
    </div>
  );
}

export default App;