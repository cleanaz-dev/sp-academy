import React, { useState, useRef } from 'react';

// Language map for the kids (Deepgram & Azure both use these codes)
const LANGUAGES = {
  'en-US': '🇺🇸 English',
  'fr-FR': '🇫🇷 French',
  'es-ES': '🇪🇸 Spanish',
};

// Drop this inside your existing <Modal> or whatever you currently use
export default function JournalSpeechCapture() {
  const [language, setLanguage] = useState('en-US');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dgSocketRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    setTranscript('');
    audioChunksRef.current = [];
    
    // 1. Get Mic Access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    
    // 2. Deepgram Live Transcript
    // (If you already have a <DeepgramClient /> or hook, use that instead of raw WS)
    const socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?language=${language}&punctuate=true&interim_results=true`,
      ['Token', 'YOUR_DEEPGRAM_KEY'] // TODO: Swap with your existing auth/token method
    );
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const words = data.channel?.alternatives?.[0]?.transcript;
      if (words) setTranscript(words); // Teleprompter style: just show latest
    };
    dgSocketRef.current = socket;
    
    // 3. MediaRecorder to capture raw audio blob for later Lambda POST
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Close Deepgram
    if (dgSocketRef.current) dgSocketRef.current.close();
    
    // Stop tracks & build blob
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // TODO: POST to your Lambda (Lambda will handle S3 + Azure Pronunciation Score)
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // formData.append('transcript', transcript);
      // formData.append('language', language);
      // fetch('/api/your-lambda-endpoint', { method: 'POST', body: formData });
      
      console.log('Ready for Lambda:', { audioBlob, transcript, language });
    };
  };

  return (
    <div className="kid-journal-content">
      {/* Language Picker */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
        {Object.entries(LANGUAGES).map(([code, label]) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            style={{
              fontSize: '1.5rem',
              padding: '10px 20px',
              borderRadius: '12px',
              border: language === code ? '3px solid #4CAF50' : '1px solid #ccc',
              background: language === code ? '#e8f5e9' : 'white',
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Live Transcript (Teleprompter) */}
      <div 
        style={{
          minHeight: '120px',
          fontSize: '2rem',
          textAlign: 'center',
          padding: '20px',
          border: '2px dashed #eee',
          borderRadius: '16px',
          margin: '0 20px 20px',
        }}
      >
        {transcript || (isRecording ? 'Listening...' : 'Press record to start your journal!')}
      </div>

      {/* CSS Visualizer */}
      {isRecording && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', height: '30px', marginBottom: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              style={{
                width: '6px',
                background: '#4CAF50',
                borderRadius: '3px',
                animation: `bounce 0.5s infinite alternate ${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {!isRecording ? (
          <button onClick={startRecording} style={btn('#f44336')}>🔴 Record</button>
        ) : (
          <button onClick={stopRecording} style={btn('#2196F3')}>⏹ Stop & Save</button>
        )}
      </div>
      
      <style>{`@keyframes bounce { from { height: 10px; } to { height: 30px; } }`}</style>
    </div>
  );
}

const btn = (bg) => ({
  fontSize: '1.5rem',
  padding: '12px 30px',
  color: 'white',
  background: bg,
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer'
});

