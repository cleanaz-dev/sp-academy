export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Simple speak function using Web Speech API
export const speakPhrase = (text: string): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Adjust language as needed
    window.speechSynthesis.speak(utterance);
  } else {
    console.log('Speech synthesis not supported');
  }
};

export const cn = (...classes: (string | false | null | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};