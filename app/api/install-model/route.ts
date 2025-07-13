import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();

    if (!model) {
      return NextResponse.json(
        { error: "Model name is required" },
        { status: 400 }
      );
    }

    // Start the model installation (this is async)
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: model,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Started installing ${model}` 
    });
  } catch (error) {
    console.error("Model installation error:", error);
    return NextResponse.json(
      { error: "Failed to install model" },
      { status: 500 }
    );
  }
} 