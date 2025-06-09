import React, { useState } from 'react';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaClock } from 'react-icons/fa';

function LessonsPracticePage() {
  const lessonTitle = "Lesson 1: Basic Greetings";
  const estimatedTime = "3 minutes";
  const phraseSpanish = "¡Hola! ¿Cómo estás?";
  const phraseEnglish = "Hello! How are you?";
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");

  const sendAudioToServer = (blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the data URL header to get only the base64 string.
      const base64data = reader.result.split(",")[1];
  
      // Build the JSON payload.
      const payload = { base64_data: base64data };
  
      fetch("http://localhost:8080/sendVoiceNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to send voice note");
          }
          return response.text();
        })
        .then(transcript => {
          console.log("Transcription:", transcript);
          setTranscription(transcript);
        })
        .catch(error => console.error("Error sending audio:", error));
    };
    reader.readAsDataURL(blob);
  };
  

  // This function is passed as callback to the AudioRecorder component.
  const handleAudioRecording = (blob) => {
    console.log("Audio blob captured:", blob);
    setRecordedAudio(blob);
    // Send the blob to the backend for processing.
    sendAudioToServer(blob);
  };

  const handleNext = () => console.log("Next");
  const handlePrevious = () => console.log("Previous");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col items-center">
        {/* Lesson Header */}
        <div className="w-full max-w-3xl mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{lessonTitle}</h1>
          <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
            <FaClock className="mr-1.5" />
            <span>{estimatedTime}</span>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-6 md:p-8 flex flex-col items-center space-y-6">
            {/* Phrases */}
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{phraseSpanish}</p>
              <p className="text-base text-muted-foreground">{phraseEnglish}</p>
            </div>

            {/* Recorder */}
            <AudioRecorder onRecordingComplete={handleAudioRecording} />

            {/* Feedback Field */}
            <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
              <p className="text-sm text-muted-foreground">
                {recordedAudio
                  ? transcription || "[Transcription processing…]"
                  : "Record your pronunciation using the microphone."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="w-full max-w-3xl mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <FaArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNext}>
            Next <FaArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LessonsPracticePage;
