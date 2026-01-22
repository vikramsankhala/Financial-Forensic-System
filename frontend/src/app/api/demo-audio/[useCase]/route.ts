import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { NARRATION_SCRIPTS, UseCaseId } from '@/lib/demo-narration-scripts';

// In-memory cache for generated audio (in production, consider Redis or file storage)
const audioCache = new Map<string, Buffer>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ useCase: string }> }
) {
  const resolvedParams = await params;
  const useCase = resolvedParams.useCase as UseCaseId;

  // Check if audio demos are enabled
  if (process.env.NEXT_PUBLIC_DEMO_AUDIO_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Audio demos are disabled' },
      { status: 403 }
    );
  }

  // Validate use case
  if (!NARRATION_SCRIPTS[useCase]) {
    return NextResponse.json(
      { error: 'Invalid use case' },
      { status: 400 }
    );
  }

  // Check cache first
  const cachedAudio = audioCache.get(useCase);
  if (cachedAudio) {
    return new NextResponse(new Uint8Array(cachedAudio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': cachedAudio.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // Generate audio if not cached
  try {
    // OpenAI API key must be set via environment variable
    // Set OPENAI_API_KEY as a Fly.io secret: fly secrets set OPENAI_API_KEY=your-key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const script = NARRATION_SCRIPTS[useCase];

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: 'nova', // Professional, neutral voice (options: alloy, echo, fable, onyx, nova, shimmer)
      input: script,
      response_format: 'mp3',
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Cache the audio
    audioCache.set(useCase, buffer);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to regenerate audio (useful for updating scripts)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ useCase: string }> }
) {
  const resolvedParams = await params;
  const useCase = resolvedParams.useCase as UseCaseId;

  if (process.env.NEXT_PUBLIC_DEMO_AUDIO_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Audio demos are disabled' },
      { status: 403 }
    );
  }

  // Clear cache and regenerate
  audioCache.delete(useCase);

  // Trigger regeneration by calling GET logic
  return GET(request, { params });
}
