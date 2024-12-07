// components/audio-recorder.jsx
'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const AudioRecorder = ({ storyId, storyText, onAssessmentComplete }) => {
  // State management
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Refs
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      chunksRef.current = [] // Reset chunks
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        
        if (blob.size === 0) {
          toast.error('No audio recorded')
          return
        }

        try {
          setIsProcessing(true)
          toast.loading('Processing audio...')

          // Create FormData for upload
          const formData = new FormData()
          formData.append('audio', blob, `story-${storyId}.wav`)
          formData.append('storyId', storyId)

          // Upload to S3 via API route
          const uploadResponse = await fetch('/api/upload-assessment-audio', {
            method: 'POST',
            body: formData
          })

          const uploadResult = await uploadResponse.json()

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Upload failed')
          }

          // Trigger assessment
          const assessmentResponse = await fetch('/api/assess-pronunciation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              audioUrl: uploadResult.url, 
              storyText,
              storyId 
            })
          })

          if (!assessmentResponse.ok) {
            throw new Error('Assessment failed')
          }

          const assessment = await assessmentResponse.json()
          
          // Call parent component's callback
          if (onAssessmentComplete) {
            onAssessmentComplete(assessment)
          }

          toast.success('Assessment completed!')

        } catch (error) {
          console.error('Processing error:', error)
          toast.dismiss() // Remove the processing toast
          toast.error(`Error: ${error.message}`)
        } finally {
          setIsProcessing(false)
        }
      }

      // Start recording
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Recording start error:', error)
      toast.error('Failed to start recording')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      clearInterval(timerRef.current)
      setIsRecording(false)
      setRecordingTime(0)
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  // Time formatting
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-6 w-full max-w-sm mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {isRecording ? 'Recording...' : 'Ready to record'}
          </span>
          <span className="text-sm font-mono">
            {formatTime(recordingTime)}
          </span>
        </div>

        <Progress 
          value={isRecording ? (recordingTime / 60) * 100 : 0} 
          className="w-full"
        />

        <div className="flex justify-center">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : isRecording ? (
              "Stop Recording"
            ) : (
              "Start Recording"
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AudioRecorder