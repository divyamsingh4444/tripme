import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TripPlanInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  interests: string[];
  travelers: number;
}

interface AgentOutput {
  role: string;
  content: string;
  timestamp: number;
}

async function callAgent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const message = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  if (message.choices[0].message.content) {
    return message.choices[0].message.content;
  }

  return '';
}

export async function POST(request: NextRequest) {
  try {
    const input: TripPlanInput = await request.json();

    const tripContext = `
Destination: ${input.destination}
Travel Dates: ${input.startDate} to ${input.endDate}
Budget: ${input.budget}
Interests: ${input.interests.join(', ')}
Number of Travelers: ${input.travelers}
    `.trim();

    // Agent 1: Trip Planner
    const tripPlannerPrompt = `You are an expert travel planner specializing in creating cohesive trip itineraries. Based on the following trip details, create a 2-3 sentence executive summary of the trip with key highlights and what makes this trip unique.

${tripContext}

Focus on: destination highlights, travel duration, group composition, and special considerations.`;

    const tripPlannerOutput = await callAgent(
      'You are TripME Trip Planner Agent. Your role is to analyze trip details and create comprehensive travel summaries.',
      tripPlannerPrompt,
    );

    // Agent 2: Accommodations Agent
    const accommodationsPrompt = `You are a hotel and lodging specialist. Based on the following trip details, suggest 2-3 types of accommodations that would be ideal, with brief reasoning.

${tripContext}

Format your response as a list with accommodation types and why they're suitable.`;

    const accommodationsOutput = await callAgent(
      'You are TripME Accommodations Agent. Your role is to recommend lodging solutions that fit the travelers needs, budget, and interests.',
      accommodationsPrompt,
    );

    // Agent 3: Activity Scout
    const activityPrompt = `You are an activities and experiences expert. Based on the following trip details, suggest 4-5 must-do activities or experiences specific to the destination.

${tripContext}

Include a mix of popular attractions and hidden gems that match the travelers interests.`;

    const activityOutput = await callAgent(
      'You are TripME Activity Scout Agent. Your role is to discover and recommend engaging experiences and attractions tailored to the travelers preferences.',
      activityPrompt,
    );

    // Agent 4: Dining Selector
    const diningPrompt = `You are a food and dining curator. Based on the following trip details, recommend 3-4 dining experiences that showcase the local food scene.

${tripContext}

Consider: budget, group size, local cuisine, and dietary preferences if mentioned in interests.`;

    const diningOutput = await callAgent(
      'You are TripME Dining Selector Agent. Your role is to curate memorable culinary experiences that match the travelers budget and preferences.',
      diningPrompt,
    );

    // Agent 5: Travel Guide
    const travelGuidePrompt = `You are a knowledgeable travel guide. Based on the following trip details, provide 3-4 essential travel tips and logistical advice for visiting this destination.

${tripContext}

Include: transportation tips, timing recommendations, local customs, and practical logistics.`;

    const travelGuideOutput = await callAgent(
      'You are TripME Travel Guide Agent. Your role is to provide essential travel wisdom, practical tips, and logistical guidance for a smooth trip.',
      travelGuidePrompt,
    );

    const outputs: AgentOutput[] = [
      {
        role: 'Trip Planner',
        content: tripPlannerOutput,
        timestamp: Date.now(),
      },
      {
        role: 'Accommodations Agent',
        content: accommodationsOutput,
        timestamp: Date.now() + 1,
      },
      {
        role: 'Activity Scout',
        content: activityOutput,
        timestamp: Date.now() + 2,
      },
      {
        role: 'Dining Selector',
        content: diningOutput,
        timestamp: Date.now() + 3,
      },
      {
        role: 'Travel Guide',
        content: travelGuideOutput,
        timestamp: Date.now() + 4,
      },
    ];

    return NextResponse.json(
      { success: true, data: outputs, input },
      { status: 200 },
    );
  } catch (error) {
    console.error('Agent orchestration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
