import { NextRequest, NextResponse } from 'next/server';
import { getOllamaConfig } from '@/lib/ollama-config';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  totalQuestions: number;
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following code and create a coding quiz with 5 multiple choice questions that test understanding of the code's logic, syntax, and concepts.

Code:
\`\`\`
${code}
\`\`\`

Generate a JSON response with this exact structure:
{
  "quiz": {
    "id": "quiz_${Date.now()}",
    "questions": [
      {
        "id": "q1",
        "question": "What is the main purpose of this code?",
        "options": [
          "To calculate the sum of all numbers in an array",
          "To sort the array in ascending order", 
          "To find the maximum value in the array",
          "To remove duplicate elements from the array"
        ],
        "correctAnswer": 0,
        "explanation": "This code iterates through the array and adds each element to a running total, effectively calculating the sum."
      }
    ],
    "totalQuestions": 5
  }
}

IMPORTANT REQUIREMENTS:
1. Analyze the ACTUAL code provided above
2. Create questions that are SPECIFIC to this code's functionality
3. Make all 4 options plausible but only one correct
4. Questions should test: logic flow, syntax, edge cases, algorithms, data structures
5. Explanations should be educational and explain WHY the answer is correct
6. correctAnswer should be the 0-based index (0, 1, 2, or 3) of the correct option
7. Do NOT use generic placeholders like "Option A", "Option B" - write actual answers
8. Make sure the questions and answers are relevant to the specific code provided

Return ONLY the JSON, no other text or explanations.`;

    // Get the user's selected model and configuration
    const config = getOllamaConfig();
    const modelName = config.model;
    const modelOptions = config.options;

    console.log('Using model:', modelName, 'with options:', modelOptions);

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
      console.error('Ollama API error:', response.status, response.statusText);
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response;

    if (!responseText) {
      throw new Error('No response from Ollama');
    }

    console.log('Ollama response:', responseText);

    // Try to extract JSON from the response
    let quizData: any;
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
        console.log('Parsed quiz data:', quizData);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback: generate a simple quiz structure based on the code
      const codeLines = code.split('\n').length;
      const hasFunction = code.includes('function') || code.includes('def') || code.includes('const') || code.includes('let');
      const hasLoop = code.includes('for') || code.includes('while') || code.includes('forEach');
      const hasConditional = code.includes('if') || code.includes('else') || code.includes('switch');
      
      quizData = {
        quiz: {
          id: `quiz_${Date.now()}`,
          questions: [
            {
              id: "q1",
              question: `What is the main purpose of this ${codeLines > 10 ? 'program' : 'code snippet'}?`,
              options: [
                "To process and manipulate data",
                "To display information to the user", 
                "To perform mathematical calculations",
                "To handle user input and validation"
              ],
              correctAnswer: 0,
              explanation: "Based on the code structure, this appears to be designed for data processing and manipulation."
            },
            {
              id: "q2", 
              question: hasFunction ? "What type of function is this?" : "What programming construct is this?",
              options: [
                "Recursive function",
                "Async function",
                "Arrow function",
                "Regular function"
              ],
              correctAnswer: hasFunction ? 3 : 2,
              explanation: hasFunction ? "This appears to be a regular function based on the syntax." : "This appears to be a code block or expression."
            },
            {
              id: "q3",
              question: "What would happen if the input is null or undefined?",
              options: [
                "The code would crash with an error",
                "It would return null or undefined",
                "It would throw a specific exception",
                "It would continue normally"
              ],
              correctAnswer: 0,
              explanation: "Without proper null checking, the code would likely crash when processing null or undefined values."
            },
            {
              id: "q4",
              question: hasLoop ? "What is the time complexity of this algorithm?" : "What is the computational complexity?",
              options: [
                "O(1) - Constant time",
                "O(n) - Linear time",
                "O(n²) - Quadratic time",
                "O(log n) - Logarithmic time"
              ],
              correctAnswer: hasLoop ? 1 : 0,
              explanation: hasLoop ? "Based on the loop structure, this appears to have linear time complexity." : "This appears to be a simple operation with constant time complexity."
            },
            {
              id: "q5",
              question: "Which programming concept is most prominently demonstrated here?",
              options: [
                "Object-oriented programming",
                "Functional programming",
                "Procedural programming",
                "Event-driven programming"
              ],
              correctAnswer: 2,
              explanation: "This code appears to follow procedural programming principles with step-by-step execution."
            }
          ],
          totalQuestions: 5
        }
      };
    }

    // Validate the quiz structure
    if (!quizData.quiz || !Array.isArray(quizData.quiz.questions)) {
      throw new Error('Invalid quiz structure generated');
    }

    const quiz: Quiz = {
      id: quizData.quiz.id,
      questions: quizData.quiz.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || 'No explanation provided.'
      })),
      totalQuestions: quizData.quiz.questions.length
    };

    return NextResponse.json({
      success: true,
      quiz: quiz
    });

  } catch (error) {
    console.error('Coding quiz generation error:', error);
    
    // Return a fallback quiz if everything fails
    const fallbackQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      questions: [
        {
          id: "q1",
          question: "What is the main purpose of this code?",
          options: [
            "To process data",
            "To display information", 
            "To calculate values",
            "To handle errors"
          ],
          correctAnswer: 0,
          explanation: "This code appears to process data based on the logic shown."
        },
        {
          id: "q2", 
          question: "What type of function is this?",
          options: [
            "Recursive function",
            "Async function",
            "Arrow function",
            "Regular function"
          ],
          correctAnswer: 3,
          explanation: "This appears to be a regular function based on the syntax."
        },
        {
          id: "q3",
          question: "What would happen if the input is null?",
          options: [
            "The code would crash",
            "It would return null",
            "It would throw an error",
            "It would continue normally"
          ],
          correctAnswer: 0,
          explanation: "Without null checking, the code would likely crash when processing null values."
        },
        {
          id: "q4",
          question: "What is the time complexity of this algorithm?",
          options: [
            "O(1)",
            "O(n)",
            "O(n²)",
            "O(log n)"
          ],
          correctAnswer: 1,
          explanation: "Based on the code structure, this appears to have linear time complexity."
        },
        {
          id: "q5",
          question: "Which programming concept is demonstrated here?",
          options: [
            "Inheritance",
            "Polymorphism",
            "Encapsulation",
            "Abstraction"
          ],
          correctAnswer: 3,
          explanation: "The code abstracts complex operations into simpler, more manageable functions."
        }
      ],
      totalQuestions: 5
    };

    return NextResponse.json({
      success: true,
      quiz: fallbackQuiz,
      note: "Generated fallback quiz due to AI service issues"
    });
  }
} 