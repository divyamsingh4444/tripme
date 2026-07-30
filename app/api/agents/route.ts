import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

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

const DEMO_RESPONSES = {
  tripPlanner: `Barcelona is a vibrant Mediterranean destination perfect for art, architecture, and beach lovers. This 7-day trip for two offers an ideal blend of cultural exploration through Gaudí's masterpieces, beachside relaxation, and authentic Catalan cuisine. Your budget allows for mid-range boutique hotels and excellent dining experiences while maintaining flexibility for activities and entertainment.`,

  accommodations: `• Beachfront Hotels (Barceloneta): Ideal for beach access and sunset views, perfect for couples seeking relaxation. Budget: €100-150/night. • Gothic Quarter Boutiques: Charming medieval streets with character; great for cultural immersion. Budget: €80-120/night. • Eixample District Modern Hotels: Centrally located near Gaudí sites and nightlife; excellent value. Budget: €90-140/night.`,

  activities: `• Sagrada Familia & Park Güell: Must-see Gaudí masterpieces; book tickets in advance. • Gothic Quarter Walking Tour: Discover medieval Barcelona's history and hidden plazas. • Montjuïc Views & MNAC: Panoramic city views and world-class art museum. • Boqueria Market & Tapas: Experience local food culture and street food. • Montserrat Day Trip: Stunning mountain monastery with hiking trails just 45 minutes away.`,

  dining: `• Cal Pep (Seafood): Famous for fresh seafood and standing-room tapas; arrive early. Budget: €20-35/person. • Cervecería Catalana: Premium tapas and vermouth in Gothic Quarter; lively atmosphere. Budget: €30-45/person. • El Nacional: Stunning Belle-Époque Barcelona institution with Spanish cuisine. Budget: €50-70/person. • Local Beachside Chiringuitos: Casual seafood with sand-in-your-toes vibes. Budget: €15-25/person.`,

  travelGuide: `• Transportation: Buy T-Casual metro ticket (10 rides) for unlimited travel. Pick-pocket prevention: Keep valuables secure in crowded areas. • Best Time: Visit neighborhoods early to avoid crowds. Park Güell opens at 8 AM. • Language: English widely spoken in tourist areas; basic Spanish phrases appreciated. • Tipping: 5-10% for good service; not obligatory. Siesta culture: Many shops close 2-5 PM.`,
};

async function callAgent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  // Use demo fallback if API key not set
  if (!process.env.GROQ_API_KEY) {
    console.log('[TripME] Using demo fallback (no API key configured)');
    return ''; // Will be replaced by specific demo response
  }

  try {
    const groqClient = getGroqClient();
    const message = await groqClient.chat.completions.create({
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
  } catch (error) {
    console.error('[TripME] Groq API error, falling back to demo:', error);
    return ''; // Will use fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const input: TripPlanInput = await request.json();
    const useDemo = !process.env.GROQ_API_KEY;

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

    let tripPlannerOutput = useDemo
      ? DEMO_RESPONSES.tripPlanner
      : await callAgent(
          'You are TripME Trip Planner Agent. Your role is to analyze trip details and create comprehensive travel summaries.',
          tripPlannerPrompt,
        );

    // Agent 2: Accommodations Agent
    const accommodationsPrompt = `You are a hotel and lodging specialist. Based on the following trip details, suggest 2-3 types of accommodations that would be ideal, with brief reasoning.

${tripContext}

Format your response as a list with accommodation types and why they're suitable.`;

    let accommodationsOutput = useDemo
      ? DEMO_RESPONSES.accommodations
      : await callAgent(
          'You are TripME Accommodations Agent. Your role is to recommend lodging solutions that fit the travelers needs, budget, and interests.',
          accommodationsPrompt,
        );

    // Agent 3: Activity Scout
    const activityPrompt = `You are an activities and experiences expert. Based on the following trip details, suggest 4-5 must-do activities or experiences specific to the destination.

${tripContext}

Include a mix of popular attractions and hidden gems that match the travelers interests.`;

    let activityOutput = useDemo
      ? DEMO_RESPONSES.activities
      : await callAgent(
          'You are TripME Activity Scout Agent. Your role is to discover and recommend engaging experiences and attractions tailored to the travelers preferences.',
          activityPrompt,
        );

    // Agent 4: Dining Selector
    const diningPrompt = `You are a food and dining curator. Based on the following trip details, recommend 3-4 dining experiences that showcase the local food scene.

${tripContext}

Consider: budget, group size, local cuisine, and dietary preferences if mentioned in interests.`;

    let diningOutput = useDemo
      ? DEMO_RESPONSES.dining
      : await callAgent(
          'You are TripME Dining Selector Agent. Your role is to curate memorable culinary experiences that match the travelers budget and preferences.',
          diningPrompt,
        );

    // Agent 5: Travel Guide
    const travelGuidePrompt = `You are a knowledgeable travel guide. Based on the following trip details, provide 3-4 essential travel tips and logistical advice for visiting this destination.

${tripContext}

Include: transportation tips, timing recommendations, local customs, and practical logistics.`;

    let travelGuideOutput = useDemo
      ? DEMO_RESPONSES.travelGuide
      : await callAgent(
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

    if (useDemo) {
      console.log('[TripME] Returning demo trip plan for:', input.destination);
    }

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
