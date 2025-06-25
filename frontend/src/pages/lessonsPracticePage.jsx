import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaClock, FaHighlighter } from 'react-icons/fa'; // Added FaHighlighter
import api from '../api.js';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useProfile } from '@/profileContext.jsx';
import { queryClient } from '@/queryClient.jsx';

// --- Sample Lesson Data (no changes here) ---

const lessonsContent = {
    default: {
      title: "Practice Session",
      estimatedTime: "3 minutes",
      phraseSpanish: "¡Hola! ¿Cómo estás?",
      phraseEnglish: "Hello! How are you?",
    },
    'vowels-a-words': {
      title: 'Lesson: Vowel "A" - Words',
      estimatedTime: "2 minutes",
      phraseSpanish: "mapa ",
      phraseEnglish: "map",
    },
    'vowels-a-simple_sentences': {
      title: 'Lesson: Vowel "A" - Simple Sentences',
      estimatedTime: "4 minutes",
      phraseSpanish: "La gata va a la casa.",
      phraseEnglish: "The cat goes to the house.",
    },
    'consonants-soft-words': {
      title: 'Lesson: Soft Consonants - Words',
      estimatedTime: "3 minutes",
      phraseSpanish: "ceci cine zapato",
      phraseEnglish: "ceci cinema shoe",
    },
    'consonants-soft-sentences': {
      title: 'Lesson: Soft Consonants - Sentences',
      estimatedTime: "5 minutes",
      phraseSpanish: "El cielo es azul y el sol brilla.",
      phraseEnglish: "The sky is blue and the sun shines.",
    },
    'consonants-hard-words': {
      title: 'Lesson: Hard Consonants - Words',
      estimatedTime: "3 minutes",
      phraseSpanish: "perro gato zapato",
      phraseEnglish: "dog cat shoe",
    },
    'consonants-hard-sentences': {
      title: 'Lesson: Hard Consonants - Sentences',
      estimatedTime: "5 minutes",
      phraseSpanish: "El perro corre rápido.",
      phraseEnglish: "The dog runs fast.",
    },
    'consonants-combos-words': {
      title: 'Lesson: Hard Consonants - Vowel-Consonant Combos',
      estimatedTime: "4 minutes",
      phraseSpanish: "perro gato zapato",
      phraseEnglish: "dog cat shoe",
    },
    'consonants-combos-sentences': {
      title: 'Lesson: Hard Consonants - Vowel-Consonant Combos',
      estimatedTime: "4 minutes",
      phraseSpanish: "perro gato zapato",
      phraseEnglish: "dog cat shoe",
    },
  };

function LessonsPracticePage() {

  const [user] = useAuthState(auth);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const topic = searchParams.get('topic');
  const lesson = searchParams.get('lesson');
  const level = searchParams.get('level');
  
  const lessonKey = topic && lesson && level ? `${topic}-${lesson}-${level}` : 'default';
  const currentLessonData = lessonsContent[lessonKey] || lessonsContent.default;
  const { title: lessonTitle, estimatedTime, phraseSpanish, phraseEnglish } = currentLessonData;

  // UPDATED: State is now for any selected text, not just a single word
  const [selectedText, setSelectedText] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");

  const [practiced, setPracticed] = useState(false)
  const { setProfile } = useProfile()


  useEffect(() => {
    // Reset selection when the phrase changes
    setSelectedText(null);
  }, [phraseSpanish]);
  
  // NEW: This function captures and cleans the user's highlighted text
  const handleCaptureSelection = () => {
    const selection = window.getSelection().toString();
    if (selection) {
      // Regex to remove punctuation (anything not a letter, number, or whitespace)
      // Also includes Spanish characters like á, é, í, ó, ú, ñ, ü
      const cleanedText = selection
        .replace(/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúñÑüÜ]/gi, '')
        .trim();
      
      if (cleanedText) {
        console.log("Captured for practice:", cleanedText);
        setSelectedText(cleanedText);
      }
    }
  };

  const sendAudioToServer = (blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      const payload = { base64_data: base64data };
      fetch("http://localhost:8080/sendVoiceNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to send voice note");
        return response.text();
      })
      .then(transcript => {
        setTranscription(transcript);
      })
      .catch(error => console.error("Error sending audio:", error));
    };
    reader.readAsDataURL(blob);
  };

  const handleAudioRecording = async (blob) => {
    setRecordedAudio(blob);
    sendAudioToServer(blob);
    setPracticed(true)
  
    let activity = `Practiced ${topic} lesson ${lesson}, at ${level} difficulty.`;
    activity = activity.replace(/_/g, " ");
    
    if(!practiced) {
      console.log(activity)
      try {
        // Store attempt in activity history.
        await api.patch(`/updateActivityHistory?uid=${user.uid}&activity=${activity}`)
        // Update activity history in profile context.
        setProfile(prev => {
          let cur = [...prev.activities];
          while (cur.length >= 3) {
            cur.shift();
          }
          cur.push(activity)
        // Update the local storage to reflect the new activity added.
          queryClient.setQueryData(['profile', user.uid], (old) => {
            return {...old, activities: cur};
          });

          return { ...prev, 
            activities: cur }
        })
      } catch (error) {
        console.log(error)
      }
  }
  };

  const handleFinishAndNext = () => {
    if (topic && lesson && level) {
      const savedSelections = localStorage.getItem('lessonSelections');
      const selections = savedSelections ? JSON.parse(savedSelections) : {};
      const currentTopicProgress = selections[topic] || {};
      const completedCombos = currentTopicProgress.completedCombinations || {};
      const comboKey = `${lesson}-${level}`;
      const updatedSelections = {
        ...selections,
        [topic]: {
          ...currentTopicProgress,
          currentLesson: lesson, 
          currentLevel: level,
          completedCombinations: {
            ...completedCombos,
            [comboKey]: true,
          }
        }
      };
      localStorage.setItem('lessonSelections', JSON.stringify(updatedSelections));
    }
    navigate('/lessons');
  };

  const handlePrevious = () => {
    navigate(-1);
  };

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
            {/* --- Updated Interactive Highlighting Section --- */}
            <div className="text-center w-full">
              {/* This allows free-form text selection */}
              <p className="text-3xl md:text-4xl font-bold text-black mb-3 select-text">
                {phraseSpanish}
              </p>
              <p className="text-base text-muted-foreground mb-4">{phraseEnglish}</p>

              {/* Button to capture the highlighted text */}
              <Button onClick={handleCaptureSelection} variant="outline" size="sm">
                <FaHighlighter className="mr-2 h-4 w-4" />
                Practice Highlighted Text
              </Button>
            </div>

            {/* Recorder */}
            <AudioRecorder onRecordingComplete={handleAudioRecording} />

            {/* Feedback Field now uses selectedText */}
            <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
              <p className="text-sm text-muted-foreground">
                {selectedText
                  ? `Now practicing: "${selectedText}". Record your pronunciation.`
                  : recordedAudio
                    ? transcription || "[Transcription processing...]"
                    : "Highlight text and click 'Practice' to begin."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="w-full max-w-3xl mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <FaArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {/* TEMP: Made next button into the Finish Lesson for testing. */}
          <Button variant="outline" onClick={handleFinishAndNext}>
            Finish Lesson <FaArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LessonsPracticePage;