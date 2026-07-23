'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LANGUAGES = ['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'JAPANESE', 'MANDARIN'];

// 1. Define the Props interface
interface Props {
  gameId: string;
  gameName: string;
}

export default function NewVariationPage({ gameId, gameName }: Props) {
  const router = useRouter();

  // 2. Form States (No Game Context state needed!)
  const [language, setLanguage] = useState('ENGLISH');
  const [variation, setVariation] = useState('Default');
  const [count, setCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 3. Submit Handler (Still hits the API for the AI generation)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/games/${gameId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, variation, count }),
      });

      if (!res.ok) throw new Error('Failed to generate');
      router.push('/admin/games'); 
    } catch (err) {
      setError('Generation failed. Check API logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-2">Create Variation</h1>
      {/* 4. Use the prop directly! Instant load, no spinner */}
      <p className="text-gray-600 mb-6">
        For Base Game: <span className="font-semibold text-blue-600">{gameName}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Target Language</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border p-2 rounded mt-1 bg-white"
          >
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Variation Theme/Name</label>
          <input 
            type="text" 
            value={variation} 
            onChange={(e) => setVariation(e.target.value)}
            placeholder="e.g. Animals, Level 1"
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Rounds (Count)</label>
          <input 
            type="number" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            min={1} max={100}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Generating & Saving...' : 'Generate Variation via AI'}
        </button>
      </form>
    </div>
  );
}
