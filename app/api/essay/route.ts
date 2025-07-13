import { NextRequest, NextResponse } from 'next/server';
import { getOllamaConfig } from '@/lib/ollama-config';

export async function POST(request: NextRequest) {
  try {
    const { topic, type, length } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const essayTypes = {
      argumentative: 'an argumentative essay with a clear thesis and supporting evidence',
      descriptive: 'a descriptive essay with vivid details and sensory language',
      narrative: 'a narrative essay that tells a story or recounts an experience',
      expository: 'an expository essay that explains or informs about the topic',
      persuasive: 'a persuasive essay that convinces the reader of a particular viewpoint'
    };

    const selectedType = essayTypes[type as keyof typeof essayTypes] || essayTypes.expository;

    const lengthGuide = {
      short: '300-500 words',
      medium: '500-800 words',
      long: '800-1200 words'
    };

    const selectedLength = lengthGuide[length as keyof typeof lengthGuide] || lengthGuide.medium;

    const prompt = `Write ${selectedType} about "${topic}". 

Requirements:
- Length: ${selectedLength}
- Well-structured with introduction, body paragraphs, and conclusion
- Clear, engaging writing style
- Proper grammar and flow
- Include relevant examples or evidence where appropriate

Please write a complete essay that meets these requirements.`;

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
    const essay = data.response;

    return NextResponse.json({
      success: true,
      essay: essay
    });

  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay' },
      { status: 500 }
    );
  }
} 