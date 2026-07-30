'use client';

import { useState } from 'react';
import TripForm from '@/components/trip-form';
import AgentPipeline from '@/components/agent-pipeline';
import type { TripPlanInput } from './api/agents/route';

interface AgentOutput {
  role: string;
  content: string;
  timestamp: number;
}

interface TripResult {
  success: boolean;
  data?: AgentOutput[];
  input?: TripPlanInput;
  error?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TripResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (formData: TripPlanInput) => {
    setLoading(true);
    setShowResults(false);
    setResult(null);

    try {
      // First save to localStorage
      localStorage.setItem('lastTripPlan', JSON.stringify(formData));

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: TripResult = await response.json();
      setResult(data);
      setShowResults(true);

      // Save result to localStorage
      if (data.success && data.data) {
        localStorage.setItem('lastTripResult', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error calling agents:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to plan trip',
      });
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    const demoData: TripPlanInput = {
      destination: 'Barcelona, Spain',
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      budget: '$3000-5000',
      interests: ['art', 'architecture', 'food', 'beaches'],
      travelers: 2,
    };

    setLoading(true);
    handleSubmit(demoData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2 text-foreground">
            Trip<span className="text-accent">ME</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Plan your perfect journey with AI-powered travel agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-1">
            <TripForm onSubmit={handleSubmit} loading={loading} onLoadDemo={handleLoadDemo} />
          </div>

          {/* Right: Agent Pipeline Output */}
          <div className="lg:col-span-2">
            {showResults ? (
              result?.success && result.data ? (
                <AgentPipeline agents={result.data} />
              ) : (
                <div className="bg-card rounded-lg p-6 border border-border">
                  <p className="text-destructive">
                    {result?.error || 'Failed to generate trip plan'}
                  </p>
                </div>
              )
            ) : (
              <div className="bg-card rounded-lg p-8 border border-border flex flex-col items-center justify-center min-h-96 text-center">
                <p className="text-muted-foreground mb-4">
                  Fill out the form to generate your personalized trip plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Our AI agents will analyze your preferences and create a detailed itinerary
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
