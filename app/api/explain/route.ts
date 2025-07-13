import { NextRequest, NextResponse } from 'next/server';
import { getOllamaConfig } from '@/lib/ollama-config';

export async function POST(request: NextRequest) {
  try {
    const { topic, style } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const styles = {
      metaphor: 'using metaphors and analogies',
      story: 'as a story or narrative',
      simple: 'in simple, everyday language',
      technical: 'with technical details and examples',
      visual: 'with visual descriptions and imagery'
    };

    const selectedStyle = styles[style as keyof typeof styles] || styles.simple;

    const prompt = `Explain the following topic ${selectedStyle}. Make it engaging and easy to understand:

Topic: ${topic}

Please provide a clear, well-structured explanation that helps someone understand this concept.`;

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
    const explanation = data.response;

    return NextResponse.json({
      success: true,
      explanation: explanation
    });

  } catch (error) {
    console.error('Explain generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
} 