'use client';

import { useState, useEffect } from 'react';
import { featuredCharacters } from '@/lib/featured-characters';
import { AuthButton } from '@/components/AuthButton';

type Race = {
  id: string;
  displayName: string;
  description: string;
};

type Character = {
  name: string;
  meaning: string;
  raceId: string;
  parts: Array<{ text: string; meaning: string }>;
  oc?: {
    class: string;
    personality: string[];
    background: string;
  };
  imageUrl?: string;
};

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [gender, setGender] = useState<string>('neutral');
  const [count, setCount] = useState<number>(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/generate/name')
      .then(res => res.json())
      .then(data => {
        setRaces(data.races);
        if (data.races.length > 0) {
          setSelectedRace(data.races[0].id);
        }
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedRace) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId: selectedRace, gender, count })
      });
      const data = await res.json();
      setCharacters(data.characters);
    } catch (error) {
      console.error('Failed to generate names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOC = async (index: number) => {
    const char = characters[index];

    // 显示加载状态
    const updated = [...characters];
    updated[index] = { ...updated[index], oc: { class: 'Loading...', personality: ['Loading...'], background: 'Generating character profile...' } };
    setCharacters(updated);

    try {
      const res = await fetch('/api/generate/oc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: char.name, race: char.raceId, gender })
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const finalUpdated = [...characters];
      finalUpdated[index] = { ...finalUpdated[index], oc: data.oc };
      setCharacters(finalUpdated);
    } catch (error) {
      console.error('Failed to generate OC:', error);
      alert(`Failed to generate character: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // 恢复到没有 OC 的状态
      const revertUpdated = [...characters];
      delete revertUpdated[index].oc;
      setCharacters(revertUpdated);
    }
  };

  const handleGenerateImage = async (index: number) => {
    const char = characters[index];
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: char.name, race: char.raceId, oc: char.oc })
      });
      const data = await res.json();
      const updated = [...characters];
      updated[index] = { ...updated[index], imageUrl: data.imageUrl };
      setCharacters(updated);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with Auth */}
        <div className="flex justify-end mb-8">
          <AuthButton />
        </div>

        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Elf Name Generator & OC Creator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Generate unique elf names and create original characters with AI-powered tools.
            Perfect for fantasy writers, RPG players, and worldbuilders.
          </p>
        </header>

        {/* Generator Tool Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 mb-12 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Generate Your Elf Name</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Race Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Race</label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {races.map(race => (
                  <option key={race.id} value={race.id}>{race.displayName}</option>
                ))}
              </select>
            </div>

            {/* Gender Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="neutral">Neutral</option>
                <option value="feminine">Feminine</option>
                <option value="masculine">Masculine</option>
              </select>
            </div>

            {/* Count Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedRace}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            {loading ? 'Generating...' : 'Generate Names'}
          </button>
        </div>

        {/* Results Section */}
        {characters.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Generated Characters</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char, idx) => (
                <div key={idx} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all">
                  {char.imageUrl && (
                    <div className="mb-4 h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center">
                      <div className="text-6xl">✨</div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2 text-purple-400">{char.name}</h3>
                  <p className="text-gray-300 mb-4">{char.meaning}</p>

                  {char.oc && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-purple-300 mb-1">Class: {char.oc.class}</p>
                      <p className="text-sm text-gray-400 mb-2">Personality: {char.oc.personality.join(', ')}</p>
                      <p className="text-xs text-gray-500">{char.oc.background}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-400">Name Parts:</p>
                    {char.parts.map((part, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-purple-300">{part.text}</span>
                        <span className="text-gray-500"> - {part.meaning}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(char.name)}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                    >
                      Copy Name
                    </button>
                    {!char.oc && (
                      <button
                        onClick={() => handleGenerateOC(idx)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                      >
                        Generate OC
                      </button>
                    )}
                    {char.oc && !char.imageUrl && (
                      <button
                        onClick={() => handleGenerateImage(idx)}
                        className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm transition-colors"
                      >
                        Generate Image
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Characters Gallery */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Elf Characters</h2>
          <p className="text-gray-400 mb-8">
            Explore our collection of unique elf names and characters. Each character is carefully crafted with rich backstories and meanings, perfect for your fantasy world, RPG campaign, or creative writing project.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCharacters.map((char) => (
              <article key={char.id} className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700 hover:border-purple-500 transition-all">
                <div className="h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <div className="text-6xl">✨</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-purple-400">{char.name}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-900/50 rounded-full">{char.race}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{char.meaning}</p>
                  <p className="text-gray-300 text-sm">{char.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold mb-4">About Elf Name Generator</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Our Elf Name Generator is a powerful tool designed for fantasy writers, RPG players, and worldbuilders. Generate authentic elf names inspired by various fantasy traditions including High Elves, Wood Elves, Dark Elves, Night Elves, and Blood Elves.
            </p>
            <p>
              Each generated name comes with its meaning and etymology, helping you create rich, believable characters for your fantasy world. Whether you're creating characters for Dungeons & Dragons, writing a fantasy novel, or building your own fictional universe, our generator provides unique and memorable elf names.
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4">Elf Race Types</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>High Elves:</strong> Noble and wise, masters of magic and ancient lore</li>
              <li><strong>Wood Elves:</strong> Swift and graceful, guardians of the ancient forests</li>
              <li><strong>Dark Elves:</strong> Cunning and ruthless, masters of shadow and deception</li>
              <li><strong>Night Elves:</strong> Mysterious and ancient, blessed by the moon and stars</li>
              <li><strong>Blood Elves:</strong> Elegant and proud, wielders of arcane power</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
