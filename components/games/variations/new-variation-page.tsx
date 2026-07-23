'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, GameDifficulty, GameContext } from '@prisma/client';
import { 
  Loader2, 
  ArrowLeft, 
  Sparkles, 
  Settings2, 
  BookOpen, 
  ImageIcon, 
  Gamepad2,
  Wand2
} from 'lucide-react';
import Image from 'next/image';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/card';

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

  // Form States
  const [language, setLanguage] = useState<string>('ENGLISH');
  const [difficulty, setDifficulty] = useState<string>('EASY');
  const [variation, setVariation] = useState('');
  const [count, setCount] = useState(10);
  
  // AI Directives State
  const [generateImages, setGenerateImages] = useState<boolean>(
    game.contexts.includes('IMAGES')
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Submit Handler
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
          variation: variation || 'Default', // Fallback if somehow empty
          count,
          generateImages 
        }),
      });

      if (!res.ok) throw new Error('Failed to generate variation. Please try again.');
      router.push('/admin/games');
    } catch (err: any) {
      setError(err.message || 'Generation failed. Check API logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* 1. TOP BAR / PAGE HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push('/admin/games')}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" /> 
            Generate AI Variation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure parameters to dynamically generate tailored learning content for your game.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-muted overflow-hidden">
        
        {/* 2. BASE GAME BANNER (Provides context to the admin) */}
        <div className="bg-muted/30 border-b p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          {game.imageUrl ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border shadow-sm bg-white">
              <Image 
                src={game.imageUrl} 
                alt={game.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl shrink-0 border shadow-sm bg-gray-100 flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-gray-400" />
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Target Game</p>
            <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge className="bg-blue-600 hover:bg-blue-700">{game.type.replace('_', ' ')}</Badge>
              {game.contexts.map((ctx) => (
                <Badge key={ctx} variant="outline" className="bg-white">
                  {ctx.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 3. THE FORM */}
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION: CONFIGURATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Settings2 className="w-5 h-5 text-gray-500" />
                <h3>Core Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-7">
                
                {/* Language Select */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-semibold text-gray-700">Target Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full bg-white transition-all focus:ring-2 focus:ring-blue-600">
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
                  <p className="text-xs text-muted-foreground">The language the AI will use to generate the content.</p>
                </div>

                {/* Difficulty Select */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="w-full bg-white transition-all focus:ring-2 focus:ring-blue-600">
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
                  <p className="text-xs text-muted-foreground">Impacts vocabulary complexity and distractor logic.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* SECTION: CONTENT DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <h3>Content Generation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-7">
                
                {/* Theme Input */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="variation" className="text-sm font-semibold text-gray-700">Variation Theme / Topic</Label>
                  <Input
                    id="variation"
                    type="text"
                    value={variation}
                    onChange={(e) => setVariation(e.target.value)}
                    placeholder="e.g. Summer Clothing, Past Tense Verbs..."
                    className="bg-white transition-all focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Be descriptive. This directly guides the AI's generation focus.</p>
                </div>

                {/* Count Input */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="count" className="text-sm font-semibold text-gray-700">Iterations (Rounds)</Label>
                  <Input
                    id="count"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="bg-white transition-all focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Max 10 rounds per variation to ensure optimal performance.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* SECTION: AI DIRECTIVES (Media) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                <h3>Media Directives</h3>
              </div>
              <div className="pl-0 md:pl-7">
                <div className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm transition-all hover:bg-gray-50">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-gray-900">Generate Visual Context (Images)</Label>
                    <p className="text-sm text-gray-500 max-w-md">
                      When enabled, the AI will generate image prompts or URLs required for visual-based learning in this variation.
                    </p>
                  </div>
                  <Switch
                    checked={generateImages}
                    onCheckedChange={setGenerateImages}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Variation...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Generate AI Variation
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}