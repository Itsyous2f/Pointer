import { NextRequest, NextResponse } from 'next/server';
import { getOllamaConfig } from '@/lib/ollama-config';

export async function POST(request: NextRequest) {
  try {
    const { content, tone, action } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    const tones = {
      formal: 'formal and professional',
      casual: 'casual and friendly',
      confident: 'confident and assertive',
      polite: 'polite and courteous',
      enthusiastic: 'enthusiastic and energetic'
    };

    const selectedTone = tones[tone as keyof typeof tones] || tones.polite;

    const actions = {
      write: 'write a new email',
      rewrite: 'rewrite this email',
      improve: 'improve this email',
      shorten: 'shorten this email',
      expand: 'expand this email'
    };

    const selectedAction = actions[action as keyof typeof actions] || actions.rewrite;

    const prompt = `${selectedAction} in a ${selectedTone} tone.

${action === 'write' ? 'Email content to write:' : 'Original email:'}
${content}

Please ${selectedAction} maintaining the ${selectedTone} tone while ensuring clarity and professionalism.`;

    // Get the user's selected model and configuration
    const config = getOllamaConfig();
    const modelName = config.model;
    const modelOptions = config.options;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
        options: modelOptions,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const email = data.response;

    return NextResponse.json({
      success: true,
      email: email
    });

  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
} 