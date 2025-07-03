import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaClock, FaHighlighter } from 'react-icons/fa'; // Added FaHighlighter
import api from '../api.js';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';

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

const API_URL = import.meta.env.VITE_API_URL;

function LessonsPracticePage() {

  const [user] = useAuthState(auth);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const topic = searchParams.get('topic');
  const lesson = searchParams.get('lesson');
  const level = searchParams.get('level');

  const lessonKey = topic && lesson && level ? `${topic}-${lesson}-${level}` : 'default';
  const currentLessonData = lessonsContent[lessonKey] || lessonsContent.default;
  const { title: lessonTitle, estimatedTime, phraseSpanish, phraseEnglish } = currentLessonData;

  // State is now for any selected text, not just a single word
  const [selectedText, setSelectedText] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");

  const [practiced, setPracticed] = useState(false)

  const [spanishSentence, setSpanishSentence] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const lastParams = useRef({ topic: null, lesson: null, level: null });

  useEffect(() => {
    // Reset selection when the phrase changes
    setSelectedText(null);
  }, []);

  useEffect(() => {
    if (
      topic &&
      lesson &&
      level &&
      (topic !== lastParams.current.topic || lesson !== lastParams.current.lesson || level !== lastParams.current.level)
    ) {
      const fetchSentenceAndTranslation = async () => {
        setLoading(true);
        setSpanishSentence("");
        setEnglishTranslation("");
        try {
          const res = await fetch(
            `${API_URL}/generateSentence?chunk=${topic}&lesson=${lesson}&difficulty=${level}`,
            { method: "POST" }
          );
          let data = await res.text();
          data = data.replace(/^"|"$/g, "");
          setSpanishSentence(data);
        } catch (err) {
          setSpanishSentence("Error generating sentence.");
          setEnglishTranslation("");
        }
        setLoading(false);
      };
      fetchSentenceAndTranslation();
      lastParams.current = { topic, lesson, level };
    }
  }, [topic, lesson, level]);

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
  
      // Build the JSON payload.
      const generatedSentence = selectedText ? selectedText: spanishSentence;
      const payload = { base64_data: base64data, sentence: generatedSentence};
      console.log(payload)
      fetch(`${API_URL}/checkPronunciation`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      })
        .then(response => {
          if (!response.ok) {
            console.log(response.statusText);
            throw new Error("Failed to send voice note");
          }
          return response.text();
        })
        .then(transcript => {
          let html = "";
          console.log("Transcription:", transcript);
          let parsedTranscript = decodeURI(JSON.parse(transcript));
          console.log("Parsed Transcript", parsedTranscript);
          const arr = parsedTranscript.split(",");
          for (let i = 0; i < arr.length; i++) {
            if (arr[i+1] == "true") {
              html += `<span style="color:green">${arr[i]}</span>`;
            }
            else {
              html += `<span style="color:red">${arr[i]}</span>`;
            }
            i++;
          }
          console.log(html);
          document.getElementById("transcriptionBox").innerHTML = html;
        })
        .catch(error => console.error("Error sending audio:", error));
    };
    reader.readAsDataURL(blob);
  };
  // This function is passed as callback to the AudioRecorder component.
  const handleAudioRecording = async (blob) => {
    console.log("Audio blob captured:", blob);
    setRecordedAudio(blob);
    sendAudioToServer(blob);
    setPracticed(true)
  
    let activity = `Practiced ${topic} lesson ${lesson}, at ${level} difficulty!`;
    if(!practiced) {
      console.log(activity)
      try {
        await api.patch(`/updateActivityHistory?uid=${user.uid}&activity=${activity}`)

      } catch (error) {
        console.log(error)
      }
  }
  };

  const handleFinishAndNext = () => {

    setShowConfetti(true);

    // Save the current lesson and level to localStorage
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

    setTimeout(() => {
      setShowConfetti(false);
      navigate('/lessons');
    }, 5000); // Confetti length
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showConfetti && <Confetti />}
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
            <div className="text-center w-full">
              {/* This allows free-form text selection */}
              <p className="text-3xl md:text-4xl font-bold text-black mb-3 select-text">
                {loading ? "Loading..." : spanishSentence}
              </p>
              {/* <p className="text-base text-muted-foreground mb-4">
                {loading ? "" : englishTranslation}
              </p> */}

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
                  : "Practice this word/sentence, or highlight text and click 'Practice' to begin."}
              </p>
            </div>
			{/* Extra feedback field */}
			<div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
              <p className="text-sm text-muted-foreground" id="transcriptionBox">
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="w-full max-w-3xl mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <FaArrowLeft className="mr-2 h-4 w-4" /> End Practice
          </Button>
          {/*  Made next button into the Finish Lesson for testing. */}
          <Button variant="outline" onClick={handleFinishAndNext}>
            Next Lesson <FaArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LessonsPracticePage;