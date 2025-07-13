import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json();

    if (!mode || !['fast', 'balanced', 'quality'].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'fast', 'balanced', or 'quality'" },
        { status: 400 }
      );
    }

    // Update the configuration file
    const configPath = join(process.cwd(), 'lib', 'ollama-config.ts');
    const configContent = readFileSync(configPath, 'utf8');
    
    // Replace the CURRENT_MODE line
    const updatedContent = configContent.replace(
      /export const CURRENT_MODE: 'fast' \| 'balanced' \| 'quality' = '[^']+';/,
      `export const CURRENT_MODE: 'fast' | 'balanced' | 'quality' = '${mode}';`
    );
    
    writeFileSync(configPath, updatedContent);

    return NextResponse.json({ 
      success: true, 
      mode,
      message: `Speed mode updated to ${mode}` 
    });
  } catch (error) {
    console.error("Speed mode update error:", error);
    return NextResponse.json(
      { error: "Failed to update speed mode" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const configPath = join(process.cwd(), 'lib', 'ollama-config.ts');
    const configContent = readFileSync(configPath, 'utf8');
    
    // Extract current mode from the file
    const match = configContent.match(/CURRENT_MODE.*= '([^']+)'/);
    const currentMode = match ? match[1] : 'fast';
    
    return NextResponse.json({ 
      currentMode,
      availableModes: ['fast', 'balanced', 'quality']
    });
  } catch (error) {
    console.error("Speed mode get error:", error);
    return NextResponse.json(
      { error: "Failed to get speed mode" },
      { status: 500 }
    );
  }
} 