'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, GameDifficulty, GameContext } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// 1. Define the Game type based on what we selected in the action
interface GameProps {
  id: string;
  title: string;
  type: string;
  imageUrl: string | null;
  contexts: GameContext[];
}

interface Props {
  game: GameProps;
}

export default function NewVariationPage({ game }: Props) {
  const router = useRouter();

  // 2. Form States
  const [language, setLanguage] = useState<string>('ENGLISH');
  const [difficulty, setDifficulty] = useState<string>('EASY');
  const [variation, setVariation] = useState('Default');
  const [count, setCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 3. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/games/${game.id}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language, 
          difficulty, 
          variation, 
          count 
        }),
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
    <div className="p-6 mt-10">
      <Card className="max-w-2xl mx-auto shadow-md">
        
        {/* Header Section with Image and Game Info */}
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Create Variation</CardTitle>
            <CardDescription className="text-base flex flex-col gap-2 pt-1">
              <span>
                For Base Game:{' '}
                <span className="font-semibold text-blue-600">{game.title}</span>
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="secondary">{game.type}</Badge>
                {game.contexts.map((ctx) => (
                  <Badge key={ctx} variant="outline" className="text-xs">
                    {ctx.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardDescription>
          </div>

          {/* Render Game Image if it exists */}
          {game.imageUrl && (
            <div className="relative w-24 h-24 rounded-md overflow-hidden shrink-0 border">
              <Image 
                src={game.imageUrl} 
                alt={game.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Language Select */}
              <div className="space-y-2">
                <Label htmlFor="language">Target Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="w-full bg-white">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Languages).map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0) + lang.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Select */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="w-full bg-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GameDifficulty).map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff.charAt(0) + diff.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Variation Theme/Name Input */}
            <div className="space-y-2">
              <Label htmlFor="variation">Variation Theme/Name</Label>
              <Input
                id="variation"
                type="text"
                value={variation}
                onChange={(e) => setVariation(e.target.value)}
                placeholder="e.g. Animals, Past Tense Verbs"
                required
              />
            </div>

            {/* Count Input */}
            <div className="space-y-2">
              <Label htmlFor="count">Iterations (Count)</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={10} // Capped at 10 based on your logic
                required
              />
              <p className="text-xs text-gray-500">Maximum of 10 iterations per variation.</p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating via AI...
                </>
              ) : (
                'Generate Variation'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}