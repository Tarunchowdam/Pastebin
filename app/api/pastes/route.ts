import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { savePaste } from '@/lib/storage';
import { CreatePasteRequest, CreatePasteResponse, ErrorResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePasteRequest = await request.json();
    
    // Validate content
    if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Content is required and must be non-empty' } as ErrorResponse,
        { status: 400 }
      );
    }
    
    // Validate ttl_seconds if provided
    if (body.ttl_seconds !== undefined) {
      if (typeof body.ttl_seconds !== 'number' || body.ttl_seconds < 1 || !Number.isInteger(body.ttl_seconds)) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'ttl_seconds must be a positive integer' } as ErrorResponse,
          { status: 400 }
        );
      }
    }
    
    // Validate max_views if provided
    if (body.max_views !== undefined) {
      if (typeof body.max_views !== 'number' || body.max_views < 1 || !Number.isInteger(body.max_views)) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'max_views must be a positive integer' } as ErrorResponse,
          { status: 400 }
        );
      }
    }
    
    // Generate unique ID
    const id = nanoid();
    
    // Create paste data
    const paste = {
      id,
      content: body.content,
      created_at: Date.now(),
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
      current_views: 0
    };
    
    // Save to storage
    await savePaste(paste);
    
    // Construct URL
    const url = `${request.nextUrl.origin}/p/${id}`;
    
    return NextResponse.json(
      { id, url } as CreatePasteResponse,
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create paste' } as ErrorResponse,
      { status: 500 }
    );
  }
}