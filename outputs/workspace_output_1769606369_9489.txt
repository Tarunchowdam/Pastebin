export interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
}

export interface PasteData {
  id: string;
  content: string;
  created_at: number;
  ttl_seconds?: number;
  max_views?: number;
  current_views: number;
}

export interface FetchPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface HealthResponse {
  ok: boolean;
}