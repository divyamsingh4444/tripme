'use client';

import { useState, useEffect } from 'react';

interface AgentOutput {
  role: string;
  content: string;
  timestamp: number;
}

interface AgentPipelineProps {
  agents: AgentOutput[];
}

const AGENT_ICONS: Record<string, string> = {
  'Trip Planner': '✈️',
  'Accommodations Agent': '🏨',
  'Activity Scout': '🎭',
  'Dining Selector': '🍽️',
  'Travel Guide': '🗺️',
};

const AGENT_COLORS: Record<string, string> = {
  'Trip Planner': 'from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800',
  'Accommodations Agent': 'from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800',
  'Activity Scout': 'from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800',
  'Dining Selector': 'from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800',
  'Travel Guide': 'from-rose-500/10 to-rose-600/10 border-rose-200 dark:border-rose-800',
};

const AGENT_BADGES: Record<string, string> = {
  'Trip Planner': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Accommodations Agent': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Activity Scout': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Dining Selector': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Travel Guide': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
};

export default function AgentPipeline({ agents }: AgentPipelineProps) {
  const [activeAgent, setActiveAgent] = useState(0);
  const [displayedAgents, setDisplayedAgents] = useState<AgentOutput[]>([]);

  useEffect(() => {
    if (agents.length === 0) return;

    setDisplayedAgents([agents[0]]);
    let index = 1;
    const interval = setInterval(() => {
      if (index < agents.length) {
        setDisplayedAgents((prev) => [...prev, agents[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [agents]);

  return (
    <div className="space-y-4">
      {/* Agent Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {agents.filter(Boolean).map((agent, index) => (
          <button
            key={index}
            onClick={() => setActiveAgent(index)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              activeAgent === index
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            <span className="mr-2">{AGENT_ICONS[agent?.role || ''] || '🤖'}</span>
            {agent?.role || 'Agent'}
          </button>
        ))}
      </div>

      {/* Agent Cards - All visible in sequence */}
      <div className="space-y-4">
        {displayedAgents.filter(Boolean).map((agent, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${AGENT_COLORS[agent?.role || ''] || 'from-accent/10 to-primary/10'} rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            {/* Agent Header with Boarding Pass Style */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{AGENT_ICONS[agent?.role || ''] || '🤖'}</span>
                <div>
                  <span
                    className={`inline-block ${AGENT_BADGES[agent?.role || ''] || 'bg-accent/20 text-accent'} px-3 py-1 rounded-full text-xs font-semibold mb-2`}
                  >
                    {agent?.role || 'Agent'}
                  </span>
                  <h3 className="text-sm font-semibold text-muted-foreground">Agent Report</h3>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">
                  #{String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border my-4"></div>

            {/* Agent Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                {agent?.content || 'No content available'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      {displayedAgents.length === agents.length && (
        <div className="bg-card rounded-lg border border-accent border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            All {agents.length} agents have completed their analysis
          </p>
          <p className="text-xs text-accent font-semibold mt-1">✓ Trip plan ready to book</p>
        </div>
      )}
    </div>
  );
}
