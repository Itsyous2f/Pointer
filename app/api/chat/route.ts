import { NextResponse } from 'next/server';
import { getOllamaConfig } from '@/lib/ollama-config';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    const config = getOllamaConfig();
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: message,
        stream: false,
        options: config.options
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ message: data.response });
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return NextResponse.json(
      { message: "Sorry, I'm having trouble connecting to the AI model. Please try again." },
      { status: 500 }
    );
  }
} 