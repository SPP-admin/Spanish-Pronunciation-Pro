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
import { useProfile } from '@/profileContext.jsx';


import { lessonCategories } from '@/lessonCategories.js';
import { completionRequirements } from '@/lessonCategories.js';

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
    'consonants-soft_consonants-words': {
      title: 'Lesson: Soft Consonants - Words',
      estimatedTime: "3 minutes",
      phraseSpanish: "ceci cine zapato",
      phraseEnglish: "ceci cinema shoe",
    },
    'consonants-soft_consonants-sentences': {
      title: 'Lesson: Soft Consonants - Sentences',
      estimatedTime: "5 minutes",
      phraseSpanish: "El cielo es azul y el sol brilla.",
      phraseEnglish: "The sky is blue and the sun shines.",
    },
    'consonants-hard_consonants-words': {
      title: 'Lesson: Hard Consonants - Words',
      estimatedTime: "3 minutes",
      phraseSpanish: "perro gato zapato",
      phraseEnglish: "dog cat shoe",
    },
    'consonants-hard_consonants-sentences': {
      title: 'Lesson: Hard Consonants - Sentences',
      estimatedTime: "5 minutes",
      phraseSpanish: "El perro corre rápido.",
      phraseEnglish: "The dog runs fast.",
    },
    'consonants-vowel_consonant_combos-words': {
      title: 'Lesson: Vowel-Consonant Combos - Words',
      estimatedTime: "4 minutes",
      phraseSpanish: "perro gato zapato",
      phraseEnglish: "dog cat shoe",
    },
    'consonants-vowel_consonant_combos-sentences': {
      title: 'Lesson: Vowel-Consonant Combos - Sentences',
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

  const [practiced, setPracticed] = useState(false);
  const { profile, setProfile } = useProfile();

  // Variables to traverse through pages and update completed
  let nextPage = -1;
  let prevPage = -1;
  let topicIndex = -1;
  let avalibleLessons = [];

  // States for marking completion.
  const [correctAmount, setCorrectAmount] = useState(0);
  const [isCurrentCorrect, setCurrentCorrect] = useState(false);
  const [isLessonComplete, setLessonComplete] = useState(false);
  const [amountToComplete, setAmountToComplete] = useState(completionRequirements[level])
  const [attempts, setAttempts] = useState(0);

  const [spanishSentence, setSpanishSentence] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const lastParams = useRef({ topic: null, lesson: null, level: null });
  const [amountToPracticeSession, setAmountToPracticeSession] = useState(3);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);

  // How off is the user allowed to be before moving on to the next sentence.
  const allowedError = .5;

  // Uses the lessonCategories file to find out what the previous and next lessons are.
  for (const key in lessonCategories){
    if(lessonCategories[key].id == topic) {
      avalibleLessons = lessonCategories[key].lessons
      topicIndex = key

      for (const idx in avalibleLessons) {
        if(avalibleLessons[idx]["value"] == lesson)  {
          nextPage = Number(idx) + 1
          prevPage = Number(idx) - 1

          if(nextPage >= avalibleLessons.length) {
            nextPage = -1
          }

        }
      }
    }
  }
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

      fetchSentence();

      lastParams.current = { topic, lesson, level };
    }
  }, [topic, lesson, level]);

  useEffect(() => {
    // User has completed the lesson, updates local storage and performs api calls.
    if(amountToComplete == correctAmount) {
      completeTopic();
    }
  }, [correctAmount])

  useEffect(() => {

    if(amountToPracticeSession == 0) {
      completePracticeSession();
      setAmountToPracticeSession(3)
    }
  }, [amountToPracticeSession])


  const fetchSentence = async () => {

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
          let amountCorrect = 0;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i+1] == "true") {
              html += `<span style="color:green">${arr[i]}</span>`;
              amountCorrect += 1
            }
            else {
              html += `<span style="color:red">${arr[i]}</span>`;
            }
            i++;
          }

          setAttempts(prev => {
            const newAttempts = prev + 1
            return newAttempts
          })

          //console.log(amountCorrect / generatedSentence.length)
          setCurrentAccuracy(prev => {
            console.log(prev)
            return (prev + (amountCorrect / generatedSentence.length))
          })
          //console.log(amountCorrect / generatedSentence.length)

          if((amountCorrect >= generatedSentence.length * allowedError) && (generatedSentence.length == spanishSentence.length)) {
            if(!isLessonComplete && !isCurrentCorrect) handleCorrectAnswer();
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
    handleActivityHistory();
  };

  const handleActivityHistory = async () => {

    let activity = `Practiced ${topic} lesson ${lesson}, at ${level} difficulty.`;
    activity = activity.replace(/_/g, " ");
    
    if(!practiced) {
      try {
        let cur = [...(profile.activities ?? [])]
        while (cur.length >= 3) {
            cur.shift();
          }
        cur.push(activity)
        const updated = {...profile, activities: cur}
        setProfile(updated, user.uid)

        setPracticed(true)
        // Store attempt in activity history.
        await api.patch(`/updateActivityHistory?uid=${user.uid}&activity=${activity}`)
        // Update activity history in profile context.

      } catch (error) {
        console.log(error)
      }
  }
}

  const handleFinishAndNext = async () => {


    // Save the current lesson and level to localStorage

    if(nextPage <= -1) {
      navigate('/lessons');
    }
    const practicePath = `/lessonsPractice?topic=${topic}&lesson=${[avalibleLessons[nextPage]["value"]]}&level=${level}`;

    if(nextPage > -1) {
      setCorrectAmount(0)
      if(isLessonComplete == true) {
        setAmountToPracticeSession(prevCount => prevCount - 1)
      }
      setLessonComplete(false)
      setCurrentCorrect(false)
      navigate(practicePath)
    }
  };


  const completeTopic = async () => {

    setShowConfetti(true);
    setLessonComplete(true);
    setTimeout(() => {
          setShowConfetti(false);
    } , 10000);

    // Locally stores the current lesson.
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

    try {
      const newLessonsCompleted = profile.lessonsCompleted + 1;
      const currentTotalAccuracy = currentAccuracy / amountToComplete * 100;
      console.log(currentTotalAccuracy)
      const newAccuracy = Math.floor((((profile.accuracyRate * profile.lessonsCompleted) + currentTotalAccuracy) / newLessonsCompleted));
      const completedTopic = lesson + "-" + level
      let cur = [...(profile.chunks ?? [])]

      // If this lesson hasn't already been completed complete it in the backend and update the local storage.
      if(!(completedTopic in (cur[topicIndex] ?? {}))) {
        await sendTopic(newLessonsCompleted, newAccuracy);
        cur[topicIndex] = {
          ...(cur[topicIndex] ?? {}),
          [completedTopic]: true
        }
        const updated = { ...profile, chunks: cur, lessonsCompleted: newLessonsCompleted, accuracyRate: newAccuracy}

        setProfile(updated, user.uid)
        }

    } catch (error) {
      console.log(error);
    }
  };

  const completePracticeSession = async () => {
    try {
      const sessions = profile.practiceSessions + 1;
      api.patch(`/updatePracticeSessions?uid=${user.uid}&new_session_value=${sessions}`);
      const updated = { ...profile, practiceSessions: sessions}
      setProfile(updated, user.uid)

    } catch (error) {
      console.log(error)
    }
  };

  // Function to mark topic as completed in backend.
  const sendTopic = async (newLessonsCompleted, newAccuracy) => {
    try {
      await api.patch(`/updateChunkProgress?uid=${user.uid}&chunk=${lesson}&lesson=${topicIndex}&difficulty=${level}`);
      await api.patch(`/updateCompletedLessons?uid=${user.uid}&new_lesson_value=${newLessonsCompleted}`);
      await api.patch(`/updateAccuracy?uid=${user.uid}&new_accuracy=${newAccuracy}`);
    } catch (error) {
      console.log(error)
    }
  }

  // Navigates to the previous page.
  const handlePrevious = () => {
    navigate('/lessons');
    /*
    if (prevPage <= -1){
      navigate('/lessons');
    } else {
      const practicePath = `/lessonsPractice?topic=${topic}&lesson=${[avalibleLessons[prevPage]["value"]]}&level=${level}`;
      setCorrectAmount(0)
      if(isLessonComplete == true) {
        setAmountToPracticeSession(prevCount => prevCount - 1)
      }
      setCurrentCorrect(false)
      navigate(practicePath)
    }
    */
  };

  // Adds another answer to the amount of correct ones.
  const handleCorrectAnswer = () => {
    setCorrectAmount(prev => {
      setCurrentCorrect(true)
      const updated = prev + 1
      return updated;
    })
  }

  // Resets the current attempts and fetches a new sentence.
  const handleNextSentence = () => {
    setAttempts(0);
    setCurrentCorrect(false);
    fetchSentence();
    setSelectedText(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showConfetti && <Confetti />}
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col items-center">
        {/* Lesson Header */}
        <div className="w-full max-w-3xl mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{lessonTitle}</h1>
          <div className="flex items-center justify-center md:justify-between text-sm text-muted-foreground">
            <div className="flex items-center justify-center">
              <FaClock className="mr-1.5" />
              <span>{estimatedTime}</span>
            </div>
            <span >{correctAmount}/{amountToComplete}</span>
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
            
              { attempts > 5 && !isLessonComplete && (
              <Button onClick={handleNextSentence}>
                Skip?
              </Button>
              )}

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
            {isCurrentCorrect && !isLessonComplete && (
            <Button className={"cursor-pointer"} onClick={handleNextSentence}>
              Next Sentence
            </Button>
            )}
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