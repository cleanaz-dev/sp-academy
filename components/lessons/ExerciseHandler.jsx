// ExerciseHandler.jsx
"use client"
import ImageWordInput from './ImageWordInput';
import DragAndDrop from './DragAndDrop';
import FillInBlank from './FillInBlank';
import MatchingPairs from './MatchingPairs';
import AudioBased from './AudioBased';

const ExerciseHandler = ({ exercise, onComplete }) => {
  const exerciseComponents = {
    'image_word_input': ImageWordInput,
    'drag_and_drop': DragAndDrop,
    'fill_in_blank': FillInBlank,
    'matching_pairs': MatchingPairs,
    'audio_based': AudioBased,
  };

  const ExerciseComponent = exerciseComponents[exercise.type];

  if (!ExerciseComponent) {
    return <div>Unsupported exercise type: {exercise.type}</div>;
  }

  return <ExerciseComponent exercise={exercise} onComplete={onComplete} />;
};

export default ExerciseHandler;