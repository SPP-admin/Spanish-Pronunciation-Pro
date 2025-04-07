import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"; 
import { FaMicrophone, FaStop, FaPlay } from "react-icons/fa";

function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    // --- Recording Logic ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
       mediaRecorderRef.current.ondataavailable = (event) => {
         if (event.data.size > 0) { audioChunksRef.current.push(event.data); }
       };
       mediaRecorderRef.current.onstop = () => {
         const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
         setAudioBlob(blob);
         if (onRecordingComplete) { onRecordingComplete(blob); }
         audioChunksRef.current = [];
         stream.getTracks().forEach(track => track.stop());
       };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
       console.error("Mic access error:", err);
       // Add user feedback for permission errors
    }
    // --- End of Core Recording Logic ---
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
      if (audioBlob) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(audioUrl); 
      }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        variant="outline"
        size="icon"
        className="rounded-full w-16 h-16 border-2 border-primary hover:bg-primary/10 data-[recording=true]:bg-red-100 data-[recording=true]:border-red-500"
        data-recording={isRecording}
      >
        {isRecording ? <FaStop className="h-6 w-6 text-red-500" /> : <FaMicrophone className="h-6 w-6 text-primary" />}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isRecording ? 'Recording...' : 'Tap microphone to record'}
      </p>

      {audioBlob && (
        <Button
          onClick={playRecording}
          variant="secondary"
          size="sm"
        
          className="hover:bg-secondary/80 hover:opacity-100 transition-colors duration-150" // Example hover effects
        >
          <FaPlay className="mr-2 h-4 w-4" /> Play Recording
        </Button>
      )}
    </div>
  );
}

export default AudioRecorder;