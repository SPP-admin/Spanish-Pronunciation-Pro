import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import { FaMicrophone, FaStop, FaPlay } from "react-icons/fa";

function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Ref to manage playback and prevent overlapping audio
  const activeAudioRef = useRef(null);

  // Cleanup audio on unmount to prevent ghost sounds
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

 /* const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = []; 
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) { audioChunksRef.current.push(event.data); }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (onRecordingComplete) { onRecordingComplete(blob); }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };*/

  const getSupportedMimeType = () => {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
  
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  
    return '';
  };
  
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
  
      const mimeType = getSupportedMimeType();
  
      mediaRecorderRef.current = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
  
      console.log("Recorder mimeType:", mediaRecorderRef.current.mimeType);
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorderRef.current.onstop = () => {
        const actualType =
          mediaRecorderRef.current?.mimeType ||
          audioChunksRef.current?.[0]?.type ||
          'audio/webm';
  
        const blob = new Blob(audioChunksRef.current, { type: actualType });
  
        console.log("Final blob type:", blob.type);
        console.log("Final blob size:", blob.size);
  
        setAudioBlob(blob);
  
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
  
        stream.getTracks().forEach(track => track.stop());
      };
  
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };



  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      // If something is already playing, stop it immediately
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        activeAudioRef.current = null;
      };
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      <div className="relative">
        {/* Recording Pulse - Gold Tint */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-[var(--brand-gold)] opacity-20 animate-ping" />
        )}

        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          variant="outline"
          size="icon"
          className={`relative z-10 rounded-full w-20 h-20 border-2 transition-all duration-300 bg-transparent
            ${isRecording 
              ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
              : 'border-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
            }`}
        >
          {isRecording ? (
            <FaStop className="h-8 w-8 text-red-500" />
          ) : (
            <FaMicrophone className="h-8 w-8 text-[var(--brand-gold)]" />
          )}
        </Button>
      </div>

      <p className="text-xs font-bold tracking-widest text-[var(--text-main)] opacity-60 uppercase">
        {isRecording ? 'Listening...' : 'Tap to Practice'}
      </p>

      {/* Playback Button - Anti-Grey Glassmorphism */}
      {audioBlob && (
        <Button
          onClick={playRecording}
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--bg-card), transparent 85%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)' 
          }}
          className="border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)]/30 rounded-full px-8 py-2 transition-all flex items-center shadow-lg"
        >
          <FaPlay className="mr-2 h-3 w-3 text-[var(--brand-gold)]" /> 
          <span className="text-sm font-semibold tracking-wide">Review Attempt</span>
        </Button>
      )}
    </div>
  );
}

export default AudioRecorder;