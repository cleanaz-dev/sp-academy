"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Code2, Loader2 } from "lucide-react";
import { patchGameCode } from "@/lib/actions";

interface GameCodeModalProps {
  gameId: string;
  gameTitle: string;
  currentCode?: string | null;
}

export default function GameCodeModal({ gameId, gameTitle, currentCode }: GameCodeModalProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(currentCode || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!code.trim()) return;
    
    setIsSaving(true);
    try {
      await patchGameCode(gameId, code);
      setOpen(false); // Close modal on success
    } catch (error) {
      console.error(error);
      alert("Failed to save code. Check console.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}
      >
      <DialogTrigger asChild>
        <Button variant={currentCode ? "outline" : "default"} className="w-full text-xs">
          <Code2 className="mr-2 h-3.5 w-3.5" />
          {currentCode ? "Edit TSX Code" : "Paste TSX Code"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Attach Code to {gameTitle}</DialogTitle>
          <DialogDescription>
            Paste your raw React/TSX component code here. The AI will read this code to understand how to generate compatible content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`export default function ${gameTitle.replace(/\s+/g, '')}Game() {\n  // Your game logic here...\n}`}
            className="min-h-[400px] font-mono text-xs bg-slate-950 text-emerald-400"
            spellCheck={false}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !code.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Code Engine"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}