import { NextRequest, NextResponse } from 'next/server';
import { getPaste, incrementPasteViews, deletePaste, isPasteExpired, getCurrentTime, getRemainingViews, getExpiresAt } from '@/lib/storage';
import { FetchPasteResponse, ErrorResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get paste from storage
    const paste = await getPaste(id);
    
    if (!paste) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Paste not found' } as ErrorResponse,
        { status: 404 }
      );
    }
    
    // Get current time (respecting test mode)
    const currentTime = getCurrentTime(request.headers);
    
    // Check if paste is expired
    if (isPasteExpired(paste, currentTime)) {
      // Delete expired paste
      await deletePaste(id);
      return NextResponse.json(
        { error: 'Not Found', message: 'Paste has expired' } as ErrorResponse,
        { status: 404 }
      );
    }
    
    // Increment view count
    await incrementPasteViews(id);
    
    // Get updated paste
    const updatedPaste = await getPaste(id);
    
    if (!updatedPaste) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Paste not found' } as ErrorResponse,
        { status: 404 }
      );
    }
    
    // Calculate remaining views and expiry
    const remainingViews = getRemainingViews(updatedPaste);
    const expiresAt = getExpiresAt(updatedPaste);
    
    return NextResponse.json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
    } as FetchPasteResponse, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch paste' } as ErrorResponse,
      { status: 500 }
    );
  }
}