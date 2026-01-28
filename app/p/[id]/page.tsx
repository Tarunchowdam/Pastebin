'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FetchPasteResponse } from '@/lib/types';

export default function ViewPaste() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [paste, setPaste] = useState<FetchPasteResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`/api/pastes/${params.id}`);
        const data: FetchPasteResponse | { error: string; message: string } = await response.json();

        if (!response.ok) {
          setError('message' in data ? data.message : 'Paste not found');
          return;
        }

        setPaste(data as FetchPasteResponse);
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPaste();
    }
  }, [params.id]);

  const copyToClipboard = () => {
    if (paste?.content) {
      navigator.clipboard.writeText(paste.content);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#c00' }}>Paste Not Found</h1>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <p>
          <a href="/" style={{ color: '#0070f3' }}>
            ← Back to Home
          </a>
        </p>
      </div>
    );
  }

  if (!paste) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#c00' }}>Paste Not Found</h1>
        <p style={{ marginBottom: '1rem' }}>The paste you are looking for does not exist.</p>
        <p>
          <a href="/" style={{ color: '#0070f3' }}>
            ← Back to Home
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Paste View</h1>

      <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
        {paste.remaining_views !== null && (
          <span style={{ marginRight: '1rem' }}>
            <strong>Remaining Views:</strong> {paste.remaining_views}
          </span>
        )}
        {paste.expires_at && (
          <span>
            <strong>Expires At:</strong>{' '}
            {new Date(paste.expires_at).toLocaleString()}
          </span>
        )}
      </div>

      <div style={{
        position: 'relative',
        marginBottom: '1rem'
      }}>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontSize: '0.9rem',
          lineHeight: '1.5',
        }}>
          {paste.content}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
          Copy Content
        </button>
        <a
          href="/"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#e0e0e0',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Create New Paste
        </a>
      </div>
    </div>
  );
}