import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI API key must be set via environment variable
// Set OPENAI_API_KEY as a Fly.io secret: fly secrets set OPENAI_API_KEY=your-key

const SYSTEM_PROMPT = `You are an AI assistant for a Fraud Detection Forensic Systems platform. Your role is to help investigators, analysts, and administrators understand and use the platform effectively.

Key capabilities you should explain:
- Real-time transaction scoring and fraud detection
- Case management and investigation workflows
- Entity network analysis and fraud ring detection
- Risk assessment and compliance features
- Audit trails and regulatory reporting

Be professional, concise, and helpful. Focus on practical guidance for fraud investigation workflows. If asked about something outside your knowledge, politely redirect to relevant documentation or suggest contacting support.

Current context: {CONTEXT}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Build conversation messages
    const messages: any[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT.replace('{CONTEXT}', context || 'General platform usage'),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      response,
    });
  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
