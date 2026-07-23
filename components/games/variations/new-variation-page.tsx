'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Languages } from '@prisma/client';
import { Loader2 } from 'lucide-react';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// 1. Define the Props interface
interface Props {
  gameId: string;
  gameName: string;
}

export default function NewVariationPage({ gameId, gameName }: Props) {
  const router = useRouter();

  // 2. Form States
  const [language, setLanguage] = useState<string>('ENGLISH');
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
    <div className="p-6 mt-10">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Variation</CardTitle>
          <CardDescription className="text-base">
            For Base Game:{' '}
            <span className="font-semibold text-blue-600">{gameName}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Target Language Select */}
            <div className="space-y-2">
              <Label htmlFor="language">Target Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full bg-white">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {/* Convert Prisma Enum object to array to map over it */}
                  {Object.values(Languages).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {/* Optional: Format "ENGLISH" to "English" */}
                      {lang.charAt(0) + lang.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variation Theme/Name Input */}
            <div className="space-y-2">
              <Label htmlFor="variation">Variation Theme/Name</Label>
              <Input
                id="variation"
                type="text"
                value={variation}
                onChange={(e) => setVariation(e.target.value)}
                placeholder="e.g. Animals, Level 1"
                required
              />
            </div>

            {/* Count Input */}
            <div className="space-y-2">
              <Label htmlFor="count">Number of Rounds (Count)</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={100}
                required
              />
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
                  Generating & Saving...
                </>
              ) : (
                'Generate Variation via AI'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}