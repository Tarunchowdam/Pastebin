'use client';

import { useState } from 'react';
import { CreatePasteResponse } from '@/lib/types';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const body: any = { content };
      
      if (ttlSeconds && ttlSeconds.trim() !== '') {
        const ttl = parseInt(ttlSeconds, 10);
        if (ttl > 0) {
          body.ttl_seconds = ttl;
        }
      }
      
      if (maxViews && maxViews.trim() !== '') {
        const views = parseInt(maxViews, 10);
        if (views > 0) {
          body.max_views = views;
        }
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data: CreatePasteResponse | { error: string; message: string } = await response.json();

      if (!response.ok) {
        setError('error' in data ? data.message : 'Failed to create paste');
        return;
      }

      setResult(data as CreatePasteResponse);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pastebin</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Share text with optional expiry constraints (time-based or view-count based)
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'monospace',
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="ttl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              TTL (seconds) - Optional
            </label>
            <input
              id="ttl"
              type="number"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              min="1"
              step="1"
              placeholder="e.g., 3600"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="maxViews" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Max Views - Optional
            </label>
            <input
              id="maxViews"
              type="number"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              min="1"
              step="1"
              placeholder="e.g., 10"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ marginTop: 0 }}>Paste Created!</h3>
          <p>
            <strong>ID:</strong> {result.id}
          </p>
          <p>
            <strong>URL:</strong>{' '}
            <a href={result.url} style={{ color: '#0070f3' }}>
              {result.url}
            </a>
          </p>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
}