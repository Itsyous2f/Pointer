import { NextRequest, NextResponse } from "next/server";
import { getOllamaConfig } from '@/lib/ollama-config';

export async function POST(request: NextRequest) {
  try {
    const { answer, question } = await request.json();

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a harsh but helpful critic. Review this answer to the question and provide brutally honest feedback.

Question: ${question || 'General question'}

Answer: ${answer}

Provide feedback that is:
1. Harsh and critical - point out flaws, weaknesses, and areas for improvement
2. Constructive - explain WHY something is wrong and HOW to fix it
3. Specific - don't just say "this is wrong", explain exactly what's wrong
4. Educational - help the person learn from their mistakes

Be direct, honest, and tough but fair. Focus on helping them improve.`;

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
    const feedback = data.response;

    return NextResponse.json({
      success: true,
      feedback: feedback
    });
  } catch (error) {
    console.error('Answer critic generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
} 