import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const models = data.models?.map((model: any) => model.name) || [];

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { models: [] },
      { status: 500 }
    );
  }
} 