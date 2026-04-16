import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaHighlighter, FaVolumeUp } from 'react-icons/fa';

import api, { renderBridge } from '../api.js';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useProfile } from '@/profileContext.jsx';
import { lessonCategories } from '@/lessonCategories.js';
import { completionRequirements } from '@/lessonCategories.js';
import { toast } from 'sonner';
import correctFile from '@/assets/sounds/correct.mp3';
//import correctConfetti from 'canvas-confetti';
//import correctConfetti from 'https://cdn.skypack.dev/canvas-confetti';
import { studyStreakHandler } from '../studyStreak.js';

const generateLessonData = (topic, lesson, level) => {
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

  let title = `${category.title}: ${lessonInfo.label}`;
  if (levelInfo.label) {
    title += ` - ${levelInfo.label}`;
  }

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

const [dimensions, setDimensions] = useState({ 
  width: window.innerWidth, 
  height: window.innerHeight 
});

useEffect(() => {
  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const topic = searchParams.get('topic');
  const lesson = searchParams.get('lesson');
  const level = searchParams.get('level');

  const currentLessonData = generateLessonData(topic, lesson, level);
  const { title: lessonTitle, phraseSpanish } = currentLessonData;

  const [selectedText, setSelectedText] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [hasHighlightedText, setHasHighlightedText] = useState(false);
  const [feedbackHTML, setFeedbackHTML] = useState(null); // STABILITY FIX

  const [practiced, setPracticed] = useState(false);
  const { profile, setProfile } = useProfile();

  let nextPage = -1;
  let prevPage = -1;
  let topicIndex = -1;
  let avalibleLessons = [];

  const [correctAmount, setCorrectAmount] = useState(0);
  const [isCurrentCorrect, setCurrentCorrect] = useState(false);
  const [isLessonComplete, setLessonComplete] = useState(false);
  const [amountToComplete, setAmountToComplete] = useState(completionRequirements[level]);
  const [attempts, setAttempts] = useState(0);
  const [uses, setUses] = useState(0);

  const handlePlayAudio = (text) => {
    if (!text || !window.speechSynthesis) {
      console.error("Speech synthesis not supported or no text provided.");
      return;
    }

    window.speechSynthesis.cancel();
    let sentence = text + " ";
    const regexIntervocalicD = /([aeiouáéíóúy])d([aeiouáéíóúy])/ig;
    const regexPreconsonantS = /([\p{Letter}\p{Mark}])s([bcdfgjklmnñpqrtvwxz])/ig;
    const regexPreconsonantR = /([aeiouyáéíóú])r([bcdfghjklmnñpqstvwxz])/ig;
    const regexFinalSD = /([sd])([\s\p{P}])/ig;

    const regexSoftC = /c([eiéíy])/ig;
    let array = [];
    let replacement = "";
    let lang = "es-MX";
    switch (lesson) {
      case "spain":
        lang = "es-ES";
        break;
      case "mexico":
        lang = "es-MX";
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        break;
      case "argentina":
        lang = "es-AR";
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        break;
      case "caribe":
        array = [...text.matchAll(regexIntervocalicD)];
        for (let group of array) {
          replacement = group[1] + " " + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexPreconsonantS)];
        for (let group of array) {
          replacement = group[1] + "h " + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexFinalSD)];
        for (let group of array) {
          replacement = "h" + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexPreconsonantR)];
        for (let group of array) {
          replacement = group[1] + "l" + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        lang = "es-PR";
        break;
      default:
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        lang = "es-MX";
    }
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = lang;
    utterance.rate = 0.8;
    console.log(sentence);
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

  const allowedError = .5;

  const correctSFX = new Audio(correctFile);

  const delimiters = " ?!.,:;()[]{}¡¿…";

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
    setSelectedText(null);
    setHasHighlightedText(false);
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
    if(amountToComplete === correctAmount) {
      completeTopic();
    }
  }, [correctAmount]);

  useEffect(() => {
    if(amountToPracticeSession === 0) {
      completePracticeSession();
      setAmountToPracticeSession(2);
    }
  }, [amountToPracticeSession]);

  useEffect(() => {
    if(!profile?.lastLogin) return;

    if(!studyStreakChecked) {
      const action = studyStreakHandler(profile.lastLogin);
      const newStudyStreak = profile.studyStreak + 1;
      console.log(action);
      handleStudyStreakUpdate(action, newStudyStreak);
      setStudyStreakChecked(true);
    }
  }, [profile?.lastLogin]);

  const setFeedbackBox = (string) => {
    setFeedbackHTML(string);
  };

  const handlePrevious = () => {
    navigate('/lessons');
  };

  const setQuestionStatus = (isSentenceCorrect, isWordCorrect) => {
    if(isSentenceCorrect) {
     // toast.success("Correct! Well done!", { duration: 3000 });
      correctSFX.play();
      
      setFeedbackBox("<span class='text-green-500 font-bold'>Correct!</span>");
    } else if(selectedText && isWordCorrect) {
      toast.success("Correct word! Try the whole sentence again or pick a new word!", { duration: 4000 });
      correctSFX.play();
      
      setFeedbackBox("<span class='text-green-500 font-bold'>Correct word!</span>");
    } else {
      setFeedbackBox("<span class='motion-preset-pulse motion-duration-2000 text-red-500 font-bold'>Try Again</span>");
    }
  };

  const fetchSentence = async () => {
    setLoading(true);
    setSpanishSentence("");
    setFeedbackBox(null);
    setSelectedText(null); 
    setHasHighlightedText(false); 
    try {
      const res = await fetch(
        `${API_URL}/generateSentence?chunk=${topic}&lesson=${lesson}&difficulty=${level}`,
        { method: "POST" }
      );
      let data = await res.text();
      data = data.replace(/^"|"$/g, "");
      setSpanishSentence(data);
      const words = parseSentence(data);
      setSentenceWords(words);
    } catch (err) {
      setSpanishSentence("Error generating sentence.");
    }
    setLoading(false);
  };

  const parseSentence = (sentence) => {
    let parsedSentence = {};
    let currentWord = '';
    for(let i = 0; i < sentence.length; i++) {
      if(isDelimiter(sentence[i])) {
        if(currentWord !== '') parsedSentence[currentWord] = false;
        currentWord = '';
      } else {
        currentWord += sentence[i];
      }
    }
    if(currentWord !== '') {
      parsedSentence[currentWord] = false;
    }
    return parsedSentence;
  };

  const isDelimiter = (char) => {
    return delimiters.includes(char);
  };

  const handleCaptureSelection = () => {
    const selection = window.getSelection().toString();
    if (selection) {
      const cleanedText = selection
        .replace(/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúñÑüÜ]/gi, '')
        .trim();
      if (cleanedText) {
        setSelectedText(cleanedText);
      }
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection().toString().trim();
      setHasHighlightedText(selection.length > 0);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

const sendAudioToServer = (blob) => {
    setFeedbackBox("Pronunciation Checking Processing...");
    const reader = new FileReader();

    reader.onloadend = async () => { 
      const base64data = reader.result.split(",")[1];
      const generatedSentence = selectedText ? selectedText : spanishSentence;
      let dialect = (topic === "accent_marks") ? topic : lesson;

      const payload = { 
        base64_data: base64data, 
        sentence: generatedSentence, 
        dialect: dialect
      };

      try {
  
        console.log("Current Bridge URL:", renderBridge.defaults.baseURL);
        const azureResponse = await renderBridge.post("/analyze", payload);

      

        const results = azureResponse.data;

        const failedLetters = results
          .filter(item => item[1] === "False")
          .map(item => item[0]);

          console.log("Failed Letters for Coaching:", failedLetters);
        const coachingResponse = await api.post("/get-coaching", {
          failed_letters: failedLetters,
          sentence: generatedSentence,
          dialect: dialect
        });
        
        let html = "";
        const correctWords = { ...sentenceWords }; 
        let amountCorrect = 0;
        let lettersCorrect = 0;
        let word = '';
        let wordStatus = false;

        
        results.forEach((arrItem) => {
          const [letter, isPronouncedCorrect, isStressedCorrect] = arrItem;
          
          html += (isPronouncedCorrect === "True" ? `<span class="text-green-500">` : `<span class="text-red-500">`);
          amountCorrect += (isPronouncedCorrect === "True" ? 1 : 0);
          html += (isStressedCorrect === "False" ? `<u>` : "");
          html += letter;
          html += (isStressedCorrect === "False" ? `</u>` : "");
          html += "</span>";

          if(isDelimiter(letter)) {
            if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) correctWords[word] = true;
            word = '';
            lettersCorrect = 0;
          } else {
            word += letter;
            lettersCorrect += (isPronouncedCorrect === "True" ? 1 : 0);
          }
        });

        
        if(word !== '') {
          if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) {
            correctWords[word] = true;
            wordStatus = true;
          }
        }


        setSentenceWords(correctWords);
        setUses(prev => prev + 1);
        setAttempts(prev => prev + 1);
        setCurrentAccuracy(prev => prev + (amountCorrect / generatedSentence.length));

        const isSentenceFullyPronounced = !Object.values(correctWords).includes(false);

        if(isSentenceFullyPronounced) {
          if(!isLessonComplete && !isCurrentCorrect) handleCorrectAnswer();
        } else {
          setQuestionStatus(false, wordStatus);
        }

        const finalHtml = `${html}<div class='mt-4 text-[20px] italic text-[var(--brand-gold)]'>${coachingResponse.data.coach_tip}</div>`;
        setFeedbackBox(finalHtml);

      } catch (error) {
        console.error("Evaluation flow failed:", error);
        setFeedbackBox("<span class='text-red-500'>Connection error. Please check your network.</span>");
      }

    };
  
    reader.readAsDataURL(blob);
  };


  const handleAudioRecording = async (blob) => {
    setFeedbackBox("Processing...");
    setRecordedAudio(blob);
    sendAudioToServer(blob);
    handleActivityHistory();
  };

  const handleActivityHistory = async () => {
    let activity = `Practiced ${topic} lesson ${lesson}, at ${level} difficulty.`;
    activity = activity.replace(/_/g, " ");

    if(!practiced) {
      try {
        let cur = [...(profile.activities ?? [])];
        while (cur.length >= 3) {
            cur.shift();
          }
        cur.push(activity);
        const updated = {...profile, activities: cur};
        setProfile(updated, user.uid);
        await api.patch(`/updateActivityHistory?uid=${user.uid}&activity=${activity}`);
        setPracticed(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleStudyStreakUpdate = async (action, newStudyStreak) => {
    switch (action) {
      case 'updateStudyStreak': {
        try {
          api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${newStudyStreak}`);
          const updated = { ...profile, studyStreak: newStudyStreak, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)};
          setProfile(updated, user.uid);
          toast(`Congrats, you've hit a study streak of ${newStudyStreak}!`);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case 'updateLastLogin': {
        try {
          api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${0}`);
          const updated = { ...profile, studyStreak: 0, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)};
          setProfile(updated, user.uid);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleFinishAndNext = async () => {
    if(nextPage <= -1) {
      navigate('/lessons');
      return;
    }
    const practicePath = `/lessonsPractice?topic=${topic}&lesson=${[avalibleLessons[nextPage]["value"]]}&level=${level}`;

    if(nextPage > -1) {
      setFeedbackBox(null);
      setCurrentAccuracy(0);
      setCorrectAmount(0);
      setSentenceWords({});
      setUses(0);
      if(isLessonComplete) {
        setAmountToPracticeSession(prevCount => prevCount - 1);
      }
      setLessonComplete(false);
      setCurrentCorrect(false);
      navigate(practicePath);
    }
  };

  const completeTopic = async () => {
    toast("Congratulations! You've completed this topic.");
    setShowConfetti(true);
    setLessonComplete(true);
    setTimeout(() => {
          setShowConfetti(false);
    } , 10000);

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
      const currentTotalAccuracy = (currentAccuracy / uses) * 100;
      const newAccuracy = Math.floor((((profile.accuracyRate * profile.comboCount) + currentTotalAccuracy) / newComboCount));
      
      // Ensure the key is lowercase to avoid matching errors
      const currentLessonLower = lesson.toLowerCase();
      const currentLevelLower = level.toLowerCase();
      const completedTopicKey = `${currentLessonLower}-${currentLevelLower}`;
      
      let cur = { ...(profile.completedCombos ?? {}) };
      // If this combo hasn't been completed before
      if (!(completedTopicKey in (cur[topicIndex] ?? {}))) {
        await sendTopic(newComboCount, newAccuracy);
        
        cur[topicIndex] = {
          ...(cur[topicIndex] ?? {}),
          [completedTopicKey]: true
        };

        let newTrophies = [...(profile.trophies ?? [])];
        
        if (topicIndex === 0) {
          const vowelList = ['a', 'e', 'i', 'o', 'u'];
          
          // Check if EVERY vowel exists in cur[0] for the CURRENT level
          const allVowelsDone = vowelList.every(v => {
            const key = `${v}-${currentLevelLower}`;
            return cur[0] && cur[0][key] === true;
          });

          const trophyName = `vowels-${currentLevelLower}`;

          if (allVowelsDone && !newTrophies.includes(trophyName)) {
            newTrophies.push(trophyName);
            toast.success(`🏆 Unlocked: ${level.toUpperCase()} Vowels Trophy!`, {
              style: {
                boxShadow: '0px 10px 30px rgba(0,0,0,0.5), 0px 0px 40px var(--brand-gold)',
              }
            });
            
            // Persist to DB
            await api.patch(`/updateTrophies?uid=${user.uid}&trophy=${trophyName}`);
          }
        }

        const updated = { 
          ...profile, 
          completedCombos: cur, 
          comboCount: newComboCount, 
          accuracyRate: newAccuracy,
          trophies: newTrophies 
        };
        setProfile(updated, user.uid);
      }
    } catch (error) {
      console.log("Trophy Error:", error);
    }
  };

  const completePracticeSession = async () => {
    try {
      const sessions = profile.practiceSessions + 1;
      api.patch(`/updatePracticeSessions?uid=${user.uid}&new_session_value=${sessions}`);
      const updated = { ...profile, practiceSessions: sessions};
      setProfile(updated, user.uid);
    } catch (error) {
      console.log(error);
    }
  };

  const sendTopic = async (newComboCount, newAccuracy) => {
    try {
      await api.patch(`/updateCompletedCombos?uid=${user.uid}&lesson=${lesson}&topic=${topicIndex}&level=${level}`);
      await api.patch(`/updateComboCount?uid=${user.uid}&new_combo_count=${newComboCount}`);
      await api.patch(`/updateAccuracy?uid=${user.uid}&new_accuracy=${newAccuracy}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCorrectAnswer = () => {
    setCorrectAmount(prev => {
      let updated = prev;
      if(!isCurrentCorrect) updated = prev + 1;
      setCurrentCorrect(true);
      setQuestionStatus(true);
      return updated;
    });
  };

  const handleNextSentence = () => {
    setAttempts(0);
    setCurrentCorrect(false);
    setFeedbackBox(null);
    fetchSentence();
    setSentenceWords({});
    setSelectedText(null); 
  };

  const handeRestoreSentence = () => {
    setFeedbackBox(null)
    setSelectedText(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 relative bg-[var(--bg-main)] transition-all duration-500 overflow-x-hidden lesson-content-container">
    {showConfetti && (
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        recycle={false} // Stops it from looping forever
        numberOfPieces={300}
        gravity={0.2} // Makes it fall slightly slower 
        style={{
          position: 'fixed', // Use fixed to ensure it ignores scroll/container height
          top: 0,
          left: 0,
          zIndex: 1000 // Ensure it's on top of all cards
        }}
      />
    )}
      <div className="absolute top-[-5%] right-[-10%] w-[400px] h-[400px] blur-[150px] rounded-full opacity-10 bg-[var(--brand-gold)] pointer-events-none" />
  
      <main className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        
        <div className="w-full mb-10 px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <span className="text-[var(--brand-gold)] text-[20px] font-black uppercase tracking-[0.4em] mb-2 block opacity-70">
              Training Module
            </span>
            <h1 className="text-4xl md:text-5l font-black text-[var(--text-main)] tracking-tighter leading-tight" suppressHydrationWarning>
              {lessonTitle}
            </h1>
          </div>
  
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-8 py-4 rounded-[30px] shadow-xl w-full text-center whitespace-nowrap">
              <span className="text-[10px] font-black text-[var(--brand-gold)] uppercase mr-3 tracking-widest">Progress</span>
              <span className="text-2xl font-black text-[var(--text-main)]">
                {correctAmount} <span className="opacity-20 mx-1">/</span> {amountToComplete}
              </span>
            </div>
          </div>
        </div>
  
        <Card className="w-full rounded-[60px] p-8 md:p-16 border-2 bg-[var(--bg-card)] border-[var(--border-color)] shadow-2xl transition-all duration-500 min-h-[500px] flex flex-col">
          <CardContent className="p-0 flex flex-col items-center flex-grow space-y-12">
            
            <div className="text-center w-full relative">
              <div 
                className="text-4xl md:text-6xl font-black leading-tight text-[var(--text-main)] tracking-tight min-h-[160px] max-w-4xl mx-auto flex items-center justify-center transition-all duration-300" 
                id="sentenceBox"
                suppressHydrationWarning
              >
                {loading ? (
                  <span className="animate-pulse opacity-20 tracking-tighter">GENERATING...</span>
                ) : (
                    feedbackHTML ? (
                        <div dangerouslySetInnerHTML={{ __html: feedbackHTML }} key="feedback-active" />
                    ) : (
                        <span key="sentence-plain">{spanishSentence}</span>
                    )
                )}
              </div>
  
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button
                  onClick={() => handlePlayAudio(spanishSentence)}
                  disabled={loading || isSpeaking}
                  className="h-20 w-20 rounded-full bg-[var(--brand-gold)] text-black hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                  <FaVolumeUp size={28} />
                </Button>
                
                <Button 
                  onClick={handleNextSentence} 
                  variant="ghost" 
                  disabled={loading}
                  className="h-20 px-8 rounded-full border-2 border-[var(--border-color)] text-[var(--text-main)] font-black hover:bg-white/5 uppercase text-xs tracking-widest"
                >
                  Regenerate Sentence
                </Button>
  
                {selectedText && (
                  <Button 
                    onClick={handeRestoreSentence} 
                    variant="ghost" 
                    className="h-20 px-8 rounded-full border-2 border-[var(--brand-gold)] text-[var(--brand-gold)] font-black hover:bg-[var(--brand-gold)] hover:text-black transition-all uppercase text-xs tracking-widest"
                  >
                    Restore Full
                  </Button>
                )}
              </div>
  
              <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                  Isolation Mode: Highlight text above to practice specific fragments
                </p>
                <Button
                  onClick={handleCaptureSelection}
                  disabled={!hasHighlightedText}
                  className={`rounded-full px-10 py-7 font-black transition-all uppercase text-xs tracking-[0.2em] ${
                    hasHighlightedText 
                    ? "bg-white text-black scale-105 shadow-2xl border-none" 
                    : "bg-white/5 text-white/20 border-2 border-white/5 cursor-not-allowed"
                  }`}
                >
                  <FaHighlighter className="mr-3" />
                  Practice Selection
                </Button>
              </div>
            </div>
  
            <div className="w-full max-w-2xl p-10 rounded-[40px] bg-[var(--bg-main)] border-2 border-[var(--border-color)] relative shadow-inner">
              <AudioRecorder onRecordingComplete={handleAudioRecording} />
              {selectedText && (
                <div className="mt-8 text-center animate-in fade-in zoom-in-95 duration-500">
                  <span className="text-[10px] font-black uppercase text-[var(--brand-gold)] tracking-[0.3em]">Currently Targeting</span>
                  <p className="text-3xl font-black text-[var(--text-main)] mt-2 tracking-tighter italic">"{selectedText}"</p>
                </div>
              )}
            </div>
  
            <div className="w-full pt-4">
              <h3 className="text-center font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-8 opacity-80">
                Remaining Targets
              </h3>
              <div className="flex flex-wrap gap-4 justify-center min-h-[60px]">
                {Object.entries(sentenceWords)
                  .filter((([, value]) => value === false))
                  .map(([key], idx) => (
                    <button 
                      key={`word-${key}-${idx}`} 
                      onClick={() => setSelectedText(key)}
                      className="px-8 py-4 rounded-[20px] bg-white/5 border-2 border-[var(--border-color)] text-[var(--text-main)] font-black text-sm hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] hover:bg-white/5 hover:scale-105 transition-all active:scale-95 shadow-sm"
                    >
                      {key}
                    </button>
                  ))}
              </div>
            </div>
  
            {isCurrentCorrect && !isLessonComplete && (
              <Button 
                onClick={handleNextSentence}
                className="w-full py-12 rounded-[30px] bg-[var(--brand-gold)] text-black text-3xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
              >
                Next Sentence
              </Button>
            )}

            {isLessonComplete && (
                <Button 
                    onClick={handleFinishAndNext}
                    className="w-full py-12 rounded-[30px] bg-green-500 text-black text-3xl font-black shadow-xl"
                >
                    Finish Lesson
                </Button>
            )}
          </CardContent>
        </Card>
        {}
        <div className="w-full max-w-4xl mt-16 flex justify-between items-center px-4 pb-12">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="text-[var(--text-muted)] font-black hover:text-[var(--text-main)] transition-colors uppercase text-[10px] tracking-[0.2em]"
          >
            <FaArrowLeft className="mr-4" /> Exit Session
          </Button>

          <Button
            onClick={handleFinishAndNext}
            className="rounded-full px-10 py-7 bg-[var(--brand-gold)] text-black font-black hover:scale-105 active:scale-95 transition-all shadow-xl uppercase text-[10px] tracking-[0.2em] border-none"
          >
            Next Lesson <FaArrowRight className="ml-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LessonsPracticePage;