import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuggestions } from './hooks';

export const SuggestionsPanel = ({ 
  conversationHistory,
  speakPhrase,
  usePhrase 
}) => {
  const {
    suggestions,
    isLoading: isLoadingSuggestions,
    error,
    getSuggestions,
  } = useSuggestions(conversationHistory);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Suggested Responses
        </h4>
        <Button
          size="sm"
          variant="outline"
          onClick={getSuggestions}
          disabled={isLoadingSuggestions || conversationHistory.length === 0}
          className="flex items-center gap-2"
          aria-label="Get Suggestions"
        >
          {isLoadingSuggestions ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Get Suggestions
            </>
          )}
        </Button>
      </div>

      {error && (
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={getSuggestions}
            className="absolute right-2 top-2"
            aria-label="Retry getting suggestions"
          >
            Retry
          </Button>
        </div>
      )}

      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex rounded-lg bg-purple-50 p-3 shadow-inner shadow-purple-100 transition-colors duration-200 hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-600 md:text-sm">
                      {suggestion.targetLanguage}
                    </p>
                    <p className="text-xs italic text-gray-600">
                      {suggestion.nativeLanguage}
                    </p>
                  </div>
                  <div className="flex gap-2 self-start">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speakPhrase(suggestion.targetLanguage)}
                      className="p-1 text-gray-600 transition-colors hover:text-purple-600"
                      title="Listen to pronunciation"
                      aria-label={`Listen to ${suggestion.targetLanguage}`}
                    >
                      🔊
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => usePhrase(suggestion.targetLanguage)}
                      className="p-1 text-gray-600 transition-colors hover:text-purple-600"
                      title="Use in conversation"
                      aria-label={`Use ${suggestion.targetLanguage} in conversation`}
                    >
                      💬
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">
          {isLoadingSuggestions
            ? "Loading suggestions..."
            : "No suggestions available."}
        </div>
      )}
    </div>
  );
};