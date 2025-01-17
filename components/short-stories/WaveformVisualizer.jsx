// components/WaveformVisualizer.jsx
'use client';

import { useRef, useEffect } from 'react';
import { Card } from '../ui/card';

export function WaveformVisualizer({ isRecording, volume = 0 }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    let mounted = true;
  
    if (isRecording) {
      startVisualization();
    } else {
      stopVisualization();
    }
  
    return () => {
      mounted = false;
      stopVisualization();
    };
  }, [isRecording]);

  const startVisualization = async () => {
    try {

      stopVisualization();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      
      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        
        // Clear canvas with gradient background
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(1, '#e0f2fe');
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#0284c7'; // Sky blue color
        canvasCtx.beginPath();
        
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArrayRef.current[i] / 128.0;
          const y = v * canvas.height / 2;
          
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          
          x += sliceWidth;
        }
        
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

        // Add volume indicator
        const rms = calculateRMS(dataArrayRef.current);
        drawVolumeIndicator(canvasCtx, canvas.width, canvas.height, rms);
      };
      
      draw();
    } catch (error) {
      console.error('Error starting visualization:', error);
    }
  };

  const calculateRMS = (dataArray) => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / dataArray.length);
  };

  const drawVolumeIndicator = (ctx, width, height, volume) => {
    const indicatorWidth = 20;
    const indicatorHeight = height * 0.8;
    const x = width - indicatorWidth - 10;
    const y = height * 0.1;
    
    // Draw background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(x, y, indicatorWidth, indicatorHeight);
    
    // Draw volume level
    const volumeHeight = Math.min(volume * indicatorHeight * 2, indicatorHeight);
    const gradient = ctx.createLinearGradient(x, y + indicatorHeight, x, y);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.6, '#eab308');
    gradient.addColorStop(1, '#ef4444');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      x,
      y + indicatorHeight - volumeHeight,
      indicatorWidth,
      volumeHeight
    );
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null; // Reset the ref
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().then(() => {
        audioContextRef.current = null; // Reset the ref
      }).catch(error => {
        console.error('Error closing AudioContext:', error);
      });
    }
  };

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-lg"
        width={800}
        height={128}
      />
    </Card>
  );
}