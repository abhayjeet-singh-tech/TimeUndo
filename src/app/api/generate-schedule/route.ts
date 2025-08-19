// src/app/api/generate-schedule/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Gemini AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Task data structure
interface Task {
  id: number;
  name: string;
  estimatedHours: number;
}

// Request body structure
interface RequestBody {
  tasks: Task[];
  hoursLeft: number;
}

// Schedule block structure
interface ScheduleBlock {
  time: string;
  activity: string;
  duration: string;
  type: 'task' | 'break';
}

// POST handler for generating a schedule
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { tasks, hoursLeft } = body;

    // Validate input
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }
    if (!hoursLeft || hoursLeft <= 0) {
      return NextResponse.json({ error: 'Invalid hours left' }, { status: 400 });
    }

    // Use the free Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Total estimated time for all tasks
    const totalTaskHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

    // Prompt for AI
    const prompt = `
You are a productivity expert. Create an optimal daily schedule with the following constraints:

**Available Time:** ${hoursLeft} hours
**Tasks to Complete:**
${tasks.map((task, index) => `${index + 1}. ${task.name} (estimated: ${task.estimatedHours} hours)`).join('\n')}

**Total Estimated Task Time:** ${totalTaskHours} hours

**Requirements:**
1. Include breaks (5-15 min between tasks, 30-60 min lunch if long)
2. Start at 9:00 AM
3. Consider task complexity and mental fatigue
4. Prioritize tasks if total time > available time
5. Include buffer time for delays
6. Make it realistic and sustainable

**Response Format (JSON only):**
{
  "schedule": [
    {
      "time": "9:00 AM",
      "activity": "Task or break name",
      "duration": "X hours" or "X minutes",
      "type": "task" or "break"
    }
  ]
}

Respond with ONLY the JSON object.`;

    // Generate schedule from AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Remove any markdown formatting
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse AI response:', responseText);
      // Fallback schedule
      return NextResponse.json({
        schedule: [
          {
            time: "9:00 AM",
            activity: "Complete all tasks",
            duration: `${Math.min(totalTaskHours, hoursLeft)} hours`,
            type: "task"
          },
          {
            time: `${9 + Math.min(totalTaskHours, hoursLeft)}:00 ${9 + Math.min(totalTaskHours, hoursLeft) >= 12 ? 'PM' : 'AM'}`,
            activity: "Take a break",
            duration: "30 minutes",
            type: "break"
          }
        ]
      });
    }

    // Validate schedule structure
    if (!parsedResponse.schedule || !Array.isArray(parsedResponse.schedule)) {
      throw new Error('Invalid response structure from AI');
    }

    const validSchedule: ScheduleBlock[] = parsedResponse.schedule.map((block: any) => ({
      time: block.time || 'TBD',
      activity: block.activity || 'Unspecified activity',
      duration: block.duration || '30 minutes',
      type: (block.type === 'task' || block.type === 'break') ? block.type : 'task'
    }));

    return NextResponse.json({ schedule: validSchedule });

  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
  }
}
