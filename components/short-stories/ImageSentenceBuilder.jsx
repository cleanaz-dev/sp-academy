// components/short-stories/ImageSentenceBuilder.jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

export default function ImageSentenceBuilder({ exercise, onAnswer, showResults }) {
  const [sentence, setSentence] = useState("");
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = () => {
    onAnswer(exercise.id, sentence);
  };

  const validateSentence = (input) => {
    // Check if the sentence contains the expected elements
    return exercise.expectedElements.every(element => 
      input.toLowerCase().includes(element.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img
          src={exercise.imageUrl || "/placeholder-image.jpg"}
          alt="Scene to describe"
          className="w-full h-64 object-cover"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">
          {exercise.question}
        </h3>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Write your sentence in French..."
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            className="w-full p-3"
          />

          <Button
            onClick={() => setShowHints(!showHints)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{showHints ? "Hide Hints" : "Show Hints"}</span>
          </Button>
        </div>

        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-purple-50 rounded-lg"
          >
            <h4 className="font-medium mb-2">Vocabulary Hints:</h4>
            <ul className="list-disc list-inside space-y-1">
              {exercise.vocabularyHints.map((hint, index) => (
                <li key={index} className="text-gray-600">{hint}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`p-4 rounded-lg ${
              validateSentence(sentence) ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="space-y-2">
              {validateSentence(sentence) ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Great job! Your sentence includes all required elements.</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p>Your sentence is missing some elements.</p>
                    <p className="mt-2">Sample correct sentence:</p>
                    <p className="font-medium">{exercise.sampleCorrectSentence}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}