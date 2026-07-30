'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TripPlanInput } from '@/app/api/agents/route';

interface TripFormProps {
  onSubmit: (data: TripPlanInput) => void;
  loading: boolean;
  onLoadDemo: () => void;
}

const INTEREST_OPTIONS = [
  'art',
  'architecture',
  'food',
  'beaches',
  'hiking',
  'culture',
  'nightlife',
  'shopping',
  'history',
  'adventure',
];

export default function TripForm({ onSubmit, loading, onLoadDemo }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelers, setTravelers] = useState(1);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination || !startDate || !endDate || !budget || selectedInterests.length === 0) {
      alert('Please fill in all fields and select at least one interest');
      return;
    }

    const formData: TripPlanInput = {
      destination,
      startDate,
      endDate,
      budget,
      interests: selectedInterests,
      travelers,
    };

    onSubmit(formData);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Plan Your Trip</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Barcelona, Spain"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
        </div>

        {/* Travel Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Budget</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., $3000-5000"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
        </div>

        {/* Number of Travelers */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Number of Travelers
          </label>
          <select
            value={travelers}
            onChange={(e) => setTravelers(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'traveler' : 'travelers'}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Interests (select at least one)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                disabled={loading}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
                }`}
              >
                {interest.charAt(0).toUpperCase() + interest.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2"
          >
            {loading ? 'Planning...' : 'Plan My Trip'}
          </Button>

          <Button
            type="button"
            onClick={onLoadDemo}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Load Demo
          </Button>
        </div>
      </form>
    </div>
  );
}
