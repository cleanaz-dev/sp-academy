import { Lightbulb, MessageSquareDashed } from "lucide-react";

interface FreestyleSuggestionsPanelProps {
  suggestions: string[];
}

export function FreestyleSuggestionsPanel({ suggestions }: FreestyleSuggestionsPanelProps) {
  return (
    <div className="hidden w-1/4 min-w-[280px] max-w-[340px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:flex">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-5 py-4">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-gray-900">Suggestions</h3>
      </div>
      
      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5">
        <p className="mb-4 text-xs font-medium text-gray-500">
          Stuck on what to say? Try reading one of these out loud:
        </p>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <div 
              key={i}
              className="group flex cursor-default items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <MessageSquareDashed className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 group-hover:text-indigo-400" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}