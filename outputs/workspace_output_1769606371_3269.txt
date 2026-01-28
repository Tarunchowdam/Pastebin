import { kv } from '@vercel/kv';
import { PasteData } from './types';

const PASTE_KEY_PREFIX = 'paste:';
const PASTE_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days default max

/**
 * Get the current time, respecting TEST_MODE environment variable
 */
export function getCurrentTime(headers?: Headers): number {
  const testMode = process.env.TEST_MODE === '1';
  
  if (testMode && headers) {
    const testNowHeader = headers.get('x-test-now-ms');
    if (testNowHeader) {
      const testTime = parseInt(testNowHeader, 10);
      if (!isNaN(testTime)) {
        return testTime;
      }
    }
  }
  
  return Date.now();
}

/**
 * Check if a paste is expired based on TTL and max views
 */
export function isPasteExpired(paste: PasteData, currentTime: number): boolean {
  // Check TTL expiry
  if (paste.ttl_seconds) {
    const expiryTime = paste.created_at + (paste.ttl_seconds * 1000);
    if (currentTime >= expiryTime) {
      return true;
    }
  }
  
  // Check max views expiry
  if (paste.max_views && paste.current_views >= paste.max_views) {
    return true;
  }
  
  return false;
}

/**
 * Calculate remaining views for a paste
 */
export function getRemainingViews(paste: PasteData): number | null {
  if (!paste.max_views) {
    return null;
  }
  return Math.max(0, paste.max_views - paste.current_views);
}

/**
 * Calculate expiry time for a paste
 */
export function getExpiresAt(paste: PasteData): number | null {
  if (!paste.ttl_seconds) {
    return null;
  }
  return paste.created_at + (paste.ttl_seconds * 1000);
}

/**
 * Store a new paste in KV storage
 */
export async function savePaste(paste: PasteData): Promise<void> {
  const key = `${PASTE_KEY_PREFIX}${paste.id}`;
  
  // Set expiry on the key to ensure cleanup even if logic fails
  const expirySeconds = paste.ttl_seconds || PASTE_EXPIRY_SECONDS;
  
  await kv.set(key, paste, { ex: expirySeconds });
}

/**
 * Retrieve a paste from KV storage
 */
export async function getPaste(id: string): Promise<PasteData | null> {
  const key = `${PASTE_KEY_PREFIX}${id}`;
  return await kv.get<PasteData>(key);
}

/**
 * Increment view count for a paste
 */
export async function incrementPasteViews(id: string): Promise<void> {
  const key = `${PASTE_KEY_PREFIX}${id}`;
  const paste = await kv.get<PasteData>(key);
  
  if (paste) {
    paste.current_views += 1;
    await kv.set(key, paste, {
      ex: paste.ttl_seconds || PASTE_EXPIRY_SECONDS
    });
  }
}

/**
 * Delete a paste from storage
 */
export async function deletePaste(id: string): Promise<void> {
  const key = `${PASTE_KEY_PREFIX}${id}`;
  await kv.del(key);
}

/**
 * Check if KV storage is accessible
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch (error) {
    console.error('KV health check failed:', error);
    return false;
  }
}