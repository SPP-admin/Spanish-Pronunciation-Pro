import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaHighlighter, FaVolumeUp } from 'react-icons/fa'; 
import api from '../api.js';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useProfile } from '@/profileContext.jsx';


import { lessonCategories } from '@/lessonCategories.js';
import { completionRequirements } from '@/lessonCategories.js';
import { toast } from 'sonner';
import correctFile from '@/assets/sounds/correct.mp3';
import correctConfetti from 'https://cdn.skypack.dev/canvas-confetti';
import { studyStreakHandler } from '../studyStreak.js';

// --- Dynamic Lesson Data Generation ---
const generateLessonData = (topic, lesson, level) => {
  // Find the category and lesson info
  const category = lessonCategories.find(cat => cat.id === topic);
  if (!category) {
    return {
      title: "Practice Session",
      phraseSpanish: "¡Hola! ¿Cómo estás?",
    };
  }

  const lessonInfo = category.lessons.find(l => l.value === lesson);
  const levelInfo = category.levels.find(l => l.value === level);
  
  if (!lessonInfo || !levelInfo) {
    return {
      title: "Practice Session",
      phraseSpanish: "¡Hola! ¿Cómo estás?",
    };
  }

  // Generate dynamic title
  let title = `${category.title}: ${lessonInfo.label}`;
  if (levelInfo.label) {
    title += ` - ${levelInfo.label}`;
  }

  // Generate sample phrases based on category and lesson
  let phraseSpanish = "";

  switch (topic) {
    case "vowels":
      phraseSpanish = `Practice the vowel "${lessonInfo.label}"`;
      break;
    case "consonants":
      if (lesson === "soft_consonants") {
        phraseSpanish = "ceci cine zapato";
      } else if (lesson === "hard_consonants") {
        phraseSpanish = "perro gato zapato";
      } else {
        phraseSpanish = "Practice consonant combinations";
      }
      break;
    case "unique_sounds":
      phraseSpanish = `Practice the "${lessonInfo.label}" sound`;
      break;
    case "special_vowel_combinations":
      phraseSpanish = `Practice "${lessonInfo.label}" combinations`;
      break;
    case "accent_marks":
      phraseSpanish = "Practice words with accent marks";
      break;
    case "regional_differences":
      phraseSpanish = `Practice ${lessonInfo.label} pronunciation`;
      break;
    default:
      phraseSpanish = "¡Hola! ¿Cómo estás?";
  }

  return {
    title,
    phraseSpanish,
  };
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
  const currentLessonData = generateLessonData(topic, lesson, level);
  const { title: lessonTitle, phraseSpanish } = currentLessonData;

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
  const [uses, setUses] = useState(0);

  const handlePlayAudio = (text) => {
    if (!text || !window.speechSynthesis) {
      console.error("Speech synthesis not supported or no text provided.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; 
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const [spanishSentence, setSpanishSentence] = useState("");
  const [sentenceWords, setSentenceWords] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastParams = useRef({ topic: null, lesson: null, level: null });
  const [amountToPracticeSession, setAmountToPracticeSession] = useState(2);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [studyStreakChecked, setStudyStreakChecked] = useState(false);

  // How off is the user allowed to be before moving on to the next sentence.
  const allowedError = .5;

  const correctSFX = new Audio(correctFile);

  const delimiters = " ?!.,:;()[]{}¡¿…";

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
      setAmountToPracticeSession(2);
    }
  }, [amountToPracticeSession])

  useEffect(() => {
    if(!profile.lastLogin) return;

    if(!studyStreakChecked) {
    const action = studyStreakHandler(profile.lastLogin); 
    const newStudyStreak = profile.studyStreak + 1;
    console.log(action)
    handleStudyStreakUpdate(action, newStudyStreak);
    setStudyStreakChecked(true);
    }
  }, [profile?.lastLogin])

  const setTranscriptionBox = (string) => {
    const message = `<div>${string}</div>`
    document.getElementById("transcriptionBox").innerHTML = message;
  }

  const setQuestionStatus = (isCorrect) => {
    if(isCorrect) {
      document.getElementById("completionStatus").innerHTML = "<div class= 'motion-preset-confetti text-green-500'>Correct</div>"
      correctSFX.play();
      correctConfetti();

    } else document.getElementById("completionStatus").innerHTML = "<div class= 'motion-preset-pulse motion-duration-2000 text-red-500'>Try Again</div>"
  }


  const fetchSentence = async () => {
        setLoading(true);
        setSpanishSentence("");
        try {
          const res = await fetch(
            `${API_URL}/generateSentence?chunk=${topic}&lesson=${lesson}&difficulty=${level}`,
            { method: "POST" }
          );
          let data = await res.text();
          data = data.replace(/^"|"$/g, "");
          setSpanishSentence(data);
          const words = parseSentence(data);
          setSentenceWords(words)
        } catch (err) {
          setSpanishSentence("Error generating sentence.");
        }
        setLoading(false);
      };

  const parseSentence = (sentence) => {
    let parsedSentence = {};
    let currentWord = '';
    let wordPosition = 0;

    console.log(sentence)
    for(let i = 0; i < sentence.length; i++) {
      if(isDelimiter(sentence[i])) {
        if(!isDelimiter(currentWord)) parsedSentence[currentWord] = false;
        currentWord = '';
        wordPosition += 1;
      } else {
        currentWord += sentence[i];
      }
    }

    if(currentWord != '') {
      parsedSentence[currentWord] = false;
    }
    console.log(parsedSentence)

    return parsedSentence;
  }

  const isDelimiter = (char) => {
    if(delimiters.includes(char)) return true;
    return false;
  }

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
    setTranscriptionBox("Pronunciation Checking Processing...");
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
  
      // Build the JSON payload.
      const generatedSentence = selectedText ? selectedText: spanishSentence;
      const payload = { base64_data: base64data, sentence: generatedSentence, dialect: topic};
      console.log(payload)
      fetch(`${API_URL}/checkPronunciation`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      })
        .then(response => {
          if (!response.ok) {
            console.log(response.statusText);
            setTranscriptionBox("Error completeing pronunciation checking, please try again.");
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
          const correctWords = sentenceWords;
          let amountCorrect = 0;
          let lettersCorrect = 0;
          let word = '';

          for (let i = 0; i < arr.length - 2; i++) {

            html += (arr[i+1] == "True" ? `<span style="color:green">` : `<span style="color:red">`);
                amountCorrect += (arr[i+1] == "True" ? 1 : 0);
            html += (arr[i+2] == "False" ? `<u>` : "");
                html += arr[i];
                html += (arr[i+2] == "False" ? `</u>` : "");
                html += "</span>";


            if(isDelimiter(arr[i])) {
                if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) correctWords[word] = true;
                word = '';
                lettersCorrect = 0;
            } else {
                word += arr[i];
                lettersCorrect += (arr[i+1] == "True" ? 1 : 0);
            }
            i+=2;
          }

          if(word != '') {
            console.log(lettersCorrect)
                if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) correctWords[word] = true;
          }

          console.log(correctWords)

          setSentenceWords(sentenceWords)

          setUses(prev => {
            const newUses = prev + 1
            console.log("Uses:" + newUses)
            return newUses
          })

          setAttempts(prev => {
            const newAttempts = prev + 1
            return newAttempts
          })

          //console.log(amountCorrect / generatedSentence.length)
          setCurrentAccuracy(prev => {
            const newAccuracy = prev + (amountCorrect / generatedSentence.length)
            console.log("currentAccuracy:" + newAccuracy)
            return newAccuracy
          })
          //console.log(amountCorrect / generatedSentence.length)

          if(!Object.values(sentenceWords).includes(false)) {
            if(!isLessonComplete && !isCurrentCorrect) handleCorrectAnswer();
          } else setQuestionStatus(false)
          console.log(html);
          document.getElementById("transcriptionBox").innerHTML = html;
        })

        .catch(error => console.error("Error sending audio:", error));
    };
    reader.readAsDataURL(blob);
  };
  // This function is passed as callback to the AudioRecorder component.
  const handleAudioRecording = async (blob) => {
    document.getElementById("completionStatus").innerHTML = ""
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

  const handleStudyStreakUpdate = async (action, newStudyStreak) => {
    switch (action) {
      case 'updateStudyStreak': {
        try {
        api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${newStudyStreak}`);
        const updated = { ...profile, studyStreak: newStudyStreak, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)}
        setProfile(updated, user.uid)
        toast(`Congrats, you've hit a study streak of ${newStudyStreak}!`)
        } catch (error) {
          console.log(error)
        }
        break;
      }
      case 'updateLastLogin': {
        try {
        console.log(profile)
        api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${0}`);
        const updated = { ...profile, studyStreak: 0, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)}
        setProfile(updated, user.uid)
        } catch (error) {
          console.log(error)
        }
        break;
      }
      default:
        break;
    }
  }

  const handleFinishAndNext = async () => {
    // Save the current lesson and level to localStorage
    if(nextPage <= -1) {
      navigate('/lessons');
      return;
    }
    const practicePath = `/lessonsPractice?topic=${topic}&lesson=${[avalibleLessons[nextPage]["value"]]}&level=${level}`;

    if(nextPage > -1) {
      setTranscriptionBox("");
      setCurrentAccuracy(0)
      setCorrectAmount(0)
      setUses(0)
      if(isLessonComplete == true) {
        setAmountToPracticeSession(prevCount => prevCount - 1)
      }
      document.getElementById("completionStatus").innerHTML = ""
      setLessonComplete(false)
      setCurrentCorrect(false)
      navigate(practicePath)
    }
  };


  const completeTopic = async () => {

    toast("Congratulations! You've completed this topic. To continue hit the 'Next Lesson' button or choose a new topic from the lessons page.")
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
      const newComboCount = profile.comboCount + 1;
      const currentTotalAccuracy = currentAccuracy / uses * 100;
      const newAccuracy = Math.floor((((profile.accuracyRate * profile.comboCount) + currentTotalAccuracy) / newComboCount));
      console.log("Accuracy updated to " + newAccuracy + "%")
      const completedTopic = lesson + "-" + level
      let cur = [...(profile.completedCombos ?? [])]

      // If this lesson hasn't already been completed complete it in the backend and update the local storage.
      if(!(completedTopic in (cur[topicIndex] ?? {}))) {
        await sendTopic(newComboCount, newAccuracy);
        cur[topicIndex] = {
          ...(cur[topicIndex] ?? {}),
          [completedTopic]: true
        }
        const updated = { ...profile, completedCombos: cur, comboCount: newComboCount, accuracyRate: newAccuracy}

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
  const sendTopic = async (newComboCount, newAccuracy) => {
    try {
      await api.patch(`/updateCompletedCombos?uid=${user.uid}&lesson=${lesson}&topic=${topicIndex}&level=${level}`);
      await api.patch(`/updateComboCount?uid=${user.uid}&new_combo_count=${newComboCount}`);
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
      let updated = prev;
      if(!isCurrentCorrect) updated = prev + 1;
      setCurrentCorrect(true)
      setQuestionStatus(true)
      return updated;
    })
  }

  // Resets the current attempts and fetches a new sentence.
  const handleNextSentence = () => {
    setAttempts(0);
    setCurrentCorrect(false);
    setTranscriptionBox("");
    document.getElementById("completionStatus").innerHTML = ""
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
            <span>Number until lesson completion: {correctAmount}/{amountToComplete}</span>
          </div>
        </div>

          {/* Main Content Card */}
        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-6 md:p-8 flex flex-col items-center space-y-6">
            <div className="text-center w-full">
              {/* Container for sentence and play button */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <p className="text-3xl md:text-4xl font-bold text-black mb-3 select-text">
                  {loading ? "Loading..." : spanishSentence}
                </p>
                {/* New button to play audio */}
                <Button 
                  onClick={() => handlePlayAudio(spanishSentence)} 
                  disabled={loading || isSpeaking}
                  variant="outline" 
                  size="icon"
                  aria-label="Play audio pronunciation"
                >
                  <FaVolumeUp className="h-5 w-5" />
                </Button>
              </div>

              {/* Button to capture the highlighted text */}
              <Button onClick={handleCaptureSelection} variant="outline" size="sm">
                <FaHighlighter className="mr-2 h-4 w-4" />
                Practice Highlighted Text
              </Button>

            </div>
            {/* Recorder */}
            <AudioRecorder onRecordingComplete={handleAudioRecording} />
            
              <Button onClick={handleNextSentence}>
                Regenerate?
              </Button>

              <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
                Words to say correctly: 
                {Object.entries(sentenceWords)
                .filter((([key, value]) => value === false))
                .map(([key]) => {
                  return <div key={key}>{key}</div>
                })}
              </div>
            {/* Feedback Field now uses selectedText */}
            <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
              <p className="text-md text-muted-foreground">
                {selectedText
                  ? `Now practicing: "${selectedText}". Record your pronunciation.`
                  : "Practice this word/sentence, or highlight text and click 'Practice' to begin."}
              </p>
            </div>
			{/* Extra feedback field */}
			<div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded text-center w-full min-h-[50px]">
              <p className="text-md text-muted-foreground" id="transcriptionBox">
              </p>
            </div>
                  
            <span className="" id="completionStatus">
            </span>

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